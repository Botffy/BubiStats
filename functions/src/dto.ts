export type FirestoreRide = {
  when: number,
  sec: number,
  from: string,
  to: string,
  bike: number
}

export type EditRide = {
  updated: FirestoreRide,
  original: number
}

export enum RideField {
  when = 'when', sec = 'duration', from = 'from', to = 'to', bike = 'bike'
}

export type ValidationError = {
  field: RideField,
  message: string
}
