<script setup lang="ts">
import { useAirportsStore } from '~/stores/airports'
import { useFlightsStore } from '~/stores/flights'
import { formatDate, formatFlightPrice } from '~/utils/flights'

type Direction = 'departure' | 'return'

const route = useRoute()
const airports = useAirportsStore()
const flightStore = useFlightsStore()
const { detail, detailLoading: loading, detailError: error } = storeToRefs(flightStore)

// The search page links here with ?offer=<offerId>; LiteAPI verifies it
const offerId = computed(() => (typeof route.query.offer === 'string' ? route.query.offer : ''))

useLazyAsyncData('flight-verify', async () => {
    await flightStore.verify(offerId.value)
    const d = flightStore.detail
    if (d) {
        // city names for the airport codes (not awaited: the page is already usable)
        const codes = new Set<string>()
        for (const l of [d.out, d.back]) for (const s of l?.segments ?? []) { codes.add(s.fromCode); codes.add(s.toCode) }
        void Promise.all([...codes].filter(Boolean).map((c) => airports.lookup(c)))
    }
    return true
}, { server: false, watch: [offerId] })

const direction = computed<Direction>(() => (route.query.direction === 'return' && detail.value?.back ? 'return' : 'departure'))
const isReturn = computed(() => direction.value === 'return')

useHead({
    title: computed(() => isReturn.value ? 'Flight Detail (Return)' : 'Flight Detail'),
})

const mapZoom = 5
const mapTiles = [7, 8, 9, 10, 11, 12, 13].flatMap(y => [14, 15, 16, 17, 18, 19, 20].map(x => ({
    key: `${x}-${y}`,
    src: `https://tile.openstreetmap.org/${mapZoom}/${x}/${y}.png`,
})))

const heroImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80'

const payments = ['logos:mastercard', 'logos:visa', 'logos:amex', 'logos:paypal']
const actions = [
    { icon: 'icon-park-outline:cube', label: '3d View' },
    { icon: 'icon-park-outline:share', label: 'Share' },
    { icon: 'icon-park-outline:help', label: 'Help' },
]

const planePath = 'M20.5 10.537C20.5 6.514 22.833 4.503 24 4c1.167.503 3.5 2.514 3.5 6.537v7.543L43 31v4l-16-8v9l5 8l-8-3l-8 3l5-8v-9L5 35v-4l15.5-12.92z'

// ---- real data for the same slots the design already had

const leg = computed(() => (isReturn.value ? detail.value?.back : detail.value?.out) ?? null)

// The search card (if we came from the results) knows the exact duration and layover times
const card = computed(() => flightStore.cards.find((c) => c.key === route.params.id))
const cardLeg = computed(() => (isReturn.value ? card.value?.back : card.value?.out) ?? null)
const duration = computed(() => cardLeg.value?.duration || '-')
const layovers = computed(() => (cardLeg.value?.layovers.length ? cardLeg.value.layovers : leg.value?.layovers) ?? [])

// "Stockholm" if we know the city, else the airport name
const place = (code: string, fallback: string) => airports.known[code]?.city || fallback || code

// "One Stop, 3h Between"
const headline = computed(() => {
    const l = leg.value
    if (!l) return ''
    if (l.stops === 0) return 'Non-stop'
    if (l.stops > 1) {
        const times = layovers.value.map((x) => x.duration).filter(Boolean)
        return times.length ? `${l.stops} Stops, ${times.join(' & ')} Between` : `${l.stops} Stops`
    }
    const d = layovers.value[0]?.duration
    return d ? `One Stop, ${d} Between` : 'One Stop'
})

const logoFailed = reactive<Record<string, boolean>>({})

const ORDINALS = ['First', 'Second', 'Third', 'Fourth']
const flights = computed(() => (leg.value?.segments ?? []).map((s, i) => ({
    key: `${s.flightNo}-${i}`,
    label: `${ORDINALS[i] ?? `Flight ${i + 1}`} Flight No From ${place(s.fromCode, s.fromName)}`,
    code: s.flightNo || '-',
    airline: s.airline,
    logoUrl: s.logoUrl,
})))

