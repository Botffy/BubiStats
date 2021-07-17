import * as functions from "firebase-functions";
import * as admin from 'firebase-admin'
import { FirestoreRide, ValidationError, RideField, EditRide } from './dto'

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
      errors.push({ field: RideField.when, message: 'Erre az időpontra már vettél fel bubizást.' })
      break
    }
  }

  return errors
}

export const addRide = (uid: string, data: FirestoreRide): Promise<any> => {
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
    return Promise.resolve()
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

    await transaction.set(userDocRef, {
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
