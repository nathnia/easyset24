<script setup lang="ts">
import { useLocationsStore } from '~/stores/locations'
import { stayFromQuery } from '~/utils/liteapi'
import { CABIN_OPTIONS, addDays, cabinLabel, flightQueryFromRoute } from '~/utils/flights'

const props = withDefaults(defineProps<{
    type?: 'hotel' | 'flight'
    place?: string
    vip?: string
}>(), { type: 'hotel' })

const configs = {
    hotel: {
        title: 'Where Is Your Next Dream Place?',
        subtitle: 'Find Exclusive Genius Rewards In Every Corner Of The World!',
        labels: ['Place', 'VIP', 'Passengers - Room Condition', 'Check In -Check Out'],
        icon: 'icon-park-outline:building-one',
        first: 'Jakarta',
        secondOptions: ['Long Lasting', 'Loyalty Gifts'],
        second: 'Long Lasting',
        thirdOptions: ['One Room', 'Two Rooms', 'Three Rooms'],
        third: 'Two Rooms',
        button: 'Search',
        to: '/hotels/search',
    },
    flight: {
        title: 'Which Exciting Place Is Your Next Adventure Taking You?',
        subtitle: 'Discover Exclusive Genius Rewards Wherever Your Journey Takes You!',
        labels: ['From -To', 'Trip', 'Passengers - Flight Class', 'Departure -Return'],
        icon: 'icon-park-outline:airplane',
        first: 'Gutenberg - Istanbul',
        secondOptions: ['Two Way', 'One Way'],
        second: 'Two Way',
        thirdOptions: ['Economy', 'Premium Economy', 'Business', 'First'],
        third: 'Economy',
        button: 'Find Flights',
        to: '/flights/search',
    },
}
const c = configs[props.type]

const first = ref(props.place ?? c.first)

const locations = useLocationsStore()
const { cities } = storeToRefs(locations)
if (props.type === 'hotel') {
    useLazyAsyncData('cities', async () => {
        await locations.fetchCities('ID')
        return true
    }, { server: false })
}

// Flights: everything is kept in the URL (from, to, dates, passengers, cabin)
const fq = flightQueryFromRoute(useRoute().query)
const fromCode = ref(fq.from)
const toCode = ref(fq.to)
const departDate = ref(fq.depart)
const returnDate = ref(fq.ret)
const flightAdults = ref(fq.adults)
const flightChildren = ref(fq.children)
const flightError = ref('')

const isFlight = props.type === 'flight'
const second = ref(props.vip ?? (isFlight ? (fq.trip === 'one' ? 'One Way' : 'Two Way') : c.second))
const third = ref(isFlight ? cabinLabel(fq.cabin) : c.third)

const route = useRoute()
const stay = stayFromQuery(route.query)
const checkin = ref(stay.checkin)
const checkout = ref(stay.checkout)
const adults = ref(stay.adults)
const today = new Date().toISOString().slice(0, 10)
const maxDate = addDays(330) // flights can be searched up to 11 months ahead

function search() {
    if (props.type === 'hotel') {
        navigateTo({ path: c.to, query: { cityName: first.value.trim(), checkin: checkin.value, checkout: checkout.value, adults: adults.value } })
    } else if (c.to) {
        if (!fromCode.value || !toCode.value || fromCode.value === toCode.value) {
            flightError.value = 'Pick two different airports.'
            return
        }
        const oneWay = second.value === 'One Way'
        if (!departDate.value || (!oneWay && !returnDate.value)) {
            flightError.value = 'Pick your travel dates.'
            return
        }
        if (!oneWay && returnDate.value < departDate.value) {
            flightError.value = 'The return date must be after the departure date.'
            return
        }
        flightError.value = ''
        navigateTo({
            path: c.to,
            query: {
                from: fromCode.value,
                to: toCode.value,
                depart: departDate.value,
                ...(oneWay ? {} : { return: returnDate.value }),
                trip: oneWay ? 'one' : 'two',
                adults: flightAdults.value,
                children: flightChildren.value,
                cabin: CABIN_OPTIONS.find((o) => o.label === third.value)?.value ?? 'ECONOMY',
            },
        })
    }
}

// display only: "2026-12-18" -> "18 Dec 2026"
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmt(iso: string) {
    const [y, m, d] = (iso || '').split('-')
    return y && m && d ? `${d} ${MONTHS[Number(m) - 1]} ${y}` : 'Select date'
}
function openPicker(e: Event) {
    (e.target as HTMLInputElement).showPicker?.()
}

const field = 'relative flex h-[50px] items-center gap-3 border border-gray-300 bg-white px-3 text-body-s md:-ml-px md:first:ml-0'
const selectBase = 'appearance-none bg-transparent outline-none'
const select = `w-full ${selectBase}`
</script>

