<script setup lang="ts">
useHead({ title: 'Hotel Information - EasySet24' })

const images = [1, 2, 3, 4, 5].map((n) => `https://picsum.photos/seed/easyset-hotel-${n}/800/600`)

const tabs = ['Place Details', 'Info & Prices', 'Rooms & Beds', 'Place Rules']
const activeTab = ref(tabs[0])
const liked = ref(false)

const descriptions = [
    'This stylish and roomy family home is nestled in Stockholm\'s Kista district, just 14 km away from the Royal Swedish Opera, Museum of Medieval Stockholm, and Stureplan. Offering the convenience of free private parking, it\'s also a short 9 km drive from Friends Arena and 14 km from Sergels Torg Square.',
    'Explore nearby attractions like the Army Museum, just 15 km away, and The Royal Palace, situated 15 km from this charming home. For convenience, Bromma Stockholm Airport is the closest airport, located just 8 km away from this stylish and spacious family retreat.',
    'Your stay at our hotel includes a complimentary breakfast to kickstart your day, and our rooms offer a cosy and comfortable retreat. Select rooms feature a relaxing bath tub for added luxury.',
    'Our dedicated staff is at your service, ensuring a seamless and enjoyable experience throughout your stay. In addition to the inviting accommodations, indulge in extra leisure activities such as our fitness centre or pool. We\'ve thoughtfully curated every aspect to make your stay special, promising a combination of comfort, convenience, and delightful extras.',
]

const amenities = [
    { icon: 'icon-park-outline:wifi', label: 'Free Wifi' },
    { icon: 'icon-park-outline:parking', label: 'Parking Available' },
    { icon: 'icon-park-outline:knife-fork', label: 'Restaurant' },
    { icon: 'icon-park-outline:dumbbell', label: 'Fitness Center' },
    { icon: 'icon-park-outline:shower-head', label: 'Bathroom' },
    { icon: 'icon-park-outline:tray', label: 'Room Service' },
    { icon: 'icon-park-outline:air-conditioning', label: 'Air Conditioning' },
    { icon: 'icon-park-outline:coffee-machine', label: 'Tea/Coffee Machine' },
]

const faqs = [
    { question: 'How And When Do I Pay?', answer: 'Since this option is a non-refundable reservation and there is no cancellation opportunity, payment is usually processed at the time of booking or shortly thereafter.' },
    { question: 'Is There Anti-Allergic Meal?', answer: '' },
    { question: 'Does The Hotel Have A Pool?', answer: '' },
    { question: 'Any Identification Documents Is Necessary', answer: '' },
    { question: 'What Are The Check-In And Check-Out Times?', answer: '' },
    { question: 'Why Was I Charged?', answer: '' },
    { question: 'Is There A Spa?', answer: '' },
]
const openFaq = ref<number | null>(0)

const reviews = [
    { name: 'Sofia', country: 'se', avatar: 'https://i.pravatar.cc/200?img=47', text: 'Our time at this hotel was marked by contemporary elegance and thoughtful amenities.' },
    { name: 'Sebastian', country: 'se', avatar: 'https://i.pravatar.cc/200?img=12', text: 'The rooms were great, and the services were awesome. Everything made our stay super enjoyable.' },
    { name: 'Maria', country: 'ca', avatar: 'https://i.pravatar.cc/200?img=32', text: 'The hotel exceeded expectations with comfortable rooms, excellent services, making our stay truly enjoyable.' },
    { name: 'Lena', country: 'us', avatar: 'https://i.pravatar.cc/200?img=15', text: 'The hotel was really nice, especially because of the fancy pool and tasty breakfast. It made our stay feel special.' },
    { name: 'Martin', country: 'nl', avatar: 'https://i.pravatar.cc/200?img=53', text: 'For those seeking a blend of luxury and technology, this hotel is a dream come true.' },
]
const track = ref<HTMLElement | null>(null)
const scroll = (dir: 1 | -1) => track.value?.scrollBy({ left: dir * 300, behavior: 'smooth' })

const rates = [
    { label: 'Staff Politeness', score: 8.6 },
    { label: 'VIP Options', score: 8 },
    { label: 'Free Wi-Fi Speed', score: 7.5 },
    { label: 'Cleanliness', score: 6 },
    { label: 'Access To City Center', score: 9 },
]
</script>

<template>
    <div class="page-container space-y-12 pb-12">
        <div class="grid h-72 grid-cols-4 grid-rows-2 gap-3 sm:h-96 lg:h-120">
            <img :src="images[0]" alt="Hotel exterior"
                class="col-span-2 row-span-2 h-full w-full rounded-l-md object-cover" />
            <img :src="images[1]" alt="Bathroom" class="h-full w-full object-cover" />
            <img :src="images[2]" alt="Kitchen" class="h-full w-full rounded-tr-md object-cover" />
            <img :src="images[3]" alt="Breakfast" class="h-full w-full object-cover" />
            <button type="button" class="relative overflow-hidden rounded-br-md">
                <img :src="images[4]" alt="Bedroom" class="h-full w-full object-cover" />
                <span
                    class="absolute inset-0 flex items-end gap-2 bg-linear-to-t from-black/60 via-transparent to-transparent p-4 text-label-m text-white">
                    <Icon name="icon-park-outline:pic" size="18" />
                    See More Photos
                    <Icon name="icon-park-outline:right" size="16" />
                </span>
            </button>
        </div>

        <!-- Details -->
        <div>
            <div class="flex flex-wrap">
                <button v-for="tab in tabs" :key="tab" type="button"
                    class="rounded-t-md px-6 py-3 text-label-m text-primary-500 transition-colors md:px-10"
                    :class="activeTab === tab ? 'bg-white' : 'hover:bg-white/60'" @click="activeTab = tab">
                    {{ tab }}
                </button>
            </div>

            <div class="rounded-b-md rounded-tr-md bg-white p-6">
                <template v-if="activeTab === 'Place Details'">
                    <div class="grid gap-8 md:grid-cols-2">
                        <div class="space-y-4 text-body-xs">
                            <p v-for="text in descriptions.slice(0, 2)" :key="text">{{ text }}</p>
                        </div>
                        <div class="space-y-4 text-body-xs">
                            <p v-for="text in descriptions.slice(2)" :key="text">{{ text }}</p>
                        </div>
                    </div>

                    <div class="mt-10 grid gap-8 md:grid-cols-2">
                        <div>
                            <h3 class="mb-4 text-label-m">Amenities</h3>
                            <ul class="grid grid-cols-2 gap-x-6 gap-y-4 text-body-xs text-gray-500">
                                <li v-for="item in amenities" :key="item.label" class="flex items-center gap-3">
                                    <Icon :name="item.icon" size="18" />
                                    {{ item.label }}
                                </li>
                            </ul>
                        </div>

                        <div class="flex flex-col gap-3">
                            <p class="text-body-xs">
                                <b class="text-label-m">2 Adults ,3 Children ,4 Nights</b> | Two Rooms ,Double Bed
                            </p>
                            <p class="flex items-center gap-2 text-body-xs">
                                <Icon name="icon-park-outline:local" size="18" class="text-primary-500" />
                                Lärkvägen 22, Stockholm, Sweden
                            </p>
                            <p class="mt-auto md:text-right">
                                <span class="text-h6 text-success-dark">$240</span>
                                <span class="ml-1 text-label-m">Per night</span>
                            </p>
                            <div class="flex gap-3 md:justify-end">
                                <button type="button" aria-label="Add to favourites"
                                    class="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-400 text-primary-500 hover:bg-primary-500 hover:text-white"
                                    @click="liked = !liked">
                                    <Icon name="icon-park-outline:like" size="18"
                                        :class="liked ? 'text-error-light' : 'text-black'" />
                                </button>
                                <NuxtLink to="/hotel-payment"
                                    class="flex h-10 flex-1 items-center justify-center rounded-sm bg-primary-500 px-8 text-button-l text-white hover:bg-primary-600 md:w-56 md:flex-none">
                                    Book Now
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </template>

                <p v-else class="py-10 text-center text-body-s text-gray-500">Coming soon.</p>
            </div>
        </div>

        <!-- FAQ -->
        <section>
            <h2 class="mb-4 text-h6">The Most Frequented Questions Asked By Travellers</h2>
            <div>
                <div v-for="(faq, i) in faqs" :key="faq.question" class="border-b border-gray-300 bg-white">
                    <button type="button" :aria-expanded="openFaq === i"
                        class="flex w-full items-center justify-between px-6 py-4 text-left text-label-m hover:bg-gray-100"
                        @click="openFaq = openFaq === i ? null : i">
                        {{ faq.question }}
                        <Icon :name="openFaq === i ? 'icon-park-outline:up' : 'icon-park-outline:down'" size="18"
                            class="text-gray-400" />
                    </button>
                    <p v-if="openFaq === i && faq.answer" class="px-6 pb-4 text-body-xs">{{ faq.answer }}</p>
                </div>
            </div>
        </section>

        <!-- Reviews -->
        <div class="flex items-center gap-2">
            <button type="button" class="text-primary-500" aria-label="Previous reviews" @click="scroll(-1)">
                <Icon name="icon-park-outline:left" size="20" />
            </button>

            <div ref="track" class="flex flex-1 snap-x gap-4 overflow-x-auto pb-2 pt-14 scrollbar-none">
                <article v-for="review in reviews" :key="review.name"
                    class="relative min-w-55 flex-1 snap-start rounded-md bg-white px-4 pb-4 pt-12 transition-shadow hover:shadow-md">
                    <img :src="review.avatar" :alt="review.name"
                        class="absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full object-cover" />
                    <p class="mb-2 flex items-center gap-2 text-label-m">
                        <Icon :name="`circle-flags:${review.country}`" size="16" />
                        {{ review.name }}
                    </p>
                    <p class="text-body-xs">
                        "{{ review.text }}"
                        <NuxtLink to="#" class="text-caption-s text-primary-500">Read More ...</NuxtLink>
                    </p>
                </article>
            </div>

            <button type="button" class="text-primary-500" aria-label="Next reviews" @click="scroll(1)">
                <Icon name="icon-park-outline:right" size="20" />
            </button>
        </div>

        <!-- Rates -->
        <section>
            <h2 class="mb-4 text-h6">Review Rates:</h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <div v-for="rate in rates" :key="rate.label">
                    <div class="mb-2 flex items-center justify-between text-body-s text-gray-500">
                        <span>{{ rate.label }}</span>
                        <b class="text-label-m text-gray-500">{{ rate.score }}</b>
                    </div>
                    <div class="h-1.5 rounded-full bg-gray-300">
                        <div class="h-full rounded-full bg-primary-500" :style="{ width: `${rate.score * 10}%` }" />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>