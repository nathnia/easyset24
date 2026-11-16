<script setup lang="ts">
import { filterGroups } from '~/data/flights'
import { useAirportsStore } from '~/stores/airports'
import { useFavouritesStore } from '~/stores/favourites'
import { useFlightsStore } from '~/stores/flights'
import { flightQueryFromRoute, formatFlightPrice, type FlightCard } from '~/utils/flights'

useHead({ title: 'Flight Search Result' })

// The search form puts everything in the URL; real offers come from LiteAPI
const route = useRoute()
const airports = useAirportsStore()
const flights = useFlightsStore()
const { cards, loading, error } = storeToRefs(flights)

useLazyAsyncData('flights', async () => {
    const q = flightQueryFromRoute(route.query)
    await Promise.all([airports.lookup(q.from), airports.lookup(q.to), flights.search(q)])
    return true
}, { server: false, watch: [() => route.fullPath] })

// "Stockholm" if we know the city, else the airport name from the offer
const place = (code: string, fallback: string) => airports.known[code]?.city || fallback || code

// the heart saves a flight in this browser; its link brings the person back to these results
const fav = useFavouritesStore()
function toggleFav(a: FlightCard) {
    fav.toggleFlight(a, {
        fromCity: place(a.out.fromCode, a.out.fromName),
        toCity: place(a.out.toCode, a.out.toName),
        link: route.fullPath,
    })
}

// airline logos that failed to load: fall back to the airline code
const logoFailed = reactive<Record<string, boolean>>({})

// ---- filters (frontend only, on the loaded results)
const clockMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const dep = reactive({ min: 0, max: 24 * 60 })
const dur = reactive({ min: 0, max: 24 })
const price = reactive({ min: 0, max: 1 })

// slider limits come from the real results
const durLimit = computed(() => Math.max(1, Math.ceil(Math.max(0, ...cards.value.map((c) => c.out.minutes)) / 60)))
const priceLimit = computed(() => Math.max(1, Math.ceil(Math.max(0, ...cards.value.map((c) => c.price)))))
const currency = computed(() => cards.value[0]?.currency || 'USD')

const aiFilter = ref(false)
const randomFilter = ref(true)
const stopOptions = ['Any', 'Non-stop', '1 stop', '2+ stops']
const selected = reactive<Record<string, any>>({
    airline: [] as string[],
    stops: 'Any',
    rating: 'Very Good 8+',
    popular: ['VIP'],
})

function resetFilters() {
    dep.min = 0
    dep.max = 24 * 60
    dur.min = 0
    dur.max = durLimit.value
    price.min = 0
    price.max = priceLimit.value
    selected.airline = []
    selected.stops = 'Any'
}
// a new search gives new limits: reset the filters
watch(cards, resetFilters, { immediate: true })

const filtered = computed(() => cards.value.filter((c) => {
    const d = clockMin(c.out.departure)
    if (d < dep.min || d > dep.max) return false
    if (c.out.minutes < dur.min * 60 || c.out.minutes > dur.max * 60) return false
    if (c.price < price.min || c.price > price.max) return false
    if (selected.airline.length && !selected.airline.includes(c.airline)) return false
    const st = c.out.stops
    if (selected.stops === 'Non-stop' && st !== 0) return false
    if (selected.stops === '1 stop' && st !== 1) return false
    if (selected.stops === '2+ stops' && st < 2) return false
    return true
}))

const pad = (n: number) => String(n).padStart(2, '0')
const clock = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

