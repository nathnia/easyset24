<script setup lang="ts">
import { filterGroups, airlines, info } from '~/data/flights'

useHead({ title: 'Flight Search Result' })

const dep = reactive({ min: 12 * 60, max: 16 * 60 + 45 })
const dur = reactive({ min: 7, max: 12 })

const pad = (n: number) => String(n).padStart(2, '0')
const clock = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

const sliders = [
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
        max: 24,
        step: 1,
        boxes: () => [
            { text: `From: ${dur.min}h To ${dur.max}h`, icon: 'icon-park-outline:time' },
            { text: 'One Stop', icon: 'icon-park-outline:sort-two' },
        ],
    },
]
const fill = (m: { min: number; max: number }, max: number) => ({
    left: `${(m.min / max) * 100}%`,
    width: `${((m.max - m.min) / max) * 100}%`,
})

const selected = reactive<Record<string, any>>({
    airline: ['Lufthansa'],
    rating: 'Very Good 8+',
    popular: ['VIP'],
})
const aiFilter = ref(false)
const randomFilter = ref(true)

</script>

<template>
    <div>
        <SearchForm type="flight" />

        <section class="page-container mt-12 grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside>
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

                <div v-for="g in filterGroups" :key="g.key" class="mt-8">
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
                    <button type="button" class="mt-2 flex items-center gap-1 text-body-xxs text-primary-500">
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
                <div class="space-y-12">
                    <article v-for="(a, i) in airlines" :key="a.name"
                        class="flex flex-col gap-4 rounded-md border border-gray-300 bg-white p-2 transition-shadow hover:shadow-lg md:flex-row">
                        <div class="relative h-72 shrink-0 overflow-hidden rounded-sm bg-gray-300 md:h-auto md:w-62.5">
                            <img :src="flightImage(a.name)" :alt="a.name"
                                class="absolute inset-0 h-full w-full object-cover"
                                @error="onFlightImgError($event, a.name)" />
                            <span class="absolute left-2 top-2 flex h-15 w-15 items-center justify-center rounded-full"
                                :class="a.logo">
                                <svg v-if="!a.icon" viewBox="0 0 24 24" class="h-8 w-8" aria-label="Delta">
                                    <path d="M12 3 22 20H2z" fill="#e01933" />
                                    <path d="M12 10.5 16.5 18h-9z" fill="#fff" />
                                </svg>
                                <Icon v-else :name="a.icon" :size="a.iconSize" />
                            </span>
                            <div
                                class="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between bg-black/50 px-4 text-white">
                                <span class="text-h6">{{ a.name }}</span>
                                <span class="rounded-sm border border-white/80 px-1 text-button-s">8,2</span>
                            </div>
                        </div>

                        <div class="grid flex-1 content-between gap-x-4 gap-y-5 py-2 pr-2 md:grid-cols-3">
                            <p class="flex items-center rounded-sm bg-gray-200 px-3 py-3 text-h6">
                                From <span class="ml-2 text-primary-500">{{ info.from }}</span>
                            </p>
                            <div class="text-center">
                                <svg viewBox="0 0 200 40" class="mx-auto h-6 w-full max-w-48" fill="none"
                                    aria-hidden="true">
                                    <path d="M2 36 Q 100 -14 198 36" stroke="#a6a6a6" stroke-width="1.5"
                                        stroke-dasharray="2 4" />
                                </svg>
                                <Icon name="icon-park-outline:airplane" size="16" class="-mt-8 mb-3 text-primary-500" />
                                <p class="text-body-s">Trip Duration : {{ info.duration }}</p>
                            </div>
                            <p class="flex items-center rounded-sm bg-gray-200 px-3 py-3 text-h6">
                                To <span class="ml-2 text-primary-500">{{ info.to }}</span>
                            </p>

                            <div>
                                <p class="text-body-m">{{ info.departure }} <span
                                        class="text-body-s text-gray-400">PM</span></p>
                                <p class="text-body-xs text-primary-400">Departure</p>
                            </div>
                            <div class="text-center">
                                <p class="text-body-m">
                                    {{ info.stops[0] }} <span class="text-body-s text-gray-400">PM</span>
                                    <span class="ml-2">{{ info.stops[1] }}</span> <span
                                        class="text-body-s text-gray-400">PM</span>
                                </p>
                                <p class="text-body-s text-primary-400">{{ info.stopText }}</p>
                            </div>
                            <div class="md:text-right">
                                <p class="text-body-m">{{ info.landing }} <span
                                        class="text-body-s text-gray-400">AM</span></p>
                                <p class="text-body-xs text-primary-400">Landing</p>
                            </div>

                            <p class="flex items-center gap-2 rounded-sm bg-gray-200 px-3 py-2 text-body-xs">
                                <Icon name="icon-park-outline:take-off" size="16" class="shrink-0" />{{ info.fromAirport
                                }}
                            </p>
                            <p
                                class="flex items-center justify-center gap-3 rounded-sm bg-gray-200 px-3 py-2 text-body-xs">
                                <Icon name="icon-park-outline:time" size="16" class="shrink-0" />{{ info.viaAirport }}
                            </p>
                            <p
                                class="flex items-center justify-end gap-2 rounded-sm bg-gray-200 px-3 py-2 text-body-xs">
                                {{ info.toAirport }}
                                <Icon name="icon-park-outline:landing" size="16" class="shrink-0" />
                            </p>

                            <div class="flex items-center justify-between gap-3">
                                <span class="text-h3 text-success-dark">{{ info.price }}</span>
                                <span class="rounded-sm bg-success-light px-3 py-2 text-body-xs text-success-dark">{{
                                    info.seats }}</span>
                            </div>
                            <p class="flex items-center justify-center rounded-sm bg-gray-200 px-3 py-2 text-body-xs">{{
                                info.carbon }}</p>
                            <NuxtLink :to="`/flights/${i + 1}`"
                                class="flex items-center justify-center rounded-sm bg-primary-500 py-2 text-button-xl text-white hover:bg-primary-600">
                                View Detail
                            </NuxtLink>
                        </div>
                    </article>
                </div>

                <div class="mt-12 flex flex-col justify-between gap-4 sm:flex-row">
                    <NuxtLink to="/flights/favourites"
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