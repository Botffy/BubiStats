import { getCurrentUserUid } from "./firebase";
import { Unsubscribe } from "@firebase/util";
import { getFirestore, doc, onSnapshot, runTransaction, useFirestoreEmulator } from "firebase/firestore";
import { Duration, DateTime } from "luxon"
import { Ride } from './model'

type FirestoreRide = {
  when: number,
  min: number,
  from: string,
  to: string,
  bike: number
}

export class Subscription {
  #unsubscribe: Unsubscribe
  constructor(unsubscribe: Unsubscribe) {
    this.#unsubscribe = unsubscribe
  }

  public unsubscribe(): void {
    this.#unsubscribe()
  }
}

export const subscribe = (callback: (rides: Ride[]) => void): Subscription => {
  const db = getFirestore()

  const userDocRef = doc(db, "users", getCurrentUserUid())
  const subscription = onSnapshot(userDocRef, (doc) => {
    const data = doc.data()
    if (!data) {
      console.log("user ride data does not exist")
      return
    }

    const rides: Ride[] = (data['rides'] as FirestoreRide[]).map((fs: FirestoreRide) => {
      return {
        when: DateTime.fromMillis(fs.when),
        duration: Duration.fromObject({ minutes: fs.min }),
        bike: fs.bike,
        from: fs.from,
        to: fs.to
      }
    })
    callback(rides)
  })

  return new Subscription(subscription);
}

export const editRide = (originalTime: DateTime, updated: Ride): Promise<void> => {
  const db = getFirestore()

  const userDocRef = doc(db, "users", getCurrentUserUid())

  return runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);

    if (!userDoc.exists()) {
      return Promise.reject("User has no rides")
    }
    const rides = userDoc.data().rides;
    const matchedRide: FirestoreRide = rides.find((ride: FirestoreRide) => {
      return ride.when === originalTime.toMillis()
    })

    if (!matchedRide) {
      return Promise.reject("Edited ride not found")
    }
    matchedRide.when = updated.when.toMillis()
    matchedRide.min = updated.duration.minutes,
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
  const db = getFirestore()

  const mapped: FirestoreRide = {
    when: ride.when.toMillis(),
    min: ride.duration.minutes,
    bike: ride.bike,
    from: ride.from,
    to: ride.to
  }

  const userDocRef = doc(db, "users", getCurrentUserUid())
  return runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);

    let docValue;
    if (!userDoc.exists()) {
      docValue = {
        rides: [mapped]
      }
    } else {
      const rides = userDoc.data().rides;
      rides.push(mapped)
      docValue = {
        rides: rides
      }
    }

    transaction.set(userDocRef, docValue);
    return Promise.resolve()
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