const trip = computed(() => {
    const l = leg.value
    const segs = l?.segments ?? []
    const f = segs[0]
    const t = segs[segs.length - 1]
    const lay = layovers.value
    const gray = (i: number) => i % 2 === (isReturn.value ? 1 : 0)

    const points = f && t ? [
        { place: `${f.fromCode} - ${f.fromName}`, phone: f.departure },
        ...segs.slice(0, -1).map((s, i) => ({ place: `${s.toCode} - ${s.toName}`, phone: `${s.landing} - ${segs[i + 1]!.departure}` })),
        { place: `${t.toCode} - ${t.toName}`, phone: t.landing },
    ] : []

    return {
        from: { code: f?.fromCode ?? '', city: place(f?.fromCode ?? '', f?.fromName ?? ''), time: formatDate(l?.date ?? ''), gate: f?.departure ?? '', top: 'top-8' },
        to: { code: t?.toCode ?? '', city: place(t?.toCode ?? '', t?.toName ?? ''), time: formatDate(l?.arriveDate ?? ''), gate: t ? `${t.landing}${t.dayChange ? ` +${t.dayChange}` : ''}` : '', top: 'top-6' },
        stopCode: lay[0]?.code ?? '',
        stopArrive: segs.length > 1 ? segs[0]!.landing : '',
        stopDepart: segs.length > 1 ? segs[1]!.departure : '',
        stopNote: lay[0]?.changeAirport ? 'You Must Change Airports' : lay[0]?.overnight ? 'Overnight Layover' : l?.stops === 0 ? 'Direct Flight, No Layover' : '',
        progress: isReturn.value ? 48 : 46,
        gates: points.map((p, i) => ({ ...p, gray: gray(i) })),
        oneStopGray: isReturn.value,
    }
})

// baggage + fare rules (LiteAPI has no weather data)
const weather = computed(() => {
    const d = detail.value
    if (!d) return []
    return [
        { icon: 'icon-park-outline:weight', text: 'Cabin Bag', extras: [{ icon: 'icon-park-outline:weight', text: d.cabinBag }] },
        { icon: 'icon-park-outline:weight', text: 'Checked Bag', extras: [{ icon: 'icon-park-outline:weight', text: d.checkedBag }] },
        {
            icon: 'icon-park-outline:time',
            text: d.seats !== null ? `${d.fare} (${d.seats} left)` : d.fare,
            extras: d.terms.slice(0, 2).map((t) => ({ icon: 'icon-park-outline:time', text: t.message })),
        },
    ]
})

const tabs = computed<{ label: string, value: Direction }[]>(() => [
    { label: 'Departure', value: 'departure' },
    ...(detail.value?.back ? [{ label: 'Return', value: 'return' as Direction }] : []),
])
</script>

