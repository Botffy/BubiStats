<template>
  <section>
    <quote>Idomvas és idus között</quote>

    <div class='columns'>
      <div class='column'>
        <highcharts :options="weekdayChart" />
      </div>
      <div class='column'>
        <highcharts :options="hourChart" />
      </div>
    </div>

    <section class="block">
      <div class='box'>
        <table class="table is-fullwidth">
          <tr>
            <th>Első út</th>
            <td><ride :ride='rides[0]' /> (<time-ago :date='rides[0].when' />)</td>
          </tr>
          <tr>
            <th>Legutóbbi út</th>
            <td><ride :ride='rides[rides.length - 1]' /> (<time-ago :date='rides[rides.length - 1].when' />)</td>
          </tr>
          <tr>
            <th>Bubival töltött napok</th>
            <td> {{ridesByDay.length}}</td>
          </tr>
          <tr>
            <th>Leghosszabb szünet</th>
            <td
              v-if="pauses.length > 0"
            >
              {{ pauses[0].length('days') - 1 }} nap

              <span v-if="pauses[0].length('days') == 2">
                ({{ pauses[0].start.plus({'days': 1}).toFormat('yyyy-MM-dd') }})
              </span>
              <span v-else>
                ({{ pauses[0].start.plus({'days': 1}).toFormat('yyyy-MM-dd') }}
                és
                {{ pauses[0].end.minus({'days': 1}).toFormat('yyyy-MM-dd') }}
                között)
              </span>
            </td>
            <td v-else>
              -
            </td>
          </tr>
        </table>
      </div>
    </section>

    <section
      v-if="streaks.length"
      class="block"
    >
      <div class='box'>
        <h2 class="subtitle">
          Sorozatok
        </h2>
        <b-table
          :data="streaks"
          :hoverable="true"
          :striped="true"
          :mobile-cards="false"
          default-sort-direction="desc"
          default-sort="len"
          :paginated="streaks.length > 10"
          :per-page="10"
          :pagination-rounded='true'
          pagination-size="is-small"
          detailed
          detail-key="interval"
        >
          <b-table-column label="Mikor" sortable :custom-sort="sortBy((streak) => streak.interval.start.toMillis(), defaultStreakSorting)" v-slot="props">
            {{ props.row.interval.start.toFormat('yyyy-MM-dd') }} - {{ props.row.interval.end.toFormat('yyyy-MM-dd') }}
          </b-table-column>
          <b-table-column label="Hossz" field='len' sortable :custom-sort="sortBy((streak) => streak.interval.length('day'), defaultStreakSorting)" v-slot="props" numeric>
            {{ props.row.interval.length('day') + 1 }}
          </b-table-column>
          <b-table-column label="Utak" sortable :custom-sort="sortBy((streak) => streak.rideIndices.length, defaultStreakSorting)" v-slot="props" numeric>
            {{ props.row.rideIndices.length }}
          </b-table-column>

          <template #detail='props'>
            <ride-list :rides='props.row.rideIndices.map(n => ride(n))' :compact="true" />
          </template>
        </b-table>
      </div>
    </section>

    <section class="block">
      <div class='box'>
        <h2 class="subtitle">
          Legbubisabb napok
        </h2>
        <b-table
          :data="ridesByDay"
          :hoverable="true"
          :striped="true"
          :mobile-cards="false"
          :paginated="ridesByDay.length > 10"
          :per-page="10"
          :pagination-rounded='true'
          pagination-size="is-small"
          default-sort="rides"
          default-sort-direction="desc"
          detailed
          detail-key="day"
        >
          <b-table-column label="Nap" field='day' sortable v-slot="props">
            {{ props.row.day.toFormat('yyyy-MM-dd') }} ({{ dayName(props.row.day.weekday) }})
          </b-table-column>
          <b-table-column label="Utak" field='rides' v-slot="props" sortable :custom-sort="sortBy((stat) => stat.rideIndices.length, defaultDaySorting)" numeric>
            {{ props.row.rideIndices.length }}
          </b-table-column>
          <b-table-column label="Perc" v-slot="props" sortable :custom-sort="sortBy((stat) => stat.duration.as('minutes'), defaultDaySorting)" numeric>
            {{ Math.round(props.row.duration.as('minutes')) }}
          </b-table-column>

          <template #detail='props'>
            <ride-list :rides='props.row.rideIndices.map(n => ride(n))' :compact="true" />
          </template>
        </b-table>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { DateTime, Interval, Duration } from 'luxon'
import { Ride } from './model'
import Quote from './components/Quote.vue'
import SortingMixin from './SortingMixin'
import HasRides from './HasRides'
import BubiRides from './BubiRides.vue'
import RideComponent from './components/Ride.vue'
import TimeAgo from './components/TimeAgo.vue'

type DayStat = {
  day: DateTime
  rideIndices: number[],
  duration: Duration
}

type Streak = {
  interval: Interval
  rideIndices: number[]
}

