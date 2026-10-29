<script setup lang="ts">
useHead({ title: 'Flight Favorite' })

const flights = [
    { name: 'Lufthansa', logo: 'bg-white text-black', icon: 'simple-icons:lufthansa', iconSize: 56 },
    { name: 'Delta Airlines', logo: 'bg-white', icon: '', iconSize: 0 }, // Delta triangle is drawn as SVG
    { name: 'British Airways', logo: 'bg-white text-airline-british', icon: 'simple-icons:britishairways', iconSize: 40 },
]

const info = {
    from: 'Stockholm',
    to: 'Istanbul',
    price: '$75',
    airports: [
        { icon: 'icon-park-outline:luggage', text: 'SAW Istanbul Sabiha' },
        { icon: 'icon-park-outline:loading', text: 'FCO Rome Fiumicino' },
        { icon: 'icon-park-outline:luggage', text: 'SAW Istanbul Sabiha' },
    ],
}
</script>

<template>
    <div class="page-container pb-16">
        <h1 class="mt-4 text-h4">Flight Favorite</h1>

        <div class="mt-6 grid gap-6 lg:grid-cols-3">
            <article v-for="f in flights" :key="f.name"
                class="flex gap-4 rounded-sm border border-gray-300 bg-white p-2 transition-shadow duration-300 hover:shadow-lg">
                <!-- Photo -->
                <div class="relative h-58 w-44 shrink-0 overflow-hidden rounded-sm bg-gray-300 sm:w-50">
                    <img :src="flightImage(f.name, 400, 500)" :alt="f.name"
                        class="absolute inset-0 h-full w-full object-cover"
                        @error="onFlightImgError($event, f.name, 400, 500)" />
                    <span class="absolute left-2 top-2 flex h-15 w-15 items-center justify-center rounded-full"
                        :class="f.logo">
                        <svg v-if="!f.icon" viewBox="0 0 24 24" class="h-8 w-8" aria-label="Delta">
                            <path d="M12 3 22 20H2z" fill="#e01933" />
                            <path d="M12 10.5 16.5 18h-9z" fill="#fff" />
                        </svg>
                        <Icon v-else :name="f.icon" :size="f.iconSize" />
                    </span>
                    <div
                        class="absolute inset-x-0 bottom-0 flex h-9 items-center justify-between bg-black/50 px-3 text-white">
                        <span class="truncate text-label-m">{{ f.name }}</span>
                        <span class="rounded-sm border border-white/80 px-1 text-button-xs">8,2</span>
                    </div>
                </div>

                <!-- Info -->
                <div class="flex min-w-0 flex-1 flex-col py-2 pr-1">
                    <p class="text-h6">From <span class="ml-1 text-primary-500">{{ info.from }}</span></p>
                    <p class="mt-2 text-h6">To <span class="ml-2 text-primary-500">{{ info.to }}</span></p>

                    <p class="mt-5 text-button-xxl">{{ info.price }}</p>
                    <ul class="mt-1 space-y-1 text-body-xs">
                        <li v-for="(a, i) in info.airports" :key="i" class="flex items-center gap-2">
                            <Icon :name="a.icon" size="14" class="shrink-0" />{{ a.text }}
                        </li>
                    </ul>

                    <NuxtLink to="#"
                        class="mt-auto flex items-center justify-between pt-3 text-h6 text-primary-500 hover:underline">
                        See Avaiability
                        <Icon name="icon-park-outline:right" size="14" />
                    </NuxtLink>
                </div>
            </article>
        </div>
    </div>
</template>