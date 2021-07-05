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

export const subscribe = (userId: string, callback: (rides: Ride[]) => void): Subscription => {
  const db = getFirestore()

  const userDocRef = doc(db, "users", userId)
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

export const addRide = (userId: string, ride: Ride): void => {
  const db = getFirestore()

  const mapped: FirestoreRide = {
    when: ride.when.toMillis(),
    min: ride.duration.minutes,
    bike: ride.bike,
    from: ride.from,
    to: ride.to
  }

  console.log(mapped)

  const userDocRef = doc(db, "users", userId)
  runTransaction(db, async (transaction) => {
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
  })
}
