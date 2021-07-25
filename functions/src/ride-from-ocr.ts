import { DateTime, Interval } from 'luxon'
import { FirestoreRide } from './dto'

type StationData = {
  code: string | null,
  time: DateTime | null
}

const get_station_data = (data: string[]): StationData => {
  const result: StationData = {
    code: null,
    time: null
  }

  let timeData: string[] | null = null
  for (let i = 0; i < data.length; ++i) {
    if (!result.code && data[i].match(/^\d{4}-\w+/)) {
      result.code = data[i].slice(0, 4)
      data[i] = ''
    }
    if (!result.time) {
      let d = DateTime.fromFormat(data[i], "yyyy. LLL. d.", { locale: "hu", zone: 'Europe/Budapest' });
      if (d.isValid) {
        result.time = d
        data[i] = ''
      }
    }
    if(!timeData && data[i].match(/(\d\d:\d\d:\d\d)/)) {
      timeData = data[i].slice(0, 8).split(':')
      data[i] = ''
    }
  }

  if (timeData && result.time) {
    result.time = result.time.plus({
      hour: parseInt(timeData[0]),
      minute: parseInt(timeData[1]),
      second: parseInt(timeData[2])
    })
  }

  return result
}

export const ride_from_ocr = (input: string): FirestoreRide | undefined => {
  console.log("Parsing: " + input)
  const split = input.split('\n')
  let bikeLabelIndex = split.findIndex((val: string) => val.match("Kerékpár"))
  let fromLabelIndex = split.findIndex((val: string, index: number) => val.match("Kezdés") && index > bikeLabelIndex)
  let toLabelIndex = split.findIndex((val: string, index: number) => val.match("Visszaadás") && index > fromLabelIndex)

  if (bikeLabelIndex == -1 || fromLabelIndex == -1 || toLabelIndex == 1) {
    console.log("Failed to find")
    return undefined
  }

  const result = {
    when: 0,
    sec: 0,
    from: '',
    to: '',
    bike: 0
  }

  for (let i = bikeLabelIndex; i < split.length; ++i) {
    if (split[i].match(/^86\d{4}/)) {
      result.bike = parseInt(split[i].slice(0, 6))
    }
  }

  const actualData = split.slice(bikeLabelIndex)
  const fromData = get_station_data(actualData)
  const toData = get_station_data(actualData)

  if (toData.time && fromData.time) {
    if (toData.time < fromData.time) {
      console.log("End time earlier than start time")
      return undefined
    }

    result.sec = Interval.fromDateTimes(fromData.time, toData.time)
      .toDuration()
      .as('seconds')
  }
  result.from = fromData.code || ''
  result.to = toData.code || ''
  result.when = fromData.time ? fromData.time.toMillis() : 0

  if (!result.from || !result.when || !result.to || !result.bike || !result.sec) {
    return undefined
  }

  return result
}
