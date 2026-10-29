<script setup lang="ts">
useHead({ title: 'Flights - EasySet24' })

const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/easyset-${seed}/${w}/${h}`
const heroImage = 'https://images.unsplash.com/photo-1686953626953-3556f6c8136d?auto=format&fit=crop&w=1800&q=80'

const places = [
    { name: 'Washington', dates: 'Wed 25 Jan-Fri 27 Jan', img: img('washington', 300, 240), pos: 'lg:left-[7%] lg:top-[6%]' },
    { name: 'China', dates: 'Fri 30 Dec-Tue 4 Jan', img: img('china', 300, 240), pos: 'lg:left-[46%] lg:top-[5%]' },
    { name: 'Philippines', dates: 'Sun 28 Apr-Tue 5 Maj', img: img('philippines', 300, 240), pos: 'lg:left-[76.5%] lg:top-[24%]' },
    { name: 'Columbia', dates: 'Sat 13 Jan-Thu 15 Jan', img: img('columbia', 300, 240), pos: 'lg:left-[30%] lg:top-[36%]' },
    { name: 'Berlin', dates: 'Wed 25 Jan-Fri 27 Jan', img: img('berlin', 300, 240), pos: 'lg:left-[55%] lg:top-[55%]' },
]
const dots = [
    'left-[30.8%] top-[28%]',
    'left-[67%] top-[39%]',
    'left-[52.9%] top-[45%]',
    'left-[12%] top-[62%]',
    'left-[80%] top-[62%]',
]

const paragraphs = [
    'Traveling Is A Unique Experience As It\'s The Best Way To Unplug From The Pushes And Pulls Of Daily Life.',
    'Relaxing Through An Organized Trip , Helps Us To Forget About Our Problems, Frustrations, And Fears At Home.',
    'During Our Journey, We Experience Life In Different Ways. We Explore New Places, Cultures, Cuisines, Traditions, And Ways Of Living.',
]
const packageImages = ['asia-1', 'asia-2', 'asia-3', 'asia-4'].map(s => img(s, 700, 560))
</script>

<template>
    <div>
        <SearchForm type="flight" />

        <section class="relative mt-8 h-90 bg-gray-400 md:h-100">
            <img :src="heroImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <div class="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />
            <div class="page-container relative flex h-full flex-col justify-center text-white">
                <h2 class="max-w-lg text-h1">Make Your Travel Whishlist, We'll Do The Rest</h2>
                <p class="mt-3 text-label-m">Special Offers To Suit Your Plan</p>
            </div>
        </section>

        <section class="page-container flex items-center justify-between gap-6 py-12">
            <div>
                <h2 class="text-h3">Let's Travel Together</h2>
                <p class="mt-3 text-body-l">Discover The Latest Offers And News And Start Planning Your Next Trip With
                    Us.</p>
            </div>
            <NuxtLink to="#"
                class="hidden w-44 shrink-0 rounded-sm border border-primary-500 bg-white py-3 text-center text-button-l text-primary-500 hover:bg-primary-500 hover:text-white sm:block">
                See All
            </NuxtLink>
        </section>

        <!-- Map -->
        <section class="relative bg-[#064a7b] lg:h-125">
            <img src="/images/world-map.png" alt=""
                class="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-40 lg:block" />
            <span v-for="d in dots" :key="d" class="absolute hidden h-2 w-2 rounded-full bg-white lg:block"
                :class="d" />

            <div class="page-container grid gap-6 py-8 sm:grid-cols-2 lg:block lg:p-0">
                <article v-for="p in places" :key="p.name"
                    class="group relative flex items-center gap-4 rounded-sm bg-white p-2 shadow-lg transition-transform duration-300 hover:-translate-y-1 lg:absolute lg:w-[21%] lg:min-w-64"
                    :class="p.pos">
                    <div class="pointer-events-none absolute -left-1 -top-1 z-10 h-16 w-16 overflow-hidden">
                        <span
                            class="absolute -left-6 top-3.5 w-24 -rotate-45 bg-linear-to-b from-vip-light to-vip-dark py-px text-center text-[7px] text-white shadow"
                            style="clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%)">
                            Special Offer
                        </span>
                    </div>
                    <img :src="p.img" :alt="p.name" class="h-28 w-32 shrink-0 rounded-sm object-cover" />
                    <div class="min-w-0">
                        <h3 class="text-h6">{{ p.name }}</h3>
                        <p class="mt-1 text-body-xs text-gray-500">{{ p.dates }}</p>
                    </div>
                </article>
            </div>
        </section>

        <section class="page-container pt-14">
            <div class="flex items-start justify-between gap-6">
                <div>
                    <h2 class="text-h3">Fall Into Travel</h2>
                    <p class="mt-1 text-label-m text-primary-500">Review Affordable EasySet 24 Trip Packages</p>
                    <p class="mt-4 max-w-3xl text-body-s">
                        Going Somewhere To Celebrate This Season? Whether You're Going Home Or Somewhere To Roam, We've
                        Got The Travel Tools To Get You To Your Destination.
                    </p>
                </div>
                <NuxtLink to="#"
                    class="hidden w-44 shrink-0 rounded-sm border border-primary-500 bg-white py-3 text-center text-button-l text-primary-500 hover:bg-primary-500 hover:text-white sm:block">
                    See All
                </NuxtLink>
            </div>

            <div class="mt-10 grid gap-8 lg:grid-cols-2">
                <div class="flex flex-col">
                    <div class="flex items-center gap-6">
                        <div class="shrink-0 rounded-sm bg-primary-500 px-3 py-1 text-white">
                            <p class="text-label-s">From</p>
                            <p class="text-body-xl">$700</p>
                        </div>
                        <h3 class="text-h3">Backpacking South Of Asia ...</h3>
                    </div>

                    <div class="mt-8 space-y-6 text-body-xl">
                        <p v-for="(t, i) in paragraphs" :key="t" :class="i === 0 ? 'indent-8' : ''">{{ t }}</p>
                    </div>

                    <NuxtLink to="#"
                        class="mt-auto block rounded-sm border border-primary-500 bg-white py-2 text-center text-button-xl text-primary-500 hover:bg-primary-500 hover:text-white max-lg:mt-8">
                        Book Flight
                    </NuxtLink>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <img v-for="(src, i) in packageImages" :key="i" :src="src" alt=""
                        class="aspect-4/3 w-full rounded-sm border border-gray-300 object-cover shadow-md transition-transform duration-300 hover:scale-[1.02]" />
                </div>
            </div>
        </section>

        <div class="h-14" />
    </div>
</template>