const sliders = computed(() => [
    {
        title: 'Departure time',
        model: dep,
        max: 24 * 60,
        step: 15,
        boxes: () => [
            { text: `From: ${clock(dep.min)}`, icon: 'icon-park-outline:take-off' },
            { text: `Up To :${clock(dep.max)}`, icon: 'icon-park-outline:landing' },
        ],
    },
    {
        title: 'Trip Duration',
        model: dur,
        max: durLimit.value,
        step: 1,
        boxes: () => [
            { text: `From: ${dur.min}h To ${dur.max}h`, icon: 'icon-park-outline:time' },
            { text: `${filtered.value.length} flights`, icon: 'icon-park-outline:sort-two' },
        ],
    },
    {
        title: 'Price',
        model: price,
        max: priceLimit.value,
        step: Math.max(1, Math.round(priceLimit.value / 100)),
        boxes: () => [
            { text: `From: ${formatFlightPrice(price.min, currency.value)}`, icon: 'icon-park-outline:down' },
            { text: `Up To :${formatFlightPrice(price.max, currency.value)}`, icon: 'icon-park-outline:up' },
        ],
    },
])
const fill = (m: { min: number; max: number }, max: number) => ({
    left: `${(m.min / max) * 100}%`,
    width: `${((m.max - m.min) / max) * 100}%`,
})

// sidebar groups: Stops and Airline are real, the rest stay as before
const showAllAirlines = ref(false)
const airlineNames = computed(() => [...new Set(cards.value.map((c) => c.airline))].sort())
const groups = computed(() => [
    { key: 'stops', title: 'Stops', type: 'radio', more: '', options: stopOptions },
    {
        key: 'airline',
        title: 'Airline',
        type: 'check',
        more: airlineNames.value.length > 5 ? (showAllAirlines.value ? 'Show Less' : 'Show More') : '',
        options: showAllAirlines.value ? airlineNames.value : airlineNames.value.slice(0, 5),
    },
    ...filterGroups.filter((g) => g.key !== 'airline'),
])

// Pagination: the API returns every flight at once, so we page them here
const PER_PAGE = 10
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const pageCards = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
const rangeText = computed(() => {
    const from = (page.value - 1) * PER_PAGE + 1
    const to = Math.min(page.value * PER_PAGE, filtered.value.length)
    return `Showing ${from}-${to} of ${filtered.value.length} flights`
})
// 1 ... 4 5 6 ... 12 : first, last, and the pages around the current one
const pageItems = computed<(number | string)[]>(() => {
    const total = totalPages.value
    const keep = new Set([1, total, page.value - 1, page.value, page.value + 1].filter((n) => n >= 1 && n <= total))
    const nums = [...keep].sort((a, b) => a - b)
    const out: (number | string)[] = []
    nums.forEach((n, i) => {
        if (i > 0 && n - nums[i - 1]! > 1) out.push('...')
        out.push(n)
    })
    return out
})
function goTo(p: number) {
    if (p < 1 || p > totalPages.value || p === page.value) return
    page.value = p
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}
// a new search or a filter change: start again at page 1
watch(filtered, () => { page.value = 1 })

</script>

