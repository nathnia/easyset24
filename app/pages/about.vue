<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({ title: 'About Us' })

const founders = [
    {
        role: 'CEO', name: 'Jessica Miller', linkedin: '#', width: 'lg:w-[250px]',
        bio: ['Jessica is known for unwavering integrity and transparent leadership.', 'Over 15 years in executive roles.'],
    },
    {
        role: 'COO', name: 'Emily Davis', linkedin: '#', width: 'lg:w-[240px]',
        bio: ['Emily is recognized for ethical business operations.', 'Over 10 years extensive background in optimizing operational processes.'],
    },
    {
        role: 'CMO', name: 'John Smith', linkedin: '#', width: 'lg:w-[250px]',
        bio: ['He values honesty in advertising and respects customer privacy.', 'Proven over 10 years of track record in developing and implementing ethical marketing strategies.'],
    },
    {
        role: 'CFO', name: 'Olivia Wilson', linkedin: '#', width: 'lg:w-[285px]',
        bio: ['Olivia is committed to financial transparency and compliance', 'Over a decade of financial leadership.'],
    },
]

const partners = [
    { name: 'Wave Trip', icon: 'icon-park-outline:take-off-one' },
    { name: 'Travel With Us', icon: 'icon-park-outline:earth' },
    { name: 'Around U', icon: 'icon-park-outline:local' },
    { name: 'Circel G', icon: 'icon-park-outline:airplane' },
    { name: 'Travelia', icon: 'icon-park-outline:landing' },
]

const track = ref<HTMLElement | null>(null)
const scrollTrack = (dir: 1 | -1) => {
    const el = track.value
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
    <div>
        <div class="flex flex-col gap-12 py-12">
            <section class="page-container">
                <div class="flex flex-col gap-8 rounded-sm border border-gray-300 bg-white px-4 py-8">
                    <h1 class="text-h3 text-primary-500">Welcome To EasySet24 !</h1>
                    <p class="text-h6 font-normal!">
                        We Are A Dynamic Team Of Travel Professionals Dedicated To Simplifying Your Travel Experience By
                        Curating Flight And Accommodation Services On A User-Friendly Platform. Committed To Quality And
                        Assurance, EasySet24 Strives To Transform Your Journey Into A Fearless And Enjoyable Adventure.
                        We Appreciate Your Trust In Us, And Since The Year 2023, We've Been Committed To Serving Your
                        Travel Needs. Feel Free To Reach Out With Any Questions Or Requirements – We're Here For You.
                    </p>

                    <div class="flex flex-col gap-6">
                        <h2 class="text-h5">EasySet24 Founded By</h2>
                        <div class="flex flex-col gap-6 sm:flex-row sm:flex-wrap lg:flex-nowrap lg:justify-between">
                            <div v-for="f in founders" :key="f.role"
                                :class="['flex flex-col gap-2 sm:w-[calc(50%-12px)]', f.width]">
                                <p class="flex items-center gap-2 text-label-m">
                                    {{ f.role }} : {{ f.name }}
                                    <a :href="f.linkedin" :aria-label="`${f.name} on LinkedIn`">
                                        <Icon name="logos:linkedin-icon" size="24" />
                                    </a>
                                </p>
                                <p v-for="line in f.bio" :key="line" class="text-body-xxs">{{ line }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="page-container grid items-stretch gap-6 md:grid-cols-2">
                <div class="flex flex-col gap-6 border-2 border-gray-300 bg-white px-4 py-4 md:min-h-90">
                    <h2 class="text-h3 text-primary-500">Vision</h2>
                    <p class="text-h6 font-normal!">
                        Our Vision Is To Be A Leading And Trusted Name In The Travel Industry, Recognized For Our
                        Commitment To Simplifying Travel And Enhancing The Overall Experience For Our Customers. Since
                        2023, And Into The Future, We Envision EasySet24 As The Preferred Choice For Travellers.
                    </p>
                </div>

                <div class="flex flex-col gap-6 border-2 border-gray-300 bg-gray-200 px-4 py-4 md:min-h-90">
                    <h2 class="text-h3 text-primary-500">Our Goal</h2>
                    <p class="text-h6 font-normal!">
                        To Streamline And Simplify The Travel Experience For Our Customers By Providing Convenient
                        Access To Curated Flight And Accommodation Services Through An Easy-To-Use Platform. Our Goal Is
                        To Make Travel Hassle-Free And Enjoyable, Ensuring That Our Customers Can Embark On Their
                        Journeys With Confidence And Ease.
                    </p>
                </div>

                <div class="flex flex-col gap-6 border-2 border-gray-300 bg-gray-200 px-4 py-4 md:min-h-90">
                    <h2 class="text-h3 text-primary-500">Mission</h2>
                    <p class="text-h6 font-normal!">
                        EasySet24 Is On A Mission To Be The Go-To Platform For Travelers Seeking Quality And Assurance
                        In Their Travel Arrangements. We Are Dedicated To Offering User-Friendly Services That Transform
                        Each Journey Into A Fearless And Enjoyable Adventure. Our Mission Is To Provide Reliable And
                        Convenient Travel Solutions While Building And Maintaining The Trust Of Our Customers.
                    </p>
                </div>

                <div class="flex flex-col gap-4 border-2 border-gray-300 bg-white px-16 py-8 md:min-h-90">
                    <h2 class="text-h5">What Made Us Successful ?</h2>
                    <div class="flex flex-col gap-2">
                        <p class="text-label-m">Join Us And Be Part Of Our Dynamic Team, Where</p>
                        <p class="text-label-m">
                            Your Skills And Talents Can Thrive!
                            <NuxtLink to="#" class="text-body-xs font-normal text-primary-500 hover:underline">Read Our
                                Employee Stories ...!</NuxtLink>
                        </p>
                    </div>
                    <div>
                        <p class="text-[64px] font-bold leading-none text-gray-400">254 +</p>
                        <p class="text-h5 text-gray-400">Vacant Careers</p>
                    </div>
                    <NuxtLink to="#"
                        class="self-start rounded-sm bg-primary-500 px-8 py-3 text-button-m text-white hover:bg-primary-600">
                        Find More
                    </NuxtLink>
                </div>
            </section>

            <section class="page-container flex flex-col gap-6">
                <h2 class="text-h3">We Work With</h2>
                <div class="flex items-center gap-4 border-b-4 border-gray-300 pb-4">
                    <button type="button" aria-label="Previous partners" class="shrink-0" @click="scrollTrack(-1)">
                        <Icon name="icon-park-outline:left-c" size="26" class="text-primary-500" />
                    </button>

                    <div ref="track"
                        class="flex flex-1 snap-x overflow-x-auto scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden">
                        <div v-for="p in partners" :key="p.name"
                            class="flex shrink-0 basis-1/2 snap-start flex-col items-center gap-2 px-4 py-4 sm:basis-1/3 lg:basis-1/5">
                            <Icon :name="p.icon" size="64" class="text-gray-500" />
                            <p class="text-label-m text-gray-500">{{ p.name }}</p>
                        </div>
                    </div>

                    <button type="button" aria-label="Next partners" class="shrink-0" @click="scrollTrack(1)">
                        <Icon name="icon-park-outline:right-c" size="26" class="text-primary-500" />
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>