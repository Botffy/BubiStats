import * as firebase from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';

let firebaseApp: FirebaseApp = null

export const getFirebaseApp = (): FirebaseApp => {
  if (firebaseApp !== null) return firebaseApp;

  firebaseApp = firebase.initializeApp({
    apiKey:            'AIzaSyBxbbNWjnS-2Cq1t9qGe5Fb8tb8_sG4bo0',
    authDomain:        'bubistats.firebaseapp.com',
    projectId:         'bubistats',
    storageBucket:     'bubistats.appspot.com',
    messagingSenderId: '1067199753170',
    appId:             '1:1067199753170:web:4bbf892a8814fc699f360b',
    measurementId:     'G-4BWS5RENSM',
  })

  return firebaseApp
}

export const getCurrentUserUid = (): string | null => {
  return getAuth(getFirebaseApp()).currentUser?.uid
}

export const onUserChange = (callback: (uid: string) => void ) => {
  const auth = getAuth(getFirebaseApp())
  auth.useDeviceLanguage()

  onAuthStateChanged(auth, (user) => {
    callback(user?.uid)
  })
}