const dayStats = (rides: Ride[]) => {
  return Array.from(rides.reduce((accumulator: Map<number, DayStat>, ride: Ride, rideIndex: number): Map<number, DayStat> => {
    let day = ride.when.startOf('day')
    let val = accumulator.get(day.toMillis())
    if (!val) {
      val = {
        day,
        rideIndices: [],
        duration: Duration.fromMillis(0)
      }
      accumulator.set(day.toMillis(), val)
    }

    val.rideIndices.push(rideIndex)
    val.duration = val.duration.plus(ride.duration)

    return accumulator
   }, new Map()).values())
}

export default Vue.extend({
  components: {
    'quote': Quote,
    'ride': RideComponent,
    'time-ago': TimeAgo,
    'ride-list': BubiRides
  },
  mixins: [ HasRides, SortingMixin ],
  computed: {
    ridesByDay(): DayStat[] {
      return dayStats(this.rides)
    },
    statsByWeekdays() {
      const weekdays = new Array<number>(7).fill(0)
      for (let i = 0; i < this.ridesByDay.length; ++i) {
        weekdays[this.ridesByDay[i].day.weekday - 1] += this.ridesByDay[i].rideIndices.length
      }

      return weekdays
        .filter((val: number) => val > 0)
        .map((val: number, index: number) => Object({
          name: this.dayName(index + 1),
          y: val
        }))
    },
    weekdayChart() {
      return {
        plotOptions: {
          pie: {
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.0f} %'
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Utak',
          data: this.statsByWeekdays
        }],
        credits: {
          enabled: false
        },
        title: {
          text: 'A hét napjain'
        },
        legend: {
          enabled: false
        }
      }
    },
    statsByHours() {
      const hours = new Array<number>(24).fill(0)
      for (let i = 0; i < this.rides.length; ++i) {
        hours[this.rides[i].when.hour] += 1
      }
      return hours
    },
    hourChart() {
      return {
        series: [{
          type: 'column',
          name: 'Utak',
          data: this.statsByHours
        }],
        yAxis: {
          title: {
            text: 'Utak'
          }
        },
        xAxis: {
          categories: new Array<number>(24).fill(0).map((val, idx) => idx),
          min: 0,
          max: 23
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}:00</span><table>',
          pointFormat: '<tr><td style="padding:0"><b>{point.y:.0f} út</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        credits: {
          enabled: false
        },
        title: {
          text: 'Órák'
        },
        legend: {
          enabled: false
        }
      }
    },
    pauses(): Interval[] {
      const result: Interval[] = []
      for (let i = 0; i < this.ridesByDay.length - 1; ++i) {
        let interval = Interval.fromDateTimes(this.ridesByDay[i].day, this.ridesByDay[i + 1].day)
        if (interval.length('day') > 1) {
          result.push(interval)
        }
      }
      return result.sort((a: Interval, b: Interval) => b.length('days') - a.length('days'))
    },
    streaks(): Streak[] {
      const result: Streak[] = []
      let currentStreak: Streak | null
      for (let i = 0; i < this.ridesByDay.length; ++i) {
        if (!currentStreak) {
          currentStreak = {
            interval: Interval.fromDateTimes(this.ridesByDay[i].day, this.ridesByDay[i].day),
            rideIndices: [...this.ridesByDay[i].rideIndices]
          }
        } else {
          if (currentStreak.interval.end.plus({'day': 1}).hasSame(this.ridesByDay[i].day, 'day')) {
            currentStreak.interval = currentStreak.interval.set({ end: this.ridesByDay[i].day })
            currentStreak.rideIndices.push(...this.ridesByDay[i].rideIndices)
          } else {
            result.push(currentStreak)
            currentStreak = {
              interval: Interval.fromDateTimes(this.ridesByDay[i].day, this.ridesByDay[i].day),
              rideIndices: [...this.ridesByDay[i].rideIndices]
            }
          }
        }
      }
      result.push(currentStreak)
      return result
        .filter((streak: Streak) => streak.interval.length('day') > 0)
        .sort(this.defaultStreakSorting)
    }
  },
  methods: {
    defaultStreakSorting: (a: Streak, b: Streak): number  => {
      return b.interval.length('day') - a.interval.length('day')
          || b.interval.start.toMillis() - a.interval.start.toMillis()
    },
    defaultDaySorting: (a: DayStat, b: DayStat): number => {
      return b.rideIndices.length - a.rideIndices.length
        || b.duration.as('millisecond') - a.duration.as('millisecond')
        || b.day.toMillis() - a.day.toMillis()
    },
    dayName(ordinal: number) {
      switch(ordinal) {
        case 1: return 'hétfő'
        case 2: return 'kedd'
        case 3: return 'szerda'
        case 4: return 'csütörtök'
        case 5: return 'péntek'
        case 6: return 'szombat'
        case 7: return 'vasárnap'
      }
    }
  }
})
</script>
