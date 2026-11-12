<script setup lang="ts">
import { useFavouritesStore } from '~/stores/favourites'
import { formatFlightPrice } from '~/utils/flights'

useHead({ title: 'Flight Favorite' })

const fav = useFavouritesStore()

// airline logos that failed to load: fall back to the airline code
const logoFailed = reactive<Record<string, boolean>>({})
</script>

<template>
    <div class="page-container pb-16">
        <h1 class="mt-4 text-h4">Flight Favorite</h1>

        <p v-if="fav.loaded && !fav.flights.length" class="mt-6 text-body-s text-gray-500">
            No favourites yet. Tap the heart on a flight to save it here.
        </p>
        <div v-else class="mt-6 grid gap-6 lg:grid-cols-3">
            <article v-for="f in fav.flights" :key="f.key"
                class="flex gap-4 rounded-sm border border-gray-300 bg-white p-2 transition-shadow duration-300 hover:shadow-lg">
                <!-- Photo -->
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
                    <FavButton class="absolute right-2 top-2 z-10" size="sm" active @click="fav.removeFlight(f.key)" />
                    <div
                        class="absolute inset-x-0 bottom-0 flex h-9 items-center justify-between bg-black/50 px-3 text-white">
                        <span class="truncate text-label-m">{{ f.airline }}</span>
                        <span class="rounded-sm border border-white/80 px-1 text-button-xs">{{ f.airlineCode }}</span>
                    </div>
                </div>

                <!-- Info -->
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
    </div>
</template>