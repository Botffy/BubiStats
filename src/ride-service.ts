import { getFirebaseApp, getCurrentUserUid, onUserChange } from './firebase'
import { Unsubscribe } from '@firebase/util'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { Duration, DateTime } from 'luxon'
import { Ride } from './model'
import { calculateCelebrations, Celebration } from './celebration-service'
import { FirestoreRide } from '../functions/src/dto'
import { v4 as uuidv4 } from 'uuid'

const subscribers: Map<string, ((ride: Ride[]) => void)> = new Map()
let rides: Ride[] | null = null
let firestoreSubscription: Unsubscribe = null

onUserChange((uid: string) => {
  if (!uid && firestoreSubscription) {
    firestoreSubscription()
    firestoreSubscription = null
    rides = null
    return
  }
  if (uid) {
    if (firestoreSubscription) {
      firestoreSubscription()
      firestoreSubscription = null
    }
    createFirestoreSubscription()
  }
})

const onData = (data: Ride[]) => {
  rides = data
  subscribers.forEach((callback) => {
    callback(rides)
  })
}

const createFirestoreSubscription = () => {
  if (!getCurrentUserUid()) return

  const db = getFirestore()
  const userDocRef = doc(db, 'users', getCurrentUserUid())

  firestoreSubscription = onSnapshot(userDocRef, doc => {
    const data = doc.data()

    if (!data || !data.rides) {
      onData([])
      return
    }

    const rides: Ride[] = (data['rides'] as FirestoreRide[]).map(toRide)
    onData(rides)
  })
}

export const getRides = (): readonly Ride[] => {
  return rides
}

export const subscribe = (callback: (rides: Ride[]) => void): unknown => {
  if (!firestoreSubscription) {
    createFirestoreSubscription()
  }

  const id = uuidv4()
  subscribers.set(id, callback)
  callback(rides)
  return id
}

export const unsubscribe = (id: string): void => {
  subscribers.delete(id)
}

const toFirestoreRide = (ride: Ride): FirestoreRide => {
  return {
    when: ride.when.toMillis(),
    sec: ride.duration.shiftTo('seconds').seconds,
    bike: ride.bike,
    from: ride.from,
    to: ride.to
  }
}

const toRide = (fs: FirestoreRide): Ride => {
  return {
    when: DateTime.fromMillis(fs.when),
    duration: Duration.fromMillis(fs.sec * 1000),
    bike: fs.bike,
    from: fs.from,
    to: fs.to
  }
}

export const addRide = (ride: Ride): Promise<Celebration[]> => {
  const functions = getFunctions(getFirebaseApp(), 'europe-central2')
  const addRide = httpsCallable(functions, 'addRide')

  return addRide(toFirestoreRide(ride))
    .then(result => result.data as FirestoreRide)
    .then(toRide)
    .then((added) => calculateCelebrations(added, rides))
}

export const addByScreenshot = (file: File, onStateChange?: (stateMessage: string) => void): Promise<Celebration[]> => {
  const id = uuidv4()
  const storageRef = ref(getStorage(), `/user/${getCurrentUserUid()}/${id}`)
  const uploadTask = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      snapshot => {
        const progress = Math.ceil((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onStateChange(`Feltöltés: ${progress}%`)
      },
      error => {
        console.log(error)
        reject(error)
      },
      () => {
        const functions = getFunctions(getFirebaseApp(), 'europe-central2')
        const addRideByScreenshot = httpsCallable(functions, 'addRideByScreenshot')

        onStateChange('Feldolgozás')
        addRideByScreenshot(id)
          .then(result => result.data as FirestoreRide)
          .then(toRide)
          .then((added) => calculateCelebrations(added, rides))
          .then(celebrations => resolve(celebrations))
          .catch((error) => {
            reject(error)
          })
      }
    )
  })
}

export const editRide = (originalTime: DateTime, updated: Ride): Promise<void> => {
  const functions = getFunctions(getFirebaseApp(), 'europe-central2')
  const editRide = httpsCallable(functions, 'editRide')

  return editRide({
    original: originalTime.toMillis(),
    updated: toFirestoreRide(updated)
  }).then((result) => {
    console.log(result)
  })
}

export const deleteRide = (rideTime: DateTime): Promise<void> => {
  const functions = getFunctions(getFirebaseApp(), 'europe-central2')
  const deleteRide = httpsCallable(functions, 'deleteRide')

  return deleteRide(rideTime.toMillis()).then((result) => {
    console.log(result)
  })
}
