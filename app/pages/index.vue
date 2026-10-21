<script setup lang="ts">
// ---------- Hero ----------
const heroImage = 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D'

// ---------- Special Offers ----------
const filters = ['All', 'Hotels', 'Flights', 'Multi']
const selectedFilter = ref('All')
const offerRows = [
    {
        cols: 'md:grid-cols-[251fr_158fr_251fr]',
        items: [
            { img: 'https://www.alpenair.de/wp-content/uploads/2023/11/strandkoerbe.png', corner: 'md:rounded-tl-md' },
            { img: 'https://media.istockphoto.com/id/1459066397/id/foto/pemandangan-kota-positano-dengan-bunga-di-pantai-amalfi-di-campania-italia-resor-musim-panas.jpg?s=612x612&w=0&k=20&c=BAb1hzpwWKxkbUmvwW4tP6aNiYshyo6B1Ascb0N3jis=', corner: '' },
            { img: 'https://assets.goboony.nl/uploads/ckeditor/pictures/5189/content_camperbeach.jpg', corner: 'md:rounded-tr-md' },
        ],
    },
    {
        cols: 'md:grid-cols-[332fr_163fr_164fr]',
        items: [
            { img: 'https://www.alpina.nl/wp-content/uploads/2021/02/hoeveel-pk-vaarbewijs-scaled-960x640.jpg', corner: 'md:rounded-bl-md' },
            { img: 'https://mehaart.com/cdn/shop/articles/Paris-Blog-Featured-Image_1296x.jpg?v=1605687744', corner: '' },
            { img: 'https://i.pinimg.com/736x/86/b7/ed/86b7edf6138be144e3761e0c97daa1a8.jpg', corner: 'md:rounded-br-md' },
        ],
    },
]

// ---------- Trending Stays ----------
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`
const cities = [
    { name: 'Berlin', img: unsplash('1520250497591-112f2f40a3f4') },
    { name: 'Paris', img: unsplash('1566073771259-6a8506099945') },
    { name: 'Madrid', img: unsplash('1584132967334-10e028bd69f7') },
    { name: 'Barcelona', img: unsplash('1540541338287-41700207dee6') },
    { name: 'Rom', img: unsplash('1549294413-26f195200c16') },
    { name: 'Milan', img: unsplash('1445019980597-93fa8acb246c') },
    { name: 'Istanbul', img: unsplash('1629140727571-9b5c6f6267b4') },
    { name: 'Dubai', img: unsplash('1542314831-068cd1dbfeeb') },
    { name: 'Amesterdam', img: unsplash('1582719508461-905c673771fd') },
    { name: 'New York', img: unsplash('1551918120-9739cb430c6d') },
    { name: 'Marollca', img: unsplash('1623718649591-311775a30c43') },
    { name: 'Teneriffa', img: unsplash('1610641818989-c2051b5e2cfd') },
]

// ---------- Offer Categories ----------
const categories = [
    { name: 'Flight', img: unsplash('1500835556837-99ac94a94552') },
    { name: 'Location', img: unsplash('1530789253388-582c481c54b0') },
    { name: 'Hotel', img: unsplash('1629140727571-9b5c6f6267b4') },
    { name: 'Package', img: unsplash('1469854523086-cc02fe5d8800') },
    { name: 'Seasonal', img: unsplash('1476514525535-07fb3b4ae5f1') },
    { name: 'Camps', img: unsplash('1599056407101-7c557a4a0144') },
    { name: 'Backpacking', img: unsplash('1707343848552-893e05dba6ac') },
    { name: 'Hostels', img: unsplash('1590725140246-20acdee442be') },
]

// ---------- Inspiration ----------
const inspirationImage = 'https://substackcdn.com/image/fetch/$s_!N2rG!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F152384c8-ec49-49e4-92ee-6d61d88e9b00_3992x2992.jpeg'
</script>

<template>
    <div>
        <section class="relative mb-12 h-85 bg-gray-400 md:h-100">
            <img :src="heroImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

            <div class="page-container absolute inset-x-0 bottom-0 flex translate-y-5 flex-col gap-6">
                <h1 class="max-w-110 text-h3 text-white md:text-h1">Discover Your Trip Worldwide !</h1>

                <form class="flex flex-col overflow-hidden rounded-sm border border-gray-300 bg-white md:flex-row">
                    <label
                        class="flex flex-[1.3] items-center gap-6 border-b border-gray-300 px-4 py-3 md:border-b-0 md:border-r">
                        <Icon name="icon-park-outline:building-one" size="24" class="shrink-0 text-primary-400" />
                        <input type="text" placeholder="Where Are You Going To?"
                            class="w-full text-caption-s outline-none placeholder:text-black" />
                    </label>
                    <label
                        class="flex flex-1 items-center gap-6 border-b border-gray-300 px-4 py-3 md:border-b-0 md:border-r">
                        <Icon name="icon-park-outline:calendar" size="24" class="shrink-0 text-primary-400" />
                        <input type="text" placeholder="Check In Date"
                            class="w-1/2 text-caption-s outline-none placeholder:text-black" />
                        <input type="text" placeholder="Check Out Date"
                            class="w-1/2 text-caption-s outline-none placeholder:text-black" />
                    </label>
                    <label class="flex flex-1 items-center gap-4 border-b border-gray-300 px-4 py-3 md:border-b-0">
                        <Icon name="icon-park-outline:people-plus" size="24" class="shrink-0 text-primary-400" />
                        <span class="text-caption-s">Adults 2</span>
                        <span class="text-caption-s">Children 3</span>
                        <span class="text-caption-s">Room</span>
                        <Icon name="icon-park-outline:down" size="20" class="ml-auto" />
                    </label>
                    <button type="submit"
                        class="bg-primary-500 px-10 py-3 text-button-xxl text-white hover:bg-primary-600">Search</button>
                </form>
            </div>
        </section>

        <!-- ================= SPECIAL OFFERS ================= -->
        <section class="page-container pt-12">
            <h2 class="text-h4">Special Offers</h2>

            <div class="mt-2 flex gap-4">
                <label v-for="f in filters" :key="f" class="flex cursor-pointer items-center gap-1 text-caption-s">
                    <input v-model="selectedFilter" type="radio" :value="f" class="accent-primary-500" />
                    {{ f }}
                </label>
            </div>

            <div class="mt-4 flex flex-col gap-3">
                <div v-for="(row, r) in offerRows" :key="r" class="grid grid-cols-1 gap-3" :class="row.cols">
                    <div v-for="(o, i) in row.items" :key="i"
                        class="group relative h-44 cursor-pointer overflow-hidden bg-gray-300 max-md:rounded-md md:h-56 xl:h-72.5"
                        :class="o.corner">
                        <img :src="o.img" alt=""
                            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button
                            class="absolute bottom-3 left-3 flex items-center gap-1 rounded-sm bg-black/70 px-3 py-1.5 text-caption-s text-white transition-colors group-hover:bg-primary-500">
                            Deals Discover
                            <Icon name="icon-park-outline:arrow-right" size="14"
                                class="transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- ================= TRENDING STAYS ================= -->
        <section class="page-container pt-16">
            <h2 class="text-h4">Explore Stays In Trending Destinations</h2>
            <p class="text-caption-s">Find Hot Stays!</p>

            <div class="page-grid mt-4">
                <StayCard v-for="c in cities" :key="c.name" :city="c.name" :image="c.img"
                    class="col-span-2 xl:col-span-3" />
            </div>
        </section>

        <!-- ================= OFFER CATEGORIES ================= -->
        <section class="page-container pt-16">
            <h2 class="text-h4">Compare The Highest Reviewed Past Offers</h2>
            <p class="text-caption-s">Browse By Type</p>

            <div class="page-grid mt-4">
                <CategoryCard v-for="c in categories" :key="c.name" :name="c.name" :image="c.img"
                    class="col-span-2 xl:col-span-3" />
            </div>
        </section>

        <!-- ================= INSPIRATION BANNER ================= -->
        <section class="relative mt-16 min-h-85 bg-black md:min-h-100">
            <img :src="inspirationImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <!-- fades to black at the bottom -->
            <div class="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
            <div class="page-container relative flex min-h-85 flex-col justify-between py-10 text-white md:min-h-100">
                <div>
                    <h2 class="text-h3">Get Inspirations For Your Next Trip</h2>
                    <p class="mt-1 text-caption-l">Read About Wonderful Adventure We Love Most</p>
                </div>
                <div class="md:ml-auto md:max-w-lg">
                    <h3 class="text-h3">Difficult Roads Lead To Beautiful Destination .</h3>
                    <NuxtLink to="#" class="mt-2 flex items-center justify-end gap-1 text-caption-s">
                        Read More
                        <Icon name="icon-park-outline:right" size="14" />
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>