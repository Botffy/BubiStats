
export default {
  methods: {
    sortBy(accessor: (a: object) => number) {
      return (a: object, b: object, isAsc: boolean) => {
        return (accessor(a) - accessor(b)) * (isAsc ? 1 : -1) || this.defaultSorting(a, b)
      }
    },
    sortByString(accessor: (a: object) => string) {
      return (a: object, b: object, isAsc: boolean) => {
        return (accessor(a).localeCompare(accessor(b))) * (isAsc ? 1 : -1) || this.defaultSorting(a, b)
      }
    }
  }
}
