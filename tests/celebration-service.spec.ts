import { Duration, DateTime } from 'luxon'
import { calculateCelebrations } from '../src/celebration-service'
import { Ride } from '../src/model'

describe('celebration', () => {
  it('celebrates first ride', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 860001,
      from: '0102',
      to: '0103'
    }, [])
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'Az első utad!')
  })

  it('does not celebrate second ride (with no matching stuff)', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 860001,
      from: '0102',
      to: '0103'
    }, generateRides(3, { when: DateTime.now().minus({'days': 2}) }))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'Az utat felvettük.')
  })

  it('celebrates second ride with the same bike', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 861020,
      from: '0102',
      to: '0103'
    }, sort(generateRides(2, { when: DateTime.now().minus({'days': 2}) }), generateRides(1, { bike: 861020, when: DateTime.now().minus({'days': 6}) })))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'A 2. utad a 861020-as bicajjal!')
  })

  it('celebrates first visit of station', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 861020,
      from: '0511',
      to: '0518'
    }, sort(generateRides(5, { when: DateTime.now().minus({'days': 2}) })))
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('message', 'Első látogatásod a Vigadó tér állomáson!')
    expect(result[1]).toHaveProperty('message', 'Első látogatásod a Deák tér állomáson!')
  })

  it('celebrates longest ride', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 29}),
      bike: 861020,
      from: '0102',
      to: '0103'
    }, sort(generateRides(5, { when: DateTime.now().minus({'days': 2}) })))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'A leghosszabb utad!')
    expect(result[0]).toHaveProperty('icon', 'hourglass-half')
  })

  it('celebrates ride you had to pay for', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 31}),
      bike: 861020,
      from: '0102',
      to: '0103'
    }, sort(generateRides(5, { when: DateTime.now().minus({'days': 2}), duration: Duration.fromObject({ 'minutes': 35 }) })))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'Fizetős út!')
    expect(result[0]).toHaveProperty('icon', 'coins')
  })

  it('celebrates the end of a break', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 861020,
      from: '0102',
      to: '0103'
    }, sort(generateRides(5, { when: DateTime.now().minus({'day': 10}) })))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'Az első utad 10 nap kihagyás után!')
  })

  it('celebrates streaks', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 861020,
      from: '0102',
      to: '0103'
    }, sort(
      generateRides(3, { when: DateTime.now().minus({'day': 1}) }),
      generateRides(5, { when: DateTime.now().minus({'day': 6}) })
    ))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'A sorozat folyatódik: ezzel a 4. napja minden nap használod a bubit.')
  })

  it('celebrates retours', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 861020,
      from: '0102',
      to: '0103'
    }, sort([
      {
        when: DateTime.now().minus({'hours': 4}),
        duration: Duration.fromObject({'minutes': 4}),
        bike: 861021,
        from: '0103',
        to: '0102'
      }
    ]))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'Egy jó retúr.')
  })

  it('celebrates chain extensions', () => {
    let result = calculateCelebrations({
      when: DateTime.now(),
      duration: Duration.fromObject({'minutes': 3}),
      bike: 861020,
      from: '0103',
      to: '0104'
    }, sort([
      {
        when: DateTime.now().minus({'days': 1}),
        duration: Duration.fromObject({'minutes': 4}),
        bike: 861021,
        from: '0102',
        to: '0103'
      },
      {
        when: DateTime.now().minus({'days': 6}),
        duration: Duration.fromObject({'minutes': 4}),
        bike: 861021,
        from: '0104',
        to: '0102'
      },
      {
        when: DateTime.now().minus({'days': 18}),
        duration: Duration.fromObject({'minutes': 4}),
        bike: 861021,
        from: '0401',
        to: '0402'
      }
    ]))
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('message', 'A lánc folytatódik: ez a 3. láncszem.')
  })
})

const sort = (...rides: Ride[][]) => {
  return rides
    .reduce((prev: Ride[], curr: Ride[]) => prev.concat(curr))
    .sort((a, b) => a.when.toMillis() - b.when.toMillis())
}

type Ridelike = {
  when?: DateTime
  bike?: number,
  duration?: Duration,
  from?: string,
  to?: string
}

const generateRides = (n: number, pattern?: Ridelike): Ride[] => {
  const ride: Ride = {
    when: pattern?.when || DateTime.now(),
    bike: pattern?.bike || 860000,
    duration: pattern?.duration || Duration.fromObject({ 'minutes': 3 }),
    from: pattern?.from || '0102',
    to: pattern?.to || '0103'
  }

  const result = []

  for (let i = 0; i < n; ++i) {
    result.push({
      when: ride.when.minus({ 'day': i }).set({'hour': 8}),
      duration: ride.duration,
      bike: ride.bike,
      from: ride.from,
      to: ride.to
    })
  }

  return result.reverse()
}
