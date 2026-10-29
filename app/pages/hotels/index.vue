<script setup lang="ts">
const u = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const heroImage = u('1540541338287-41700207dee6', 1800)

const tabs = ['Special Offers', 'Last Search', 'Trending Destinations', 'Highest Reviewed', 'Highest Reviewed']
const activeTab = ref(0)

const places = [
    { name: 'Belgium', sub: 'Bruxelles Gare Du Midi', img: u('1520250497591-112f2f40a3f4', 400), pos: 'md:left-[18%] md:top-[14%]' },
    { name: 'Amsterdam', sub: 'Bunk', img: u('1582719508461-905c673771fd', 400), pos: 'md:left-[70%] md:top-[18%]' },
    { name: 'Nepal', sub: 'Hyatt Regency K', img: u('1566073771259-6a8506099945', 400), pos: 'md:left-[36%] md:top-[46%]' },
    { name: 'New Jersey', sub: 'Windsor', img: u('1584132967334-10e028bd69f7', 400), pos: 'md:left-[3%] md:top-[60%]' },
    { name: 'Gothenburg', sub: 'First Hotel G', img: u('1445019980597-93fa8acb246c', 400), pos: 'md:left-[62%] md:top-[66%]' },
]

const offerRows = [
    {
        cols: 'md:grid-cols-[181fr_355fr_181fr]',
        items: [
            { label: 'Loyalty Discounts', img: u('1540541338287-41700207dee6'), corner: 'md:rounded-tl-md' },
            { label: 'Early Booking Discounts', img: u('1476514525535-07fb3b4ae5f1'), corner: '' },
            { label: 'Last-Minute Deals', img: u('1629140727571-9b5c6f6267b4'), corner: 'md:rounded-tr-md' },
        ],
    },
    {
        cols: 'md:grid-cols-[181fr_355fr_181fr]',
        items: [
            { label: 'Family Packages', img: u('1559734840-f9509ee5677f'), corner: 'md:rounded-bl-md' },
            { label: 'Birthday Or Anniversary Specials', img: u('1530789253388-582c481c54b0'), corner: '' },
            { label: 'Referral Programs', img: u('1520250497591-112f2f40a3f4'), corner: 'md:rounded-br-md' },
        ],
    },
]

const compare = [
    { text: 'The Past Offers With The Highest Reviews Outshine Others, Standing As A Testament To Their Exceptional Quality.', img: u('1566073771259-6a8506099945', 1000) },
    { text: 'Ring In The New Year With Iconic Moments And Unforgettable Memories In New York City', img: u('1610641818989-c2051b5e2cfd', 1000) },
]

const reviews = [
    { name: 'Teacher Terece', flag: 'fr', avatar: 'https://i.pravatar.cc/200?img=5', text: 'Returning to this hotel is always a delight – their loyalty program showers us with exclusive discounts and amazing perks!' },
    { name: 'BEYU68£', flag: 'no', avatar: 'https://i.pravatar.cc/200?img=12', text: 'Accessing EasySet24 extraordinary special offers makes always our journey even more unforgettable.' },
    { name: 'Elinal3ay', flag: 'ca', avatar: 'https://i.pravatar.cc/200?img=32', text: 'Weekends here are pure bliss with their carefully crafted packages, and the extended stay discounts make relaxation even more enticing.' },
]
const beachImage = u('1507525428034-b723cf961d3e', 1800)

const promos = [
    { title: 'Reserve Your Hotel, Pursue Your Team', img: u('1549294413-26f195200c16', 1000), corner: 'md:rounded-tl-md' },
    { title: 'Subscribe Our Newsletter', img: u('1540541338287-41700207dee6', 1000), corner: 'md:rounded-tr-md' },
    { title: 'Review Hotel Services Worldwide', img: u('1623718649591-311775a30c43', 1000), corner: 'md:rounded-bl-md' },
    { title: 'Follow The Latest Tour News', img: u('1584132967334-10e028bd69f7', 1000), corner: 'md:rounded-br-md' },
]
</script>