<template>
    <section class="page-container pt-4">
        <h1 class="text-h4 text-primary-500">{{ c.title }}</h1>
        <p class="mt-1 text-body-s text-primary-500">{{ c.subtitle }}</p>

        <form class="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:gap-0" @submit.prevent="search">
            <div class="md:flex-2">
                <label class="mb-1 block text-label-m">{{ c.labels[0] }}</label>
                <div :class="field">
                    <Icon :name="c.icon" size="22" class="shrink-0 text-gray-500" />
                    <template v-if="type === 'flight'">
                        <AirportInput v-model="fromCode" label="From airport" placeholder="From" />
                        <span class="shrink-0">-</span>
                        <AirportInput v-model="toCode" label="To airport" placeholder="To" />
                    </template>
                    <template v-else>
                        <input v-model="first" type="text" list="city-options" class="w-full outline-none" />
                        <datalist id="city-options">
                            <option v-for="ci in cities" :key="ci" :value="ci" />
                        </datalist>
                    </template>
                </div>
            </div>

            <div class="md:flex-[1.4]">
                <label class="mb-1 block text-label-m">{{ c.labels[1] }}</label>
                <div :class="field">
                    <select v-model="second" :class="select">
                        <option v-for="o in c.secondOptions" :key="o">{{ o }}</option>
                    </select>
                    <Icon name="icon-park-outline:sort-two" size="20" class="shrink-0 text-primary-400" />
                </div>
            </div>

            <div class="md:flex-[2.6]">
                <label class="mb-1 block text-label-m">{{ c.labels[2] }}</label>
                <div :class="field">
                    <Icon name="icon-park-outline:user" size="22" class="shrink-0 text-primary-400" />
                    <select v-if="type === 'hotel'" v-model.number="adults" :class="[select, 'w-28']">
                        <option v-for="n in 6" :key="n" :value="n">{{ n }} {{ n === 1 ? 'Adult' : 'Adults' }}</option>
                    </select>
                    <template v-else>
                        <select v-model.number="flightAdults" aria-label="Adults"
                            :class="[selectBase, 'w-18 shrink-0']">
                            <option v-for="n in 9" :key="n" :value="n">{{ n }} {{ n === 1 ? 'Adult' : 'Adults' }}
                            </option>
                        </select>
                        <span class="-mx-1 shrink-0">-</span>
                        <select v-model.number="flightChildren" aria-label="Children"
                            :class="[selectBase, 'w-22 shrink-0']">
                            <option v-for="n in 10" :key="n" :value="n - 1">{{ n - 1 }} {{ n === 2 ? 'Child' :
                                'Children' }}</option>
                        </select>
                    </template>
                    <select v-model="third"
                        :class="type === 'hotel' ? [select, 'ml-2'] : [selectBase, 'ml-auto w-28 shrink-0']">
                        <option v-for="o in c.thirdOptions" :key="o">{{ o }}</option>
                    </select>
                    <Icon name="icon-park-outline:sort-two" size="20" class="shrink-0 text-primary-400" />
                </div>
            </div>

            <div class="md:flex-2">
                <label class="mb-1 block text-label-m">{{ c.labels[3] }}</label>
                <div :class="field">
                    <Icon name="icon-park-outline:calendar" size="22" class="shrink-0 text-primary-400" />
                    <template v-if="type === 'hotel'">
                        <span class="whitespace-nowrap">{{ fmt(checkin) }} - {{ fmt(checkout) }}</span>
                        <input v-model="checkin" type="date" :min="today" required aria-label="Check in"
                            class="absolute inset-y-0 left-0 w-1/2 cursor-pointer opacity-0" @click="openPicker" />
                        <input v-model="checkout" type="date" :min="checkin" required aria-label="Check out"
                            class="absolute inset-y-0 right-0 w-1/2 cursor-pointer opacity-0" @click="openPicker" />
                    </template>
                    <template v-else>
                        <span class="whitespace-nowrap">{{ fmt(departDate) }}<template v-if="second !== 'One Way'"> - {{
                                fmt(returnDate) }}</template></span>
                        <input v-model="departDate" type="date" :min="today" :max="maxDate" required
                            aria-label="Departure date"
                            :class="['absolute inset-y-0 left-0 cursor-pointer opacity-0', second === 'One Way' ? 'w-full' : 'w-1/2']"
                            @click="openPicker" />
                        <input v-if="second !== 'One Way'" v-model="returnDate" type="date" :min="departDate"
                            :max="maxDate" required aria-label="Return date"
                            class="absolute inset-y-0 right-0 w-1/2 cursor-pointer opacity-0" @click="openPicker" />
                    </template>
                </div>
            </div>

            <button type="submit"
                class="h-12.5 bg-primary-500 px-10 text-button-xxl text-white hover:bg-primary-600 md:flex-[1.2]">
                {{ c.button }}
            </button>
        </form>
        <p v-if="flightError" class="mt-2 text-body-xs text-error-light">{{ flightError }}</p>
    </section>
</template>