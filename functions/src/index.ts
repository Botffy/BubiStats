import * as functions from "firebase-functions";
import * as admin from 'firebase-admin'
import { EditRide, FirestoreRide } from './dto'
import { addRide as addRideInner, addRideByScreenshot as addRideByScreenshotInner, editRide as editRideInner, deleteRide as deleteRideInner, deleteAllRides } from './rides'

admin.initializeApp()

export const addRide = functions.region('europe-central2').https.onCall((data: FirestoreRide, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Must be authenticated')
  }

  return addRideInner(context.auth.uid, data)
})

export const addRideByScreenshot = functions.region('europe-central2').https.onCall((imageId: string, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Must be authenticated')
  }

  return addRideByScreenshotInner(context.auth.uid, imageId)
})


export const editRide = functions.region('europe-central2').https.onCall((data: EditRide, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Must be authenticated')
  }

  return editRideInner(context.auth.uid, data)
})

export const deleteRide = functions.region('europe-central2').https.onCall((data: number, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Must be authenticated')
  }

  return deleteRideInner(context.auth.uid, data)
})

export const deleteUserData = functions.region('europe-central2').auth.user().onDelete((event) => {
  deleteAllRides(event.uid)
})
