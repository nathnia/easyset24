<script setup lang="ts">
type Direction = 'departure' | 'return'

const route = useRoute()

const direction = computed<Direction>(() => route.query.direction === 'return' ? 'return' : 'departure')
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

const flights = [
    { label: 'First Flight No From Stockholm', code: 'C650', airline: 'Delta Airlines', icon: '' }, // Delta triangle is drawn as SVG
    { label: 'Second Flight No From Rome', code: 'JSG113', airline: 'Turkish Airways', icon: 'simple-icons:turkishairlines' },
]

const weather = [
    { icon: 'icon-park-outline:snowflake', text: '-7 - Stockholm', extras: true },
    { icon: 'icon-park-outline:light-rain', text: '2 - Rome', extras: true },
    { icon: 'icon-park-outline:cloudy', text: '10 - Istanbul', extras: false },
]

const payments = ['logos:mastercard', 'logos:visa', 'logos:amex', 'logos:paypal']
const actions = [
    { icon: 'icon-park-outline:cube', label: '3d View' },
    { icon: 'icon-park-outline:share', label: 'Share' },
    { icon: 'icon-park-outline:help', label: 'Help' },
]

const planePath = 'M20.5 10.537C20.5 6.514 22.833 4.503 24 4c1.167.503 3.5 2.514 3.5 6.537v7.543L43 31v4l-16-8v9l5 8l-8-3l-8 3l5-8v-9L5 35v-4l15.5-12.92z'

const trips = {
    departure: {
        from: { code: 'ARN', city: 'Stockholm', time: 'CET(01 :00)', gate: '14D', top: 'top-8' },
        to: { code: 'SABIHA', city: 'Istanbul', time: 'CET (20:30)', gate: '23A', top: 'top-6' },
        price: 157,
        progress: 46,
        gates: [
            { place: 'ARN -Entrance C-Gate 23A', phone: '+467313', gray: true },
            { place: 'SABIHA - Exit L', phone: '+903348', gray: false },
            { place: 'FCO - Gate D14', phone: '+391245', gray: true },
        ],
        oneStopGray: false,
    },
    return: {
        from: { code: 'SABIHA', city: 'Istanbul', time: 'CET(01 :00)', gate: '21F', top: 'top-8' },
        to: { code: 'ARN', city: 'Stockholm', time: 'CET (20:30)', gate: '15B', top: 'top-6' },
        price: 120,
        progress: 48,
        gates: [
            { place: 'ARN -Entrance C-Gate 23A', phone: '+467313', gray: false },
            { place: 'SABIHA - Exit L', phone: '+903348', gray: true },
            { place: 'FCO - Gate D14', phone: '+391245', gray: false },
        ],
        oneStopGray: true,
    },
} as const

const trip = computed(() => trips[direction.value])

const tabs: { label: string, value: Direction }[] = [
    { label: 'Departure', value: 'departure' },
    { label: 'Return', value: 'return' },
]
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
                <h1 class="text-h5">One stop, 3h Between</h1>
                <div class="flex items-center gap-4">
                    <p class="text-h5">Flight Duration <span class="ml-1">9: 45h</span></p>
                    <NuxtLink to="/flights/search" aria-label="Close">
                        <Icon name="icon-park-outline:close" size="26" />
                    </NuxtLink>
                </div>
            </div>

            <!-- Departure / Return switch -->
            <nav class="flex gap-2 border-b border-gray-200 bg-white px-4 py-3" aria-label="Flight direction">
                <NuxtLink v-for="tab in tabs" :key="tab.value" :to="{ query: { direction: tab.value } }" replace
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
                    <div v-for="f in flights" :key="f.code"
                        class="flex h-14 items-center justify-between border-t border-white/25 px-4">
                        <p class="text-body-s">{{ f.label }} <b class="text-label-m">{{ f.code }}</b></p>
                        <p class="flex items-center gap-2 text-h5">
                            <svg v-if="!f.icon" viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
                                <path d="M12 3 22 20H2z" fill="#e01933" />
                                <path d="M12 10.5 16.5 18h-9z" fill="#fff" />
                            </svg>
                            <Icon v-else :name="f.icon" size="24" class="text-airline-turkish" />
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
                        class="flex h-23 w-23 items-center justify-center rounded-full bg-gray-300 text-h2 text-primary-500">FCO</span>
                </div>

                <!-- gates -->
                <div class="absolute inset-x-4 top-44.5 flex items-baseline justify-between">
                    <p class="text-body-s text-gray-500">Gate <b class="ml-1 text-h3">{{ trip.from.gate }}</b></p>
                    <p class="text-body-m">CET (18:00) <b class="mx-1 text-h6">Rome</b> CET (20:00)</p>
                    <p class="text-body-s text-gray-500">Gate <b class="ml-1 text-h3">{{ trip.to.gate }}</b></p>
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
                <div class="flex min-h-16 items-center justify-between gap-3 px-4 py-3"
                    :class="trip.oneStopGray ? 'bg-gray-300' : 'border border-gray-300 bg-white'">
                    <p class="text-label-m">One Stop, 3h Between</p>
                    <span class="text-right text-body-xs text-gray-500">It Is Not Possible To Exit The Airport</span>
                </div>
            </div>

            <!-- Weather + baggage -->
            <div class="grid gap-4 border-b border-gray-200 px-5 py-4 sm:grid-cols-3">
                <ul v-for="w in weather" :key="w.text" class="space-y-3 text-body-xs">
                    <li class="flex items-center gap-2 text-primary-500">
                        <Icon :name="w.icon" size="20" class="shrink-0" />{{ w.text }}
                    </li>
                    <template v-if="w.extras">
                        <li class="flex items-center gap-2">
                            <Icon name="icon-park-outline:weight" size="20" class="shrink-0" />15 Kg
                        </li>
                        <li class="flex items-center gap-2">
                            <Icon name="icon-park-outline:cat" size="20" class="shrink-0" />Pet Allowed
                        </li>
                    </template>
                </ul>
            </div>

            <!-- Price -->
            <div class="px-5 py-5">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p class="text-h3 text-success-dark">$ {{ trip.price }}</p>
                        <p class="text-body-xxs">Taxes Included</p>
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
                <NuxtLink :to="{ path: '/flights/payment', query: { flight: route.params.id, direction } }"
                    class="flex h-14 w-full items-center justify-center rounded-sm bg-primary-500 text-button-xl text-white hover:bg-primary-600 sm:w-75">
                    Purchase The Flight
                </NuxtLink>
            </div>
        </div>
    </section>
</template>