<script setup lang="ts">
import { useFavouritesStore } from '~/stores/favourites'

const fav = useFavouritesStore()
</script>

<template>
    <div>
        <section class="page-container py-14">
            <h1 class="text-h4 font-bold">Hotel Favourites</h1>
            <p v-if="fav.loaded && !fav.hotels.length" class="mt-8 text-body-s text-gray-500">
                No favourites yet. Tap the heart on a hotel to save it here.
            </p>
            <div v-else class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <HotelCard v-for="h in fav.hotels" :key="h.id" :hotel="h.card" compact :to="`/hotels/${h.id}`" />
            </div>
        </section>

    </div>
</template>