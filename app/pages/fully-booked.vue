<script setup lang="ts">
const heroImage = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1800&q=80'

const subscribed = ref(false)

function notify() {
    subscribed.value = true
}
</script>

<template>
    <div>
        <section class="relative flex min-h-120 items-center justify-center bg-gray-500 px-4 py-10 md:h-180">
            <img :src="heroImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <div class="absolute inset-0 bg-black/60" />

            <div class="relative w-full max-w-160 rounded-md bg-white px-6 py-8 shadow-xl md:px-12 md:py-10">
                <div class="flex items-start justify-center gap-3">
                    <div class="text-center">
                        <h2 class="text-h5 font-bold text-[#a30000] md:text-h4">
                            Our Hotel Is Currently Fully Booked !
                        </h2>
                        <p class="mt-2 text-label-m">We Apologize For The Inconvenience .</p>
                    </div>
                    <NuxtLink to="/hotel-favourites" aria-label="Close" class="shrink-0 hover:text-gray-500">
                        <Icon name="icon-park-outline:close" size="24" />
                    </NuxtLink>
                </div>

                <div class="mt-10 text-center md:mt-14">
                    <p class="text-label-m">Thank You For Your Understanding!</p>
                    <p class="mt-1 text-body-xxs text-gray-600">
                        Checking Back With Us In A Few Days As Our Availability Can Change Quickly
                    </p>
                </div>

                <div class="mt-8 text-center md:mt-10">
                    <p class="text-body-xs">Subscribe For Receiving Room Availability Notification</p>
                    <p class="mt-1 text-body-xxs text-gray-600">During Your Time Expectations.</p>
                </div>

                <button type="button" :disabled="subscribed"
                    class="mt-4 flex w-full items-center justify-center gap-2 bg-primary-500 py-3 text-button-l text-white transition-colors hover:bg-primary-600 disabled:cursor-default disabled:bg-green-600"
                    @click="notify">
                    <Icon v-if="subscribed" name="icon-park-outline:check-one" size="18" />
                    {{ subscribed ? 'Notification Activated' : 'Room Availability Notification' }}
                </button>
            </div>
        </section>

    </div>
</template>