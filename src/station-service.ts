import stationData from './data/stations.json'

const stationByCode: Map<string, Station> = stationData
  .sort((x, y) => x.name.localeCompare(y.name))
  .reduce((map, station) =>
    (map.set(station.code, station)),
    new Map()
  );

type Station = {
  code: string,
  name: string
}

const listStations = (): readonly Station[] => Object.freeze(stationData);

const getStationByCode = (code: string): Station | null => {
  return stationByCode.get(code);
}

const stationName = (code: string): string => {
  let result = getStationByCode(code);

  if (!result) {
    console.warn("Unknown station: " + code);
    return code;
  }

  return result.name;
}

export { Station, getStationByCode, listStations, stationName }