<template>
    <div>
        <SearchForm type="flight" />

        <section class="page-container mt-12 grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside
                class="lg:sticky lg:top-24 lg:-mx-3 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:px-3 lg:pb-4 lg:scrollbar-thin">
                <div v-for="s in sliders" :key="s.title" class="mb-10 max-w-66.25">
                    <p class="text-body-xs">{{ s.title }}</p>

                    <div class="relative mt-4 h-6 max-w-56">
                        <div
                            class="pointer-events-none absolute inset-x-2.75 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gray-400">
                            <div class="absolute h-full bg-primary-500" :style="fill(s.model, s.max)" />
                        </div>
                        <input v-model.number="s.model.min" type="range" min="0" :max="s.max" :step="s.step"
                            aria-label="Minimum" class="range-input range-min"
                            :style="{ zIndex: s.model.min > s.max / 2 ? 5 : 3 }"
                            @input="s.model.min = Math.min(s.model.min, s.model.max)" />
                        <input v-model.number="s.model.max" type="range" min="0" :max="s.max" :step="s.step"
                            aria-label="Maximum" class="range-input range-max" style="z-index: 4"
                            @input="s.model.max = Math.max(s.model.max, s.model.min)" />
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-3">
                        <span v-for="b in s.boxes()" :key="b.icon"
                            class="flex items-center justify-between gap-1 rounded-sm border border-gray-300 px-2 py-2 text-body-xs text-gray-400">
                            {{ b.text }}
                            <Icon :name="b.icon" size="14" class="shrink-0" />
                        </span>
                    </div>
                </div>

                <div v-for="g in groups" :key="g.key" class="mt-8">
                    <h3 class="text-h6">{{ g.title }}</h3>
                    <ul class="mt-3 space-y-2">
                        <li v-for="o in g.options" :key="o">
                            <label class="flex cursor-pointer items-center gap-2 text-body-xs text-gray-500">
                                <input v-if="g.type === 'check'" v-model="selected[g.key]" type="checkbox" :value="o"
                                    class="filter-check" />
                                <input v-else v-model="selected[g.key]" type="radio" :value="o"
                                    class="h-4 w-4 accent-primary-500" />
                                {{ o }}
                            </label>
                        </li>
                    </ul>
                    <button v-if="g.more" type="button"
                        class="mt-2 flex items-center gap-1 text-body-xxs text-primary-500"
                        @click="g.key === 'airline' && (showAllAirlines = !showAllAirlines)">
                        {{ g.more }}
                        <Icon name="icon-park-outline:down" size="12" />
                    </button>
                </div>

                <div class="mt-10 space-y-6">
                    <label class="flex cursor-pointer items-start gap-4">
                        <input v-model="aiFilter" type="checkbox" class="filter-check mt-1 h-6! w-6!" />
                        <span class="text-body-xs">
                            <b class="text-label-m">Filter With the Help Of AI .</b>
                            <span class="text-label-xs"> See the results here !</span>
                        </span>
                    </label>
                    <label class="flex cursor-pointer items-start gap-4">
                        <input v-model="randomFilter" type="checkbox" class="filter-check mt-1 h-6! w-6!" />
                        <span class="text-body-xs">
                            <b class="text-label-m">Filter Randomly.</b>
                            <span class="text-label-xs"> See the results here !</span>
                        </span>
                    </label>
                </div>
            </aside>

            <div>
                <p v-if="loading"
                    class="rounded-md border border-gray-300 bg-white p-8 text-center text-body-s text-gray-500">
                    Searching flights...
                </p>
                <p v-else-if="error"
                    class="rounded-md border border-gray-300 bg-white p-8 text-center text-body-s text-error-light">
                    {{ error }}
                </p>
                <p v-else-if="!cards.length"
                    class="rounded-md border border-gray-300 bg-white p-8 text-center text-body-s text-gray-500">
                    No flights found for this route and date. Try different dates.
                </p>

                <p v-else-if="!filtered.length"
                    class="rounded-md border border-gray-300 bg-white p-8 text-center text-body-s text-gray-500">
                    No flights match your filters.
                    <button type="button" class="ml-1 text-primary-500 underline" @click="resetFilters">Clear
                        filters</button>
                </p>

                <div v-else class="space-y-12">
                    <article v-for="a in pageCards" :key="a.key"
                        class="flex flex-col gap-4 rounded-md border border-gray-300 bg-white p-2 transition-shadow hover:shadow-lg md:flex-row">
                        <div class="relative h-72 shrink-0 overflow-hidden rounded-sm bg-gray-300 md:h-auto md:w-62.5">
                            <img :src="flightImage(a.airline)" :alt="a.airline" loading="lazy"
                                class="absolute inset-0 h-full w-full object-cover"
                                @error="onFlightImgError($event, a.airline)" />
                            <span
                                class="absolute left-2 top-2 flex h-15 w-15 items-center justify-center rounded-full bg-white text-black">
                                <img v-if="a.logoUrl && !logoFailed[a.key]" :src="a.logoUrl" :alt="a.airline"
                                    class="h-10 w-10 object-contain" @error="logoFailed[a.key] = true" />
                                <span v-else class="text-label-m font-bold">{{ a.airlineCode }}</span>
                            </span>
                            <FavButton class="absolute right-2 top-2 z-10" size="sm"
                                :active="fav.isFlightFav(a, route.fullPath)" @click="toggleFav(a)" />
                            <div
                                class="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between bg-black/50 px-4 text-white">
                                <span class="truncate text-h6">{{ a.airline }}</span>
                                <span class="shrink-0 rounded-sm border border-white/80 px-1 text-button-s">{{ a.cabin
                                    }}</span>
                            </div>
                        </div>

                        <div class="grid flex-1 content-between gap-x-4 gap-y-5 py-2 pr-2 md:grid-cols-3">
                            <p class="flex items-center rounded-sm bg-gray-200 px-3 py-3 text-h6">
                                From <span class="ml-2 text-primary-500">{{ place(a.out.fromCode, a.out.fromName)
                                    }}</span>
                            </p>
                            <div class="text-center">
                                <svg viewBox="0 0 200 40" class="mx-auto h-6 w-full max-w-48" fill="none"
                                    aria-hidden="true">
                                    <path d="M2 36 Q 100 -14 198 36" stroke="#a6a6a6" stroke-width="1.5"
                                        stroke-dasharray="2 4" />
                                </svg>
                                <Icon name="icon-park-outline:airplane" size="16" class="-mt-8 mb-3 text-primary-500" />
                                <p class="text-body-s">Trip Duration : {{ a.out.duration }}</p>
                            </div>
                            <p class="flex items-center rounded-sm bg-gray-200 px-3 py-3 text-h6">
                                To <span class="ml-2 text-primary-500">{{ place(a.out.toCode, a.out.toName) }}</span>
                            </p>

                            <div>
                                <p class="text-body-m">{{ a.out.departure }}</p>
                                <p class="text-body-xs text-primary-400">Departure</p>
                            </div>
                            <div class="text-center">
                                <p class="text-body-m">{{ a.out.stops === 0 ? 'Non-stop' : a.out.stops + (a.out.stops
                                    === 1 ? ' stop' : ' stops') }}</p>
                                <p class="text-body-s text-primary-400">{{ a.out.stopText }}</p>
                            </div>
                            <div class="md:text-right">
                                <p class="text-body-m">{{ a.out.landing }}<sup v-if="a.out.dayChange"
                                        class="ml-1 text-body-xs text-gray-400">+{{ a.out.dayChange }}</sup></p>
                                <p class="text-body-xs text-primary-400">Landing</p>
                            </div>

                            <p class="flex items-center gap-2 rounded-sm bg-gray-200 px-3 py-2 text-body-xs">
                                <Icon name="icon-park-outline:take-off" size="16" class="shrink-0" />{{ a.out.fromCode
                                }} {{ a.out.fromName }}
                            </p>
                            <p
                                class="flex items-center justify-center gap-3 rounded-sm bg-gray-200 px-3 py-2 text-body-xs">
                                <Icon name="icon-park-outline:time" size="16" class="shrink-0" />{{ a.out.via }}
                            </p>
                            <p
                                class="flex items-center justify-end gap-2 rounded-sm bg-gray-200 px-3 py-2 text-body-xs">
                                {{ a.out.toCode }} {{ a.out.toName }}
                                <Icon name="icon-park-outline:landing" size="16" class="shrink-0" />
                            </p>

                            <p v-if="a.back"
                                class="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-sm bg-gray-100 px-3 py-2 text-body-xs md:col-span-3">
                                <b>Return</b>
                                <span>{{ a.back.fromCode }} {{ a.back.departure }} to {{ a.back.toCode }} {{
                                    a.back.landing }}<sup v-if="a.back.dayChange" class="ml-1 text-gray-400">+{{
                                        a.back.dayChange }}</sup></span>
                                <span>{{ a.back.duration }}</span>
                                <span>{{ a.back.stopText }}</span>
                            </p>

                            <div class="flex items-center justify-between gap-3">
                                <span class="text-h3 text-success-dark">{{ formatFlightPrice(a.price, a.currency)
                                    }}</span>
                                <span v-if="a.seats !== null"
                                    class="rounded-sm bg-success-light px-3 py-2 text-body-xs text-success-dark">{{
                                        a.seats }} {{ a.seats === 1 ? 'seat' : 'seats' }} left</span>
                            </div>
                            <p class="flex items-center justify-center rounded-sm bg-gray-200 px-3 py-2 text-body-xs">{{
                                a.baggage }}</p>
                            <NuxtLink
                                :to="{ path: `/flights/${a.key}`, query: { offer: a.offerId, adults: route.query.adults, children: route.query.children } }"
                                class="flex items-center justify-center rounded-sm bg-primary-500 py-2 text-button-xl text-white hover:bg-primary-600">
                                View Detail
                            </NuxtLink>
                        </div>
                    </article>
                </div>

                <div v-if="!loading && !error"
                    class="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-300 pt-8 md:flex-row">
                    <NuxtLink to="/favourites?tab=flights"
                        class="flex items-center justify-center gap-2 rounded-sm border border-primary-500 bg-white px-8 py-3 text-button-xxl text-primary-500 hover:bg-primary-500 hover:text-white">
                        List Your Favourite Places
                        <Icon name="icon-park-outline:like" size="18" />
                    </NuxtLink>
                    <nav v-if="!loading && !error && totalPages > 1" aria-label="Flight results pages"
                        class="flex flex-col items-center gap-3 md:items-end">
                        <p class="text-body-xs text-gray-500">{{ rangeText }}</p>
                        <ul class="flex flex-wrap items-center justify-center gap-2 md:justify-end">
                            <li>
                                <button type="button" :disabled="page === 1"
                                    class="rounded-sm border border-gray-300 bg-white px-4 py-2 text-body-xs hover:border-primary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-inherit"
                                    @click="goTo(page - 1)">Previous</button>
                            </li>
                            <li v-for="(item, idx) in pageItems" :key="`${item}-${idx}`">
                                <span v-if="typeof item === 'string'" class="px-2 text-gray-400">...</span>
                                <button v-else type="button" :aria-current="item === page ? 'page' : undefined"
                                    :class="['h-9 min-w-9 rounded-sm border px-3 text-body-xs',
                                        item === page ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 bg-white hover:border-primary-500 hover:text-primary-500']"
                                    @click="goTo(item)">{{ item }}</button>
                            </li>
                            <li>
                                <button type="button" :disabled="page === totalPages"
                                    class="rounded-sm border border-gray-300 bg-white px-4 py-2 text-body-xs hover:border-primary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-inherit"
                                    @click="goTo(page + 1)">Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>

            </div>
        </section>

        <div class="h-14" />
    </div>
</template>

<style scoped>
.filter-check {
    appearance: none;
    -webkit-appearance: none;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin: 0;
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 70%;
    transition: border-color 0.15s;
}

.filter-check:checked {
    border-color: #07689f;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2307689f' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 12.5l5 5L20 6.5'/%3E%3C/svg%3E");
}

.filter-check:focus-visible {
    outline: 2px solid rgba(7, 104, 159, 0.35);
    outline-offset: 2px;
}

.range-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    pointer-events: none;
}

.range-input::-webkit-slider-runnable-track {
    height: 24px;
    background: transparent;
}

.range-input::-moz-range-track {
    height: 24px;
    background: transparent;
}

.range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    pointer-events: auto;
    width: 22px;
    height: 22px;
    margin-top: 1px;
    border-radius: 9999px;
    cursor: pointer;
    transition: box-shadow 0.15s;
}

.range-input::-moz-range-thumb {
    pointer-events: auto;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    cursor: pointer;
    transition: box-shadow 0.15s;
}

.range-min::-webkit-slider-thumb {
    background: #efefef;
    border: 2px solid #07689f;
}

.range-min::-moz-range-thumb {
    background: #efefef;
    border: 2px solid #07689f;
}

.range-max::-webkit-slider-thumb {
    background: #07689f;
    border: 2px solid #07689f;
}

.range-max::-moz-range-thumb {
    background: #07689f;
    border: 2px solid #07689f;
}

.range-input:hover::-webkit-slider-thumb,
.range-input:active::-webkit-slider-thumb,
.range-input:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 12px rgba(7, 104, 159, 0.18);
}

.range-input:hover::-moz-range-thumb,
.range-input:active::-moz-range-thumb,
.range-input:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 12px rgba(7, 104, 159, 0.18);
}
</style>