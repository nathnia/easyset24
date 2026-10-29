<script setup lang="ts">
withDefaults(
    defineProps<{
        city: string
        image: string
        label?: string
        date?: string
        description?: string
        rating?: string
        stars?: number
    }>(),
    {
        label: 'SIDE',
        date: 'Wed 25 Jan-Fri 27 Jan',
        description: 'A Tour Of The City And Its Surroundings Led By A Professional Guide ...',
        rating: '8,2',
        stars: 4,
    },
)
</script>

<template>
    <article
        class="group cursor-pointer rounded-md border border-gray-300 bg-white p-2 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-400 hover:shadow-lg">
        <div class="relative h-49.5 overflow-hidden rounded-sm bg-gray-300">
            <img :src="image" :alt="city"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

            <FavButton class="absolute left-2 top-2" />

            <div class="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between bg-black/50 px-2">
                <div class="flex gap-1 text-white/75">
                    <Icon v-for="n in stars" :key="n" name="icon-park-outline:sun-one" size="20" />
                </div>
                <span
                    class="rounded-[6px] border-2 border-white/80 px-1.5 text-xs font-bold leading-snug text-white/90">
                    {{ rating }}
                </span>
            </div>
        </div>

        <div class="px-1 pb-2 pt-3">
            <h3 class="text-h5 transition-colors group-hover:text-primary-500">{{ city }}</h3>
            <p class="text-subtitle-l text-gray-400">{{ label }}</p>
            <p class="mt-3 text-label-m">{{ date }}</p>
            <p class="mt-2 text-body-xs">{{ description }}</p>
        </div>
    </article>
</template>