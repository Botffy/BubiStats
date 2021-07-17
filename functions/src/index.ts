import * as functions from "firebase-functions";
import * as admin from 'firebase-admin'
import { FirestoreRide, ValidationError, RideField } from './dto'

admin.initializeApp()

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

const validateNoOverlap = (ride: FirestoreRide, existing: FirestoreRide[]): ValidationError[] => {
  const errors: ValidationError[] = []

  let len = existing.length
  for (let i = 0; i < len; ++i) {
    const existingEnd = existing[i].when + existing[i].sec * 1000
    if (ride.when <= existingEnd && ride.when + ride.sec * 1000 >= existing[i].when) {
      errors.push({ field: RideField.when, message: 'Erre az időpontra már vettél fel bubizást.' })
      break
    }
  }

  return errors
}

export const addRide = functions.region('europe-central2').https.onCall((data: FirestoreRide, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Must be authenticated')
  }

  const errors = validateRide(data)
  if (errors.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Ride is invalid', errors)
  }

  const db = admin.firestore()
  const uid = context.auth.uid
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

    transaction.set(userDocRef, docValue)
    return Promise.resolve()
  })
})
