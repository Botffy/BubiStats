import { getFirebaseApp, getCurrentUserUid, onUserChange } from "./firebase";
import { Unsubscribe } from "@firebase/util";
import { getFirestore, doc, onSnapshot, runTransaction } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Duration, DateTime } from "luxon"
import { Ride } from './model'
import { v4 as uuidv4 } from 'uuid';

type FirestoreRide = {
  when: number,
  sec: number,
  from: string,
  to: string,
  bike: number
}

export enum RideField {
  when = 'when', sec = 'duration', from = 'from', to = 'to', bike = 'bike'
}

export type ValidationError = {
  field: RideField,
  message: string
}

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

export const editRide = (originalTime: DateTime, updated: Ride): Promise<void> => {
  const db = getFirestore()

  const userDocRef = doc(db, "users", getCurrentUserUid())

  return runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);

    if (!userDoc.exists()) {
      return Promise.reject("User has no rides")
    }
    const rides = userDoc.data().rides || [];
    const matchedRide: FirestoreRide = rides.find((ride: FirestoreRide) => {
      return ride.when === originalTime.toMillis()
    })

    if (!matchedRide) {
      return Promise.reject("Edited ride not found")
    }
    matchedRide.when = updated.when.toMillis()
    matchedRide.sec = updated.duration.shiftTo('seconds').seconds,
    matchedRide.bike = updated.bike
    matchedRide.from = updated.from,
    matchedRide.to = updated.to

    transaction.set(userDocRef, {
      rides: rides
    })
    return Promise.resolve()
  })
}

export const addRide = (ride: Ride): Promise<void> => {
  const functions = getFunctions(getFirebaseApp(), "europe-central2")
  const addRide = httpsCallable(functions, 'addRide');

  const mapped: FirestoreRide = {
    when: ride.when.toMillis(),
    sec: ride.duration.shiftTo('seconds').seconds,
    bike: ride.bike,
    from: ride.from,
    to: ride.to
  }

  return addRide(mapped)
    .then((result) => {
      console.log(result)
    })
}

export const deleteRide = (userId: string, rideTime: DateTime): Promise<void> => {
  const db = getFirestore()

  const userDocRef = doc(db, "users", userId)

  return runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);

    if (!userDoc.exists()) {
      return Promise.reject("User has no rides")
    }

    transaction.set(userDocRef, {
      rides: userDoc.data().rides.filter((ride: FirestoreRide) => {
        return ride.when !== rideTime.toMillis()
      })
    })
    return Promise.resolve()
  })
}
