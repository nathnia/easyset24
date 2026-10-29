<script setup lang="ts">
withDefaults(
    defineProps<{
        name: string
        image: string
        count?: string
        rating?: string
    }>(),
    {
        count: '123',
        rating: '8,2',
    },
)
</script>

<template>
    <article
        class="group cursor-pointer rounded-md border border-gray-300 bg-white p-2 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-400 hover:shadow-lg">
        <div class="relative h-49.5 overflow-hidden rounded-sm bg-gray-300">
            <img :src="image" :alt="name"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

            <FavButton class="absolute left-2 top-2" />

            <div class="absolute inset-x-0 bottom-0 flex h-12 items-center justify-between bg-black/50 px-3">
                <span class="text-h5 text-white/80">{{ count }}</span>
                <span class="rounded-[6px] border-2 border-white/80 px-2 text-sm font-bold leading-snug text-white/90">
                    {{ rating }}
                </span>
            </div>
        </div>

        <h3 class="px-1 pb-1 pt-3 text-h5 transition-colors group-hover:text-primary-500">{{ name }}</h3>
    </article>
</template>