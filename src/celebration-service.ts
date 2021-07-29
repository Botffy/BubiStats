import { DateTime, Interval } from 'luxon'
import { Ride } from './model'
import { getStationByCode }  from './station-service'

const avsaz = (n: number): string => {
  if (n < 10) {
    return n == 1 || n == 5 ? 'Az' : 'A'
  } else if (n < 100) {
    return Math.ceil(n / 10) == 5 ? 'Az' : 'A'
  }
  return 'A'
}

const avsaz_str = (s: string): string => {
  if (['a', 'á', 'e', 'é', 'i', 'í', 'o', 'ó', 'u', 'ú', 'ü', 'ű'].includes(s[0].toLocaleLowerCase())) {
    return 'az'
  }
  return 'a'
}

const es = (n: number): string => {
  let s = String(n)


  for (let digit = 1; digit < 5 && digit < s.length; ++digit) {
    let c = s[s.length - digit]

    if (c === '0') {
      continue
    }

    if (digit == 3) {
      return 'as'
    }
    if (digit == 4) {
      return 'es'
    }

    if (c == '1' || (c == '2' && digit == 1) || c == '4' || c == '7' || c == '9') {
      return 'es'
    } else if (c == '3' || c == '8' || (c == '2' && digit == 2)) {
      return 'as'
    } else if (c == '5') {
      return 'ös'
    } else if (c == '6') {
      return 'os'
    }
  }

  return 'as'
}

export type Celebration = {
  message: string,
  icon: string
}

const ride_number = (added: Ride, rides: Ride[]): Celebration[] => {
  if (rides.length == 0) {
    return [{ message: 'Az első utad!', icon: 'play-circle' }]
  }

  if ([5, 10, 25, 50].includes((rides.length + 1)) || (rides.length + 1) % 100 === 0) {
    return [{
      icon: 'biking',
      message: `${avsaz(rides.length + 1)} ${rides.length + 1}. utad!`
    }]
  }

  return []
}

const bike_ride_number = (added: Ride, rides: Ride[]): Celebration[] => {
  let num = rides.filter(ride => ride.bike == added.bike).length

  if (num == 0) {
    return []
  }

  return [{
    icon: 'bicycle',
    message: `${avsaz(num + 1)} ${num + 1}. utad a ${added.bike}-${es(added.bike)} bicajjal!`
  }]
}

const ride_length = (added: Ride, rides: Ride[]): Celebration[] => {
  if (!rides.length) return []

  let longest = rides.reduce((acc: number, curr: Ride): number => {
    let duration = curr.duration.as('seconds')
    return duration > acc ? duration : acc
  }, 0)

  if (added.duration.as('seconds') > longest) {
    return [{
      icon: 'hourglass-half',
      message: 'A leghosszabb utad!'
    }]
  }

  return []
}

const paying_ride = (added: Ride): Celebration[] => {
  if (added.duration.as('minutes') > 30) {
    return [{
      icon: 'coins',
      message: 'Fizetős út!'
    }]
  }

  return []
}

const station_visit_inner = (station: string, rides: Ride[]): Celebration[] => {
  if (rides.length == 0) {
    return []
  }
  let num = rides.filter(ride => ride.to == station || ride.from == station).length

  let stationName = getStationByCode(station)?.name || station

  if (num == 0 || (num + 1) % 10 == 0) {
    return [{
      icon: 'sign',
      message: `${num == 0 ? 'Első' : (num + 1) + '.'} látogatásod ${avsaz_str(stationName)} ${stationName} állomáson!`
    }]
  }

  return []
}
const station_visit = (added: Ride, rides: Ride[]): Celebration[] => {
  if (added.from == added.to) {
    return station_visit_inner(added.from, rides)
  }

  return station_visit_inner(added.from, rides).concat(station_visit_inner(added.to, rides))
}

const break_end = (added: Ride, rides: Ride[]): Celebration[] => {
  if (!rides.length) return []
  let last = rides[rides.length - 1].when

  if (last > added.when) {
    return []
  }

  let breakDays = Math.floor(Interval.fromDateTimes(last.startOf('day'), added.when.startOf('day')).toDuration('days').days)

  if (breakDays > 2) {
    return [{
      icon: 'fist-raised',
      message: `Az első utad ${breakDays} nap kihagyás után!`
    }]
  }

  return []
}

const streak_extension = (added: Ride, rides: Ride[]): Celebration[] => {
  if (!rides.length || rides[rides.length - 1].when >= added.when) {
    return []
  }

  let last: DateTime = added.when.startOf('day')
  let curr: DateTime = null
  let streak = []
  for (let i = rides.length - 1; i >= 0; --i) {
    curr = rides[i].when.startOf('day')
    if (Math.floor(Interval.fromDateTimes(curr, last).toDuration('days').days) > 1) {
      break
    }
    streak.push(curr.startOf('day').toMillis())
    last = curr
  }

  streak = streak.filter((v, i, a) => a.indexOf(v) === i)
  if (streak.length > 1) {
    return [ {
      icon: 'calendar-alt',
      message: `A sorozat folyatódik: ezzel ${avsaz(streak.length + 1).toLocaleLowerCase()} ${streak.length + 1}. napja minden nap használod a bubit.`
    } ]
  }
  return  []
}

const retour_detection = (added: Ride, rides: Ride[]): Celebration[] => {
  if (!rides.length || rides[rides.length - 1].when >= added.when) {
    return []
  }

  const last: Ride = rides[rides.length - 1]
  if (Math.floor(Interval.fromDateTimes(last.when, added.when).toDuration('days').days) > 1) {
    return []
  }

  if (last.from == added.to && last.to == added.from) {
    if (last.bike == added.bike) {
      return [{
        icon: 'exchange-alt',
        message: 'Retúr ugyanazzal a bicajjal.'
      }]
    }
    return [{
      icon: 'exchange-alt',
      message: 'Egy jó retúr.'
    }]
  }

  return []
}

const chain_extension = (added: Ride, rides: Ride[]): Celebration[] => {
  if (!rides.length || rides[rides.length - 1].when >= added.when) {
    return []
  }

  let chain_counter = 0
  let curr: Ride = added
  let prev: Ride = null
  for (let i = rides.length - 1; i >= 0; --i) {
    prev = curr
    curr = rides[i]
    if (curr.to != prev.from) {
      break
    }
    ++chain_counter
  }

  if (chain_counter > 1) {
    return [{
      icon: 'link',
      message: `A lánc folytatódik: ez ${avsaz(chain_counter + 1).toLowerCase()} ${chain_counter + 1}. láncszem.`
    }]
  }
  return []
}

const celebrations = [
  paying_ride, retour_detection, ride_number, bike_ride_number, ride_length, station_visit, break_end, streak_extension, chain_extension
]

export const calculateCelebrations = (added: Ride, rides: Ride[]): Celebration[] => {
  rides = rides.filter(ride => ride.when.toMillis() != added.when.toMillis())

  let result: Celebration[] = celebrations
    .map(fn => fn.apply(null, [added, rides]))
    .reduce((prev, curr) => prev.concat(curr))

  if (!result.length) {
    result.push({
      icon: 'check',
      message: 'Az utat felvettük.'
    })
  }

  return result
}
