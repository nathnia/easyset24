<script setup lang="ts">
import { useLocationsStore } from '~/stores/locations'
import { stayFromQuery } from '~/utils/liteapi'

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
const second = ref(props.vip ?? c.second)
const third = ref(c.third)

const route = useRoute()
const stay = stayFromQuery(route.query)
const checkin = ref(stay.checkin)
const checkout = ref(stay.checkout)
const adults = ref(stay.adults)
const today = new Date().toISOString().slice(0, 10)

function search() {
    if (props.type === 'hotel') {
        navigateTo({ path: c.to, query: { cityName: first.value.trim(), checkin: checkin.value, checkout: checkout.value, adults: adults.value } })
    } else if (c.to) {
        navigateTo(c.to)
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
const select = 'w-full appearance-none bg-transparent outline-none'
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
                    <input v-model="first" type="text" :list="type === 'hotel' ? 'city-options' : undefined"
                        class="w-full outline-none" />
                    <datalist v-if="type === 'hotel'" id="city-options">
                        <option v-for="ci in cities" :key="ci" :value="ci" />
                    </datalist>
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
                    <span v-else class="whitespace-nowrap">2 Adults - 3 Children</span>
                    <select v-model="third" :class="[select, 'ml-2']">
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
                    <span v-else class="whitespace-nowrap">18 Dec 2023 - 23 Dec 2023</span>
                </div>
            </div>

            <button type="submit"
                class="h-12.5 bg-primary-500 px-10 text-button-xxl text-white hover:bg-primary-600 md:flex-[1.2]">
                {{ c.button }}
            </button>
        </form>
    </section>
</template>