<template>
    <section class="relative overflow-hidden bg-gray-200 px-4 py-11">
        <!-- map -->
        <div
            class="pointer-events-none absolute left-1/2 top-0 grid w-369.25 -translate-x-1/2 grid-cols-7 opacity-70 grayscale">
            <img v-for="t in mapTiles" :key="t.key" :src="t.src" alt="" width="211" height="211"
                class="block h-52.75 w-52.75 max-w-none" loading="lazy" />
        </div>

        <!-- modal -->
        <div
            class="relative mx-auto w-full max-w-164.5 overflow-hidden rounded-md border-4 border-gray-400 bg-white shadow-xl">
            <!-- Header -->
            <div class="flex h-21.5 items-center justify-between bg-primary-500 px-4 text-white">
                <h1 class="text-h5">{{ loading ? 'Checking this fare...' : headline }}</h1>
                <div class="flex items-center gap-4">
                    <p v-if="leg" class="text-h5">Flight Duration <span class="ml-1">{{ duration }}</span></p>
                    <NuxtLink to="/flights/search" aria-label="Close">
                        <Icon name="icon-park-outline:close" size="26" />
                    </NuxtLink>
                </div>
            </div>

            <!-- Loading / error -->
            <p v-if="loading" class="px-6 py-20 text-center text-body-m text-gray-500">
                Confirming that this flight is still available and getting the latest price...
            </p>
            <div v-else-if="error || !detail || !leg" class="px-6 py-16 text-center">
                <p class="text-body-m text-error-light">{{ error || 'We could not load this flight.' }}</p>
                <NuxtLink to="/flights/search"
                    class="mt-6 inline-flex rounded-sm bg-primary-500 px-8 py-3 text-button-xl text-white hover:bg-primary-600">
                    Back to search results
                </NuxtLink>
            </div>

            <template v-else>
                <!-- Departure / Return switch -->
                <nav v-if="tabs.length > 1" class="flex gap-2 border-b border-gray-200 bg-white px-4 py-3"
                    aria-label="Flight direction">
                    <NuxtLink v-for="tab in tabs" :key="tab.value"
                        :to="{ query: { ...route.query, direction: tab.value } }" replace
                        :aria-current="direction === tab.value ? 'page' : undefined"
                        class="rounded-full px-5 py-1.5 text-label-m" :class="direction === tab.value
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-400 text-gray-500 hover:border-primary-500 hover:text-primary-500'">
                        {{ tab.label }}
                    </NuxtLink>
                </nav>

                <!-- Photo + flight numbers -->
                <div class="relative h-85 bg-gray-300">
                    <img :src="heroImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
                    <div
                        class="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-black/90 via-black/60 to-transparent" />
                    <div class="absolute inset-x-0 bottom-0 text-white">
                        <div v-for="f in flights" :key="f.key"
                            class="flex h-14 items-center justify-between gap-3 border-t border-white/25 px-4">
                            <p class="truncate text-body-s">{{ f.label }} <b class="text-label-m">{{ f.code }}</b></p>
                            <p class="flex shrink-0 items-center gap-2 text-h5">
                                <img v-if="f.logoUrl && !logoFailed[f.key]" :src="f.logoUrl" :alt="f.airline"
                                    class="h-6 w-6 rounded-full bg-white object-contain"
                                    @error="logoFailed[f.key] = true" />
                                {{ f.airline }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="relative h-73.75 px-4" :class="isReturn
                    ? 'bg-[linear-gradient(to_right,#ffffff_51%,#d9d9d9_51%)]'
                    : 'bg-[linear-gradient(to_right,#d9d9d9_49%,#ffffff_49%)]'">
                    <div class="absolute left-4" :class="trip.from.top">
                        <p class="text-h2 text-primary-500">{{ trip.from.code }}</p>
                        <p class="mt-2 text-h6">{{ trip.from.city }}</p>
                        <p class="mt-1 text-body-s">{{ trip.from.time }}</p>
                    </div>
                    <div class="absolute right-4 text-right" :class="trip.to.top">
                        <p class="text-h2 text-primary-500">{{ trip.to.code }}</p>
                        <p class="mt-2 text-h6">{{ trip.to.city }}</p>
                        <p class="mt-1 text-body-s">{{ trip.to.time }}</p>
                    </div>

                    <!-- FCO -->
                    <div
                        class="absolute left-1/2 top-5 flex h-35 w-35 -translate-x-1/2 items-center justify-center rounded-full bg-white">
                        <span class="absolute inset-2.25 rounded-full border border-dashed border-gray-400" />
                        <span
                            class="flex h-23 w-23 items-center justify-center rounded-full bg-gray-300 text-h2 text-primary-500"><template
                                v-if="trip.stopCode">{{ trip.stopCode }}</template>
                            <Icon v-else name="icon-park-outline:airplane" size="36" />
                        </span>
                    </div>

                    <!-- gates -->
                    <div class="absolute inset-x-4 top-44.5 flex items-baseline justify-between">
                        <p class="text-body-s text-gray-500">Departs <b class="ml-1 text-h3">{{ trip.from.gate }}</b>
                        </p>
                        <p class="text-body-m">{{ trip.stopArrive }} <b class="mx-1 text-h6">{{ trip.stopCode ||
                            'Non-stop' }}</b> {{
                                    trip.stopDepart }}</p>
                        <p class="text-body-s text-gray-500">Arrives <b class="ml-1 text-h3">{{ trip.to.gate }}</b></p>
                    </div>

                    <!-- progress -->
                    <div class="absolute inset-x-0 bottom-5 flex items-center">
                        <template v-if="!isReturn">
                            <div class="h-2 rounded-full bg-primary-500" :style="{ width: `${trip.progress}%` }" />
                            <svg viewBox="0 0 48 48" class="h-10 w-10 shrink-0 rotate-90" aria-hidden="true">
                                <path fill="#fff" stroke="#07689f" stroke-width="3" stroke-linecap="round"
                                    stroke-linejoin="round" :d="planePath" />
                            </svg>
                            <div class="-ml-1 h-2 flex-1 rounded-r-full bg-gray-300" />
                        </template>

                        <template v-else>
                            <div class="-mr-1 h-2 rounded-l-full bg-gray-300" :style="{ width: `${trip.progress}%` }" />
                            <svg viewBox="0 0 48 48" class="h-10 w-10 shrink-0 -rotate-90" aria-hidden="true">
                                <path fill="#fff" stroke="#07689f" stroke-width="3" stroke-linecap="round"
                                    stroke-linejoin="round" :d="planePath" />
                            </svg>
                            <div class="h-2 flex-1 rounded-full bg-primary-500" />
                        </template>
                    </div>
                </div>

                <!-- Gates info -->
                <div class="grid gap-3 p-2 sm:grid-cols-2">
                    <div v-for="g in trip.gates" :key="g.place"
                        class="flex min-h-16 items-center justify-between gap-3 px-4 py-3"
                        :class="g.gray ? 'bg-gray-300' : 'border border-gray-300 bg-white'">
                        <p class="text-label-m">{{ g.place }}</p>
                        <span class="text-body-s text-gray-500">{{ g.phone }}</span>
                    </div>
                    <div v-if="leg.stops > 0 && trip.gates.length % 2 === 1"
                        class="flex min-h-16 items-center justify-between gap-3 px-4 py-3"
                        :class="trip.oneStopGray ? 'bg-gray-300' : 'border border-gray-300 bg-white'">
                        <p class="text-label-m">{{ headline }}</p>
                        <span class="text-right text-body-xs text-gray-500">{{ trip.stopNote }}</span>
                    </div>
                </div>

                <!-- Weather + baggage -->
                <div class="grid gap-4 border-b border-gray-200 px-5 py-4 sm:grid-cols-3">
                    <ul v-for="w in weather" :key="w.text" class="space-y-3 text-body-xs">
                        <li class="flex items-center gap-2 text-primary-500">
                            <Icon :name="w.icon" size="20" class="shrink-0" />{{ w.text }}
                        </li>
                        <li v-for="e in w.extras" :key="e.text" class="flex items-center gap-2">
                            <Icon :name="e.icon" size="20" class="shrink-0" />{{ e.text }}
                        </li>
                    </ul>
                </div>

                <!-- Price -->
                <div class="px-5 py-5">
                    <p v-if="detail.priceChange"
                        class="mb-4 rounded-sm bg-gray-200 px-3 py-2 text-body-xs text-error-light">
                        The price changed since your search: {{ formatFlightPrice(detail.priceChange.oldPrice,
                            detail.currency) }}
                        to {{ formatFlightPrice(detail.priceChange.newPrice, detail.currency) }}.
                    </p>
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p class="text-h3 text-success-dark">{{ formatFlightPrice(detail.price, detail.currency) }}
                            </p>
                            <p class="text-body-xxs">Taxes Included<template v-if="detail.back"> - Round Trip
                                    Total</template></p>
                        </div>
                        <div class="flex items-center gap-8">
                            <Icon v-for="p in payments" :key="p" :name="p" size="46" />
                        </div>
                    </div>
                    <p class="mt-2 text-right text-body-m">Transactions Are Encrypted By EasySet24</p>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-500 p-3">
                    <div class="flex gap-6 pl-2 text-white">
                        <button v-for="a in actions" :key="a.label" type="button"
                            class="flex flex-col items-center gap-1 text-label-m hover:opacity-80">
                            <Icon :name="a.icon" size="28" />{{ a.label }}
                        </button>
                    </div>
                    <NuxtLink
                        :to="{ path: '/flights/payment', query: { flight: route.params.id, direction, offer: offerId, adults: route.query.adults, children: route.query.children } }"
                        class="flex h-14 w-full items-center justify-center rounded-sm bg-primary-500 text-button-xl text-white hover:bg-primary-600 sm:w-75">
                        Purchase The Flight
                    </NuxtLink>
                </div>
            </template>
        </div>
    </section>
</template>