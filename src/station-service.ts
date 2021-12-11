import stationData from './data/stations.json'

const stationByCode: Map<string, Station> = stationData
  .sort((x, y) => x.name.localeCompare(y.name))
  .reduce((map, station) =>
    (map.set(station.code, station)),
    new Map()
  )

type Station = {
  code: string,
  name: string
}

const listStations = (): readonly Station[] => Object.freeze(stationData)

const getStationByCode = (code: string): Station | null => {
  return stationByCode.get(code) || {
    code: code,
    name: code
  }
}

const stationName = (code: string): string => {
  return getStationByCode(code).name
}

export { Station, getStationByCode, listStations, stationName }