<template>
    <div>
        <SearchForm place="Gutenberg" vip="Long Lasting" />

        <!--  HERO + TABS  -->
        <section class="relative mt-8 h-115 bg-gray-400 md:h-160">
            <img :src="heroImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/30" />

            <div class="absolute inset-x-0 top-24 flex flex-col items-center gap-3 text-white md:top-32">
                <h2 class="text-h2 text-black">Why Choose Us?</h2>
                <NuxtLink to="#"
                    class="flex w-44 items-center justify-center gap-1 bg-primary-500 py-1.5 text-button-l hover:bg-primary-600">
                    Explore More
                    <Icon name="icon-park-outline:right" size="14" />
                </NuxtLink>
            </div>

            <p
                class="absolute inset-x-0 bottom-28 px-4 text-center text-[40px] font-light leading-tight text-white md:text-[64px]">
                Exclusive Hotel Search!
            </p>

            <div class="page-container absolute inset-x-0 bottom-0 flex items-end gap-0.75 overflow-x-auto">
                <button v-for="(t, i) in tabs" :key="i" type="button"
                    class="flex shrink-0 items-center justify-center rounded-t-[3px] px-4 text-center font-bold text-primary-500 transition-all md:flex-1"
                    :class="activeTab === i
                        ? 'h-12.25 bg-white text-[20px] md:flex-[1.06]'
                        : 'h-9 bg-gray-300 text-[14px] hover:bg-white'" @click="activeTab = i">
                    {{ t }}
                </button>
            </div>
        </section>

        <!--  MAP PANEL  -->
        <div class="page-container">
            <div
                class="relative grid gap-4 overflow-hidden rounded-b-[3px] bg-[#04303f] p-4 sm:grid-cols-2 md:block md:h-140 md:p-0">
                <img src="/images/world-map.png" alt=""
                    class="pointer-events-none absolute inset-0 h-full w-full rounded-b-[3px] object-cover" />
                <div class="pointer-events-none absolute inset-0 rounded-b-[3px] bg-[#021c27]/65" />

                <div v-for="p in places" :key="p.name"
                    class="relative z-10 flex items-center gap-4 rounded-md bg-white p-3 shadow-lg md:absolute md:w-[22%] md:min-w-65"
                    :class="p.pos">
                    <div class="pointer-events-none absolute -left-2 -top-2 z-20 h-24 w-24 overflow-hidden">
                        <span
                            class="absolute -left-9.5 top-5 w-35 -rotate-45 bg-linear-to-b from-vip-light to-vip-dark py-0.75 text-center text-[11px] font-medium text-white shadow-md"
                            style="clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%)">
                            Best Deals
                        </span>
                    </div>

                    <img :src="p.img" :alt="p.name"
                        class="h-24 w-24 shrink-0 rounded-sm bg-gray-300 object-cover md:h-30 md:w-30" />
                    <div class="min-w-0">
                        <h3 class="text-[20px] font-bold leading-tight text-black">{{ p.name }}</h3>
                        <p class="mt-1 text-[13px] leading-snug text-gray-500">{{ p.sub }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!--  SPECIAL OFFERS  -->
        <section class="page-container pt-14">
            <h2 class="text-h4">Special Offers</h2>
            <div class="mt-4 flex flex-col gap-3">
                <div v-for="(row, r) in offerRows" :key="r" class="grid grid-cols-1 gap-3" :class="row.cols">
                    <div v-for="o in row.items" :key="o.label"
                        class="group relative h-44 cursor-pointer overflow-hidden bg-gray-300 max-md:rounded-md md:h-56 xl:h-70"
                        :class="o.corner">
                        <img :src="o.img" alt=""
                            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button
                            class="absolute bottom-3 left-3 flex items-center gap-1 rounded-sm bg-primary-500 px-3 py-1.5 text-caption-s text-white">
                            {{ o.label }}
                            <Icon name="icon-park-outline:arrow-right" size="14"
                                class="transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!--  COMPARISON  -->
        <section class="page-container pt-14">
            <h2 class="text-h4">Make A Comparison</h2>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
                <div v-for="c in compare" :key="c.text"
                    class="group relative h-65 overflow-hidden rounded-md bg-gray-300 md:h-100">
                    <img :src="c.img" alt=""
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
                    <p class="absolute inset-x-4 bottom-4 text-label-m text-white">{{ c.text }}</p>
                </div>
            </div>
        </section>

        <!--  REVIEWS  -->
        <section class="relative mt-14 min-h-105 bg-gray-400 md:min-h-152.5">
            <img :src="beachImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <div
                class="page-container relative flex flex-col items-center gap-16 py-20 md:flex-row md:items-stretch md:justify-center md:gap-12 md:pt-36">
                <article v-for="r in reviews" :key="r.name"
                    class="relative w-full max-w-70 rounded-md bg-linear-to-b from-black/30 to-black/70 px-5 pb-6 pt-14 text-white">
                    <img :src="r.avatar" alt=""
                        class="absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full object-cover" />
                    <p class="flex items-center gap-2 text-label-m">
                        <Icon :name="`circle-flags:${r.flag}`" size="18" />{{ r.name }}
                    </p>
                    <p class="mt-2 text-body-xs">{{ r.text }}</p>
                </article>
            </div>
        </section>

        <!--  PROMO TILES  -->
        <section class="page-container py-14">
            <div class="grid gap-4 md:grid-cols-2">
                <div v-for="p in promos" :key="p.title"
                    class="group relative h-55 cursor-pointer overflow-hidden bg-gray-300 max-md:rounded-md md:h-82.5"
                    :class="p.corner">
                    <img :src="p.img" alt=""
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <p class="absolute inset-x-4 bottom-4 text-h4 text-white">{{ p.title }}</p>
                </div>
            </div>
        </section>
    </div>
</template>