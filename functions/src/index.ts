import * as functions from "firebase-functions";
import * as admin from 'firebase-admin'
import { EditRide, FirestoreRide } from './dto'
import { addRide as addRideInner, editRide as editRideInner, deleteRide as deleteRideInner } from './rides'

admin.initializeApp()

export const addRide = functions.region('europe-central2').https.onCall((data: FirestoreRide, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Must be authenticated')
  }

  return addRideInner(context.auth.uid, data)
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
