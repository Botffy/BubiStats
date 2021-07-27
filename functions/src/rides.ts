import vision from '@google-cloud/vision'
import * as functions from "firebase-functions";
import * as admin from 'firebase-admin'
import { FirestoreRide, ValidationError, RideField, EditRide } from './dto'
import { ride_from_ocr } from './ride-from-ocr';
import { DateTime, Interval } from 'luxon';

const validateRide = (ride: FirestoreRide): ValidationError[] => {
  if (!ride.when || !ride.sec || !ride.from || !ride.to || !ride.bike) {
    throw new functions.https.HttpsError('failed-precondition', 'Malformed data')
  }

  const errors: ValidationError[] = []

  if (ride.when < 1621807200000) {
    errors.push({ field: RideField.when, message: 'Túl korai dátum: az új BuBi 2021 május 24-én indult el (bocs, tesztelők).'})
  }
  else if (ride.when > Date.now()) {
    errors.push({ field: RideField.when, message: 'Ez az időpont a jövőben van.' })
  }

  if (ride.sec < 60) {
    errors.push({ field: RideField.sec, message: 'Túl rövid lenne ez az utazás.' })
  }
  else if (ride.sec > 24*60*60) {
    errors.push({ field: RideField.sec, message: 'Túl hosszú lenne ez az utazás, nem hiszem el neked.' })
  }

  // 2do station validation: existence, existence at time point

  if (ride.bike <= 860000 || ride.bike >= 862000) {
    errors.push({ field: RideField.bike, message: 'A bicaj száma 860000 és 862000 közötti érték lehet.' })
  }

  return errors
}

const validateNoOverlap = (ride: FirestoreRide, existing: FirestoreRide[], disregard?: number): ValidationError[] => {
  const errors: ValidationError[] = []

  let len = existing.length
  for (let i = 0; i < len; ++i) {
    if (disregard === existing[i].when) {
      continue
    }

    const existingEnd = existing[i].when + existing[i].sec * 1000
    if (ride.when <= existingEnd && ride.when + ride.sec * 1000 >= existing[i].when) {
      let iAdding = Interval.fromDateTimes(DateTime.fromMillis(ride.when, { zone: "Europe/Budapest" }), DateTime.fromMillis(ride.when + ride.sec * 1000, { zone: "Europe/Budapest" }))
      let iExisting = Interval.fromDateTimes(DateTime.fromMillis(existing[i].when, { zone: "Europe/Budapest" }), DateTime.fromMillis(existingEnd, { zone: "Europe/Budapest" }))
      let intersection = iAdding.intersection(iExisting)

      errors.push({ field: RideField.when, message:  `Erre az időpontra (${intersection?.start.toFormat("yyyy-LL-dd HH:mm")}) már vettél fel bubizást.` })
      break
    }
  }

  return errors
}

export const addRide = (uid: string, data: FirestoreRide): Promise<FirestoreRide> => {
  const errors = validateRide(data)
  if (errors.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Ride is invalid', errors)
  }

  const db = admin.firestore()
  const userDocRef = db.collection('users').doc(uid)

  return db.runTransaction(async transaction => {
    const userDoc = await transaction.get(userDocRef)

    let docValue
    if (!userDoc.exists) {
      docValue = {
        rides: [data]
      }
    } else {
      const rides: FirestoreRide[] = userDoc.data()?.rides || []
      const overlaps = validateNoOverlap(data, rides)
      if (overlaps.length) {
        throw new functions.https.HttpsError('invalid-argument', 'Overlap', overlaps)
      }

      rides.push(data)
      rides.sort((a, b) => a.when - b.when)
      docValue = {
        rides: rides
      }
    }

    await transaction.set(userDocRef, docValue)
    return Promise.resolve(data)
  })
}

export const addRideByScreenshot = async (uid: string, imageId: string): Promise<FirestoreRide> => {
  const path = `gs://bubistats.appspot.com/user/${uid}/${imageId}`

  const clientOptions = { apiEndpoint: 'eu-vision.googleapis.com' };
  const client = new vision.ImageAnnotatorClient(clientOptions);
  const [result] = await client.textDetection(path);

  return new Promise((resolve, reject) => {
    let text = result.fullTextAnnotation?.text
    if (!text) {
      console.log("no text")
      throw new functions.https.HttpsError('invalid-argument', 'Invalid screenshot', [
        { field: RideField.image, message: 'Nem sikerült szöveget kinyerni a képernyőképből.' }
      ])
    }

    let ride = ride_from_ocr(text)
    if (!ride) {
      console.log("failed parsing")
      throw new functions.https.HttpsError('invalid-argument', 'Invalid screenshot', [
        { field: RideField.image, message: 'Nem sikerült feldolgozni a képernyőképből kinyert szöveget. Rajta voltak a "Kerékpár", "Kezdés" és "Visszaadás" rovatok?' }
      ])
    }

    addRide(uid, ride)
      .then((added) => resolve(added))
      .catch(reject)
  })
}

export const editRide = (uid: string, update: EditRide): Promise<any> => {
  const errors = validateRide(update.updated)
  if (errors.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Ride is invalid', errors)
  }

  const db = admin.firestore()
  const userDocRef = db.collection('users').doc(uid)

  return db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userDocRef);

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'User has no rides')
    }
    const rides: FirestoreRide[] = userDoc.data()?.rides || []
    const matchedRide: FirestoreRide | undefined = rides.find((ride: FirestoreRide) => {
      return ride.when === update.original
    })

    if (!matchedRide) {
      throw new functions.https.HttpsError('invalid-argument', 'A szerkesztett út nincs meg')
    }
    const overlaps = validateNoOverlap(update.updated, rides, update.original)
    if (overlaps.length) {
      throw new functions.https.HttpsError('invalid-argument', 'Overlap', overlaps)
    }

    matchedRide.when = update.updated.when
    matchedRide.sec = update.updated.sec
    matchedRide.bike = update.updated.bike
    matchedRide.from = update.updated.from,
    matchedRide.to = update.updated.to

    transaction.set(userDocRef, {
      rides: rides
    })
    return Promise.resolve()
  })
}

export const deleteRide = (uid: string, rideTime: number): Promise<any> => {
  const db = admin.firestore()
  const userDocRef = db.collection('users').doc(uid)

  return db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userDocRef);

    if (!userDoc.exists) {
      return Promise.reject("User has no rides")
    }
    const rides: FirestoreRide[] = userDoc.data()?.rides || []
    const matchedRide: FirestoreRide | undefined = rides.find((ride: FirestoreRide) => {
      return ride.when === rideTime
    })

    if (!matchedRide) {
      throw new functions.https.HttpsError('invalid-argument', 'A törlendő út nincs meg')
    }

    await transaction.set(userDocRef, {
      rides: userDoc.data()?.rides.filter((ride: FirestoreRide) => {
        return ride.when !== rideTime
      })
    })
    return Promise.resolve()
  })
}

export const deleteAllRides = async (uid: string) => {
  const db = admin.firestore()
  const userDocRef = db.collection('users').doc(uid)
  await userDocRef.delete()
  return Promise.resolve()
}
