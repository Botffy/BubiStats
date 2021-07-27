
export default {
  methods: {
    sortBy<Type>(accessor: (a: Type) => number, defaultSorting: (a: Type, b: Type) => number) {
      return (a: Type, b: Type, isAsc: boolean): number => {
        return (accessor(a) - accessor(b)) * (isAsc ? 1 : -1) || defaultSorting(a, b)
      }
    },
    sortByString<Type>(accessor: (a: Type) => string, defaultSorting: (a: Type, b: Type) => number) {
      return (a: Type, b: Type, isAsc: boolean): number => {
        return (accessor(a).localeCompare(accessor(b))) * (isAsc ? 1 : -1) || defaultSorting(a, b)
      }
    }
  }
}
