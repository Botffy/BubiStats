import { getFirebaseApp, getCurrentUserUid, onUserChange } from "./firebase";
import { Unsubscribe } from "@firebase/util";
import { getFirestore, doc, onSnapshot, runTransaction } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Duration, DateTime } from "luxon"
import { Ride } from './model'
import { FirestoreRide } from '../functions/src/dto'
import { v4 as uuidv4 } from 'uuid';

const subscribers: Map<string, (ride: Ride[]) => void> = new Map()
let rides: Ride[] | null = null
let firestoreSubscription: Unsubscribe = null

onUserChange((uid: string) => {
  if (!uid && firestoreSubscription) {
    firestoreSubscription()
    rides = null
  }
})

const onData = (data: Ride[]) => {
  rides = data
  subscribers.forEach((callback) => {
    callback(rides)
  })
}

const createFirestoreSubscription = () => {
  const db = getFirestore()

  const userDocRef = doc(db, "users", getCurrentUserUid())
  firestoreSubscription = onSnapshot(userDocRef, (doc) => {
    const data = doc.data()
    if (!data || !data.rides) {
      onData([])
      return
    }

    const rides: Ride[] = (data['rides'] as FirestoreRide[]).map((fs: FirestoreRide) => {
      return {
        when: DateTime.fromMillis(fs.when),
        duration: Duration.fromMillis(fs.sec * 1000),
        bike: fs.bike,
        from: fs.from,
        to: fs.to
      }
    })
    onData(rides)
  })
}

export const subscribe = (callback: (rides: Ride[]) => void): Object => {
  if (!firestoreSubscription) {
    createFirestoreSubscription()
  }

  const id = uuidv4()
  subscribers.set(id, callback)
  callback(rides)
  return id
}

export const unsubscribe = (id: string) => {
  console.log("unsubscribe" + id)
  subscribers.delete(id)
}

const map = (ride: Ride): FirestoreRide => {
  return {
    when: ride.when.toMillis(),
    sec: ride.duration.shiftTo('seconds').seconds,
    bike: ride.bike,
    from: ride.from,
    to: ride.to
  }
}

export const addRide = (ride: Ride): Promise<void> => {
  const functions = getFunctions(getFirebaseApp(), "europe-central2")
  const addRide = httpsCallable(functions, 'addRide');

  return addRide(map(ride))
    .then((result) => {
      console.log(result)
    })
}

export const editRide = (originalTime: DateTime, updated: Ride): Promise<void> => {
  const functions = getFunctions(getFirebaseApp(), "europe-central2")
  const editRide = httpsCallable(functions, 'editRide');
  return editRide({
    original: originalTime.toMillis(),
    updated: map(updated)
  }).then((result) => {
    console.log(result)
  })
}

export const deleteRide = (rideTime: DateTime): Promise<void> => {
  const functions = getFunctions(getFirebaseApp(), "europe-central2")
  const deleteRide = httpsCallable(functions, 'deleteRide');
  return deleteRide(rideTime.toMillis()).then((result) => {
    console.log(result)
  })
}
