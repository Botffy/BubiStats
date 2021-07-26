import { Duration, DateTime } from 'luxon'

type Ride = {
  when: DateTime,
  duration: Duration,
  from: string,
  to: string,
  bike: number
}

export { Ride }
