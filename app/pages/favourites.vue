<script setup lang="ts">
import { useFavouritesStore } from '~/stores/favourites'
import { formatFlightPrice } from '~/utils/flights'

useHead({ title: 'Favourites' })

const route = useRoute()
const fav = useFavouritesStore()

// no tab = everything; ?tab=hotels or ?tab=flights shows one list
const tab = computed(() => (route.query.tab === 'hotels' || route.query.tab === 'flights' ? String(route.query.tab) : 'all'))
const tabs = computed(() => [
    { key: 'all', label: 'All', count: fav.hotels.length + fav.flights.length, to: { path: '/favourites' } },
    { key: 'hotels', label: 'Hotels', count: fav.hotels.length, to: { path: '/favourites', query: { tab: 'hotels' } } },
    { key: 'flights', label: 'Flights', count: fav.flights.length, to: { path: '/favourites', query: { tab: 'flights' } } },
])
const showHotels = computed(() => tab.value === 'hotels' || (tab.value === 'all' && fav.hotels.length > 0))
const showFlights = computed(() => tab.value === 'flights' || (tab.value === 'all' && fav.flights.length > 0))
const nothingSaved = computed(() => fav.loaded && !showHotels.value && !showFlights.value)
const tabBase = 'rounded-full border px-6 py-1.5 text-center text-caption-s'
const tabActive = 'border-primary-500 bg-primary-500 text-white'

// airline logos that failed to load: fall back to the airline code
const logoFailed = reactive<Record<string, boolean>>({})
</script>

<template>
    <div class="page-container pb-16 pt-6">
        <h1 class="text-h4 font-bold">Favourites</h1>

        <nav class="mt-6 flex gap-3" aria-label="Favourites">
            <NuxtLink v-for="t in tabs" :key="t.key" :to="t.to" replace
                :class="[tabBase, tab === t.key ? tabActive : 'border-gray-300 bg-white text-gray-400 hover:border-primary-400']">
                {{ t.label }}<template v-if="fav.loaded"> ({{ t.count }})</template>
            </NuxtLink>
        </nav>

        <p v-if="nothingSaved" class="mt-8 text-body-s text-gray-500">
            No favourites yet. Tap the heart on a hotel or a flight to save it here.
        </p>

        <!-- Hotels -->
        <section v-if="showHotels" class="mt-8">
            <h2 v-if="tab === 'all'" class="text-h5 font-bold">Hotels</h2>
            <p v-if="fav.loaded && !fav.hotels.length" class="text-body-s text-gray-500">
                No favourite hotels yet. Tap the heart on a hotel to save it here.
            </p>
            <div v-else class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <HotelCard v-for="h in fav.hotels" :key="h.id" :hotel="h.card" compact :to="`/hotels/${h.id}`" />
            </div>
        </section>

        <!-- Flights -->
        <section v-if="showFlights" class="mt-10">
            <h2 v-if="tab === 'all'" class="text-h5 font-bold">Flights</h2>
            <p v-if="fav.loaded && !fav.flights.length" class="text-body-s text-gray-500">
                No favourite flights yet. Tap the heart on a flight to save it here.
            </p>
            <div v-else class="mt-4 grid gap-6 lg:grid-cols-3">
                <article v-for="f in fav.flights" :key="f.key"
                    class="flex gap-4 rounded-sm border border-gray-300 bg-white p-2 transition-shadow duration-300 hover:shadow-lg">
                    <div class="relative h-58 w-44 shrink-0 overflow-hidden rounded-sm bg-gray-300 sm:w-50">
                        <img :src="flightImage(f.airline, 400, 500)" :alt="f.airline"
                            class="absolute inset-0 h-full w-full object-cover"
                            @error="onFlightImgError($event, f.airline, 400, 500)" />
                        <span
                            class="absolute left-2 top-2 flex h-15 w-15 items-center justify-center rounded-full bg-white text-black">
                            <img v-if="f.logoUrl && !logoFailed[f.key]" :src="f.logoUrl" :alt="f.airline"
                                class="h-10 w-10 object-contain" @error="logoFailed[f.key] = true" />
                            <span v-else class="text-label-m font-bold">{{ f.airlineCode }}</span>
                        </span>
                        <FavButton class="absolute right-2 top-2 z-10" size="sm" active
                            @click="fav.removeFlight(f.key)" />
                        <div
                            class="absolute inset-x-0 bottom-0 flex h-9 items-center justify-between bg-black/50 px-3 text-white">
                            <span class="truncate text-label-m">{{ f.airline }}</span>
                            <span class="rounded-sm border border-white/80 px-1 text-button-xs">{{ f.airlineCode
                                }}</span>
                        </div>
                    </div>

                    <div class="flex min-w-0 flex-1 flex-col py-2 pr-1">
                        <p class="text-h6">From <span class="ml-1 text-primary-500">{{ f.fromCity }}</span></p>
                        <p class="mt-2 text-h6">To <span class="ml-2 text-primary-500">{{ f.toCity }}</span></p>

                        <p class="mt-5 text-button-xxl">{{ formatFlightPrice(f.price, f.currency) }}</p>
                        <ul class="mt-1 space-y-1 text-body-xs">
                            <li class="flex items-center gap-2">
                                <Icon name="icon-park-outline:luggage" size="14" class="shrink-0" />{{ f.fromLine }}
                            </li>
                            <li class="flex items-center gap-2">
                                <Icon name="icon-park-outline:loading" size="14" class="shrink-0" />{{ f.viaLine }}
                            </li>
                            <li class="flex items-center gap-2">
                                <Icon name="icon-park-outline:luggage" size="14" class="shrink-0" />{{ f.toLine }}
                            </li>
                        </ul>

                        <NuxtLink :to="f.link"
                            class="mt-auto flex items-center justify-between pt-3 text-h6 text-primary-500 hover:underline">
                            See Availability
                            <Icon name="icon-park-outline:right" size="14" />
                        </NuxtLink>
                    </div>
                </article>
            </div>
        </section>
    </div>
</template>