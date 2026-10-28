<script setup lang="ts">
const u = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const mapZoom = 11
const mapTiles = [618, 619, 620].flatMap(y => [1091, 1092, 1093].map(x => ({
    key: `${x}-${y}`,
    src: `https://tile.openstreetmap.org/${mapZoom}/${x}/${y}.png`,
})))

const hotels = [
    { id: 1, name: 'Radisson Blu', image: u('1610641818989-c2051b5e2cfd'), location: 'Located In Downton, 500m Distance to Shore', tagline: 'Experience Unique Opportunity', room: 'Standard rooms', ratingLabel: 'Very Good', reviews: '2,259 Reviews', rating: '8,2', discount: '12% Off', price: '$125', left: 'We Have 8 Left at 12% off' },
    { id: 2, name: 'Radisson Blu', image: u('1629140727571-9b5c6f6267b4'), location: 'Located In Downton,700m Distance to See', tagline: 'Traditional Room Design', room: 'Historical Café And Bar', ratingLabel: 'Excellent', reviews: '2,230 Reviews', rating: '8,2', discount: '10% Off', price: '$130', left: 'We Have 5 Left at 10 % off', vip: true },
    { id: 3, name: 'Radisson Blu', image: u('1520250497591-112f2f40a3f4'), location: 'Located In Downton, 500m Distance to Shore', tagline: 'Experience Unique Opportunity', room: 'Classic Room Design With Cultural Foods', ratingLabel: 'Very Good', reviews: '2,100 Reviews', rating: '8,2', discount: '8% Off', price: '$145', left: 'We Have 2 Left at 8 % off' },
    { id: 4, name: 'Radisson Blu', image: u('1540541338287-41700207dee6'), location: 'Located In Downton, 500m Distance to Shore', tagline: 'Suny Moments With Family Facilities', room: 'See View Balconies', ratingLabel: 'Good', reviews: '1258 Reviews', rating: '7,3', discount: '4% Off', price: '$150', left: 'We Have 21 Left at 4% off', vip: true },
    { id: 5, name: 'Radisson Blu', image: u('1584132967334-10e028bd69f7'), location: 'Located In Downton, 500m Distance to Shore', tagline: 'Modern Soundings', room: 'Special Leisure Activities', ratingLabel: 'Very Good', reviews: '2,259 Reviews', rating: '8,2', discount: '30% Off', price: '$218', left: 'We Have 6 Left at 30 % off' },
]

const filterGroups = [
    { key: 'popular', title: 'Popular Filters', type: 'check', options: ['Breakfast Included', 'All-Inclusive', 'Free Cancellation', 'Pool', 'Pet Friendly'] },
    { key: 'room', title: 'Room Facilities', type: 'check', options: ['Own Bathroom', 'Kitchen', 'See View', 'Baby Bed', 'Bathtub'] },
    { key: 'rating', title: 'Guests Rating', type: 'radio', options: ['All', 'Outstanding 9+', 'Very Good 8+', 'Good 7+', 'Excellent', 'Poor'] },
    { key: 'bed', title: 'Bed Type', type: 'radio', options: ['Two Single Beds', 'King Beds', 'Baby Cots', 'Double Bed', 'Single Beds'] },
    { key: 'leisure', title: 'Leisure Activities', type: 'check', options: ['Sauna', 'Fitness Centre', 'Bar', 'Steam Bath', 'Yoga'] },
    { key: 'sustain', title: 'Travel Sustainability', type: 'radio', options: ['Level 2 And Above 1', 'Level And Above 2'] },
    { key: 'stars', title: 'Accommodation Classification', type: 'radio', options: ['5 Stars', '4 Stars', '3 Stars'] },
    { key: 'distance', title: 'Distance From The Centre', type: 'radio', options: ['Less Than 1 Km', 'Less Than 5 Km', 'Less Than 15 Km'] },
]

const selected = reactive<Record<string, any>>({
    popular: ['Free Cancellation'],
    room: ['See View'],
    rating: 'Very Good 8+',
    bed: 'Baby Cots',
    leisure: ['Bar'],
    sustain: '',
    stars: '3 Stars',
    distance: 'Less Than 15 Km',
})

const RANGE_MAX = 500
const range = reactive({ min: 0, max: 250 })
const minText = ref('')
const maxText = ref('')

watch(() => range.min, (v) => {
    if (v > range.max) range.min = range.max
    minText.value = String(range.min)
})
watch(() => range.max, (v) => {
    if (v < range.min) range.max = range.min
    maxText.value = String(range.max)
})

const clamp = (n: number, a: number, b: number) => Math.min(Math.max(n, a), b)
function setMin(e: Event) {
    const n = Number((e.target as HTMLInputElement).value)
    if (!Number.isNaN(n)) range.min = clamp(n, 0, range.max)
    minText.value = String(range.min)
}
function setMax(e: Event) {
    const n = Number((e.target as HTMLInputElement).value)
    if (!Number.isNaN(n)) range.max = clamp(n, range.min, RANGE_MAX)
    maxText.value = String(range.max)
}

const fillStyle = computed(() => ({
    left: `${(range.min / RANGE_MAX) * 100}%`,
    width: `${((range.max - range.min) / RANGE_MAX) * 100}%`,
}))
</script>

<template>
    <div>
        <SearchForm place="Gothenburg" vip="Loyalty Gifts" />

        <section class="page-container mt-10 flex flex-col gap-6 md:flex-row md:items-stretch">
            <div
                class="relative h-45 w-full shrink-0 overflow-hidden rounded-sm border border-primary-400 bg-gray-200 md:h-auto md:min-h-45 md:w-60">
                <div class="pointer-events-none absolute left-1/2 top-1/2 grid w-3xl grid-cols-3"
                    style="transform: translate(-287px, -499px)">
                    <img v-for="t in mapTiles" :key="t.key" :src="t.src" alt="" width="256" height="256"
                        class="block h-64 w-[256px] max-w-none" loading="lazy" />
                </div>
                <Icon name="icon-park-outline:local-pin" size="28"
                    class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-primary-500" />
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener"
                    class="absolute bottom-0 right-0 bg-white/80 px-1 text-[8px] text-gray-500">© OpenStreetMap</a>
            </div>

            <div class="flex flex-col">
                <button type="button"
                    class="flex w-full max-w-62.5 items-center justify-between rounded-sm border border-gray-300 bg-white px-3 py-2 text-left">
                    <span class="text-body-xs"><b class="text-label-m">Sort By</b> : Our Top Picks For Families</span>
                    <Icon name="icon-park-outline:sort-two" size="18" />
                </button>
                <h2 class="mt-5 text-h4 text-gray-500">Gothenburg</h2>
                <p class="mt-1 text-body-xxs">120 Properties Found</p>
                <p class="mt-4 max-w-xl text-body-s text-gray-500">
                    Travel Professionals Dedicated To Simplifying Your Travel Experience By Curating Flight And
                    Accommodation
                    Services On A User-Friendly Platform. Committed To Quality And Assurance.
                    <NuxtLink to="#" class="text-caption-s font-bold text-primary-500">Find More Here ...</NuxtLink>
                </p>
            </div>
        </section>

        <section class="page-container mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside>
                <h2 class="text-h4 text-gray-500">Filter By</h2>
                <p class="mt-4 text-body-s">Your Budget For Per Night</p>

                <div class="relative mt-3 h-6 w-full">
                    <div
                        class="pointer-events-none absolute inset-x-2.75 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-400">
                        <div class="absolute h-full bg-primary-500" :style="fillStyle" />
                    </div>
                    <input v-model.number="range.min" type="range" min="0" :max="RANGE_MAX" step="5"
                        aria-label="Minimum price" class="range-input range-min"
                        :style="{ zIndex: range.min > RANGE_MAX / 2 ? 5 : 3 }" />
                    <input v-model.number="range.max" type="range" min="0" :max="RANGE_MAX" step="5"
                        aria-label="Maximum price" class="range-input range-max" style="z-index: 4" />
                </div>

                <div class="mt-3 grid grid-cols-2 gap-3">
                    <label
                        class="flex items-center justify-between rounded-sm border border-gray-400 px-3 py-2 text-gray-400 focus-within:border-primary-500">
                        <input :value="minText" type="number" min="0" placeholder="Min Price"
                            class="w-full bg-transparent text-body-s text-black outline-none placeholder:text-gray-400"
                            @change="setMin" />
                        <Icon name="icon-park-outline:dollar" size="18" class="shrink-0" />
                    </label>
                    <label
                        class="flex items-center justify-between rounded-sm border border-gray-400 px-3 py-2 text-gray-400 focus-within:border-primary-500">
                        <input :value="maxText" type="number" min="0" placeholder="Max Price"
                            class="w-full bg-transparent text-body-s text-black outline-none placeholder:text-gray-400"
                            @change="setMax" />
                        <Icon name="icon-park-outline:dollar" size="18" class="shrink-0" />
                    </label>
                </div>

                <div v-for="g in filterGroups" :key="g.key" class="mt-6">
                    <h3 class="text-label-m">{{ g.title }}</h3>
                    <ul class="mt-2 space-y-2">
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
                    <button type="button" class="mt-1 flex items-center gap-1 text-body-xxs text-primary-500">
                        Show More
                        <Icon name="icon-park-outline:down" size="12" />
                    </button>
                </div>
            </aside>

            <div>
                <div class="space-y-6">
                    <HotelCard v-for="h in hotels" :key="h.id" :hotel="h" :to="`/hotels/${h.id}`" />
                </div>

                <div class="mt-8 flex flex-col justify-between gap-4 sm:flex-row">
                    <NuxtLink to="/hotel-favourites"
                        class="flex items-center justify-center gap-2 rounded-sm border border-primary-500 bg-white px-8 py-3 text-button-xxl text-primary-500 hover:bg-primary-500 hover:text-white">
                        List Your Favourite Places
                        <Icon name="icon-park-outline:like" size="18" />
                    </NuxtLink>
                    <button type="button"
                        class="flex items-center justify-center gap-2 rounded-sm bg-primary-500 px-8 py-3 text-button-xxl text-white hover:bg-primary-600">
                        See More Search Results
                        <Icon name="icon-park-outline:right" size="16" />
                    </button>
                </div>
            </div>
        </section>
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
    background-size: 14px 14px;
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