<script setup lang="ts">
import { useHotelsStore } from '~/stores/hotels'

const route = useRoute()
const store = useHotelsStore()
const { detail: hotel, detailLoading, detailError, reviews, rates } = storeToRefs(store)

await useAsyncData(`hotel-${route.params.id}`, async () => {
    const id = String(route.params.id)
    await Promise.all([store.fetchHotel(id), store.fetchReviews(id)])
    return true
}, { watch: [() => route.params.id] })

useHead({ title: computed(() => hotel.value?.name ?? 'Hotel Information') })

const tabs = ['Place Details', 'Info & Prices', 'Rooms & Beds', 'Place Rules']
const activeTab = ref(tabs[0])
const liked = ref(false)

const faqs = [
    { question: 'How And When Do I Pay?', answer: 'Since this option is a non-refundable reservation and there is no cancellation opportunity, payment is usually processed at the time of booking or shortly thereafter.' },
    { question: 'Is There Anti-Allergic Meal?', answer: 'Special meals, such as allergen-free options, can be requested from the hotel before arrival. Contact the property after booking to confirm your needs.' },
    { question: 'Does The Hotel Have A Pool?', answer: 'Facilities differ for each property. See the Amenities list in Place Details to check if a pool is available.' },
    { question: 'Any Identification Documents Is Necessary', answer: 'A valid photo ID or passport is normally required at check-in. International guests are usually asked for a passport.' },
    { question: 'What Are The Check-In And Check-Out Times?', answer: 'Times differ for each property and are confirmed in your booking details. Check-in is usually in the afternoon and check-out is usually before noon.' },
    { question: 'Why Was I Charged?', answer: 'The charge is the room rate plus any taxes and fees shown at checkout. Your booking confirmation has the full breakdown.' },
    { question: 'Is There A Spa?', answer: 'Facilities differ for each property. See the Amenities list in Place Details to check if a spa is available.' },
]
const openFaq = ref<number[]>([0])
const toggleFaq = (i: number) => {
    openFaq.value = openFaq.value.includes(i)
        ? openFaq.value.filter((n) => n !== i)
        : [...openFaq.value, i]
}

const track = ref<HTMLElement | null>(null)
const scroll = (dir: 1 | -1) =>
    track.value?.scrollBy({ left: dir * (track.value.clientWidth + 16), behavior: 'smooth' })
</script>

<template>
    <div>
        <p v-if="detailLoading" class="page-container py-10 text-body-s text-gray-500">Loading hotel...</p>
        <p v-else-if="detailError" class="page-container py-10 text-body-s text-error-light">{{ detailError }}</p>
        <div v-else-if="hotel" class="page-container space-y-12 pb-12">
            <div class="grid h-72 grid-cols-4 grid-rows-2 gap-3 sm:h-96 lg:h-120">
                <img :src="hotel.images[0]" :alt="hotel.name"
                    class="col-span-2 row-span-2 h-full w-full rounded-l-md object-cover" />
                <img :src="hotel.images[1]" :alt="hotel.name" class="h-full w-full object-cover" />
                <img :src="hotel.images[2]" :alt="hotel.name" class="h-full w-full rounded-tr-md object-cover" />
                <img :src="hotel.images[3]" :alt="hotel.name" class="h-full w-full object-cover" />
                <button type="button" class="relative overflow-hidden rounded-br-md">
                    <img :src="hotel.images[4]" :alt="hotel.name" class="h-full w-full object-cover" />
                    <span
                        class="absolute inset-0 flex items-end gap-2 bg-linear-to-t from-black/60 via-transparent to-transparent p-4 text-label-m text-white">
                        <Icon name="icon-park-outline:pic" size="18" />
                        See More Photos
                        <Icon name="icon-park-outline:right" size="16" />
                    </span>
                </button>
            </div>

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
                                <p v-for="text in hotel.descriptionCols[0]" :key="text">{{ text }}</p>
                            </div>
                            <div class="space-y-4 text-body-xs">
                                <p v-for="text in hotel.descriptionCols[1]" :key="text">{{ text }}</p>
                            </div>
                        </div>

                        <div class="mt-10 grid gap-8 md:grid-cols-2">
                            <div>
                                <h3 class="mb-4 text-label-m">Amenities</h3>
                                <ul class="grid grid-cols-2 gap-x-6 gap-y-4 text-body-xs text-gray-500">
                                    <li v-for="item in hotel.amenities" :key="item.label"
                                        class="flex items-center gap-3">
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
                                    {{ hotel.address }}
                                </p>
                                <p class="mt-auto md:text-right">
                                    <span class="text-h6 text-success-dark">{{ hotel.price }}</span>
                                    <span class="ml-1 text-label-m">Per night</span>
                                </p>
                                <div class="flex gap-3 md:justify-end">
                                    <button type="button" aria-label="Add to favourites"
                                        class="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-400 text-primary-500 hover:bg-primary-500 hover:text-white"
                                        @click="liked = !liked">
                                        <Icon name="icon-park-outline:like" size="18"
                                            :class="liked ? 'text-error-light' : 'text-black'" />
                                    </button>
                                    <NuxtLink to="/hotels/payment"
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

            <section>
                <h2 class="mb-4 text-h6">The Most Frequented Questions Asked By Travellers</h2>
                <div>
                    <div v-for="(faq, i) in faqs" :key="faq.question" class="border-b border-gray-300 bg-white">
                        <button type="button" :aria-expanded="openFaq.includes(i)"
                            class="flex w-full items-center justify-between px-6 py-4 text-left text-label-m hover:bg-gray-100"
                            @click="toggleFaq(i)">
                            {{ faq.question }}
                            <Icon :name="openFaq.includes(i) ? 'icon-park-outline:up' : 'icon-park-outline:down'"
                                size="18" class="text-gray-400" />
                        </button>
                        <p v-if="openFaq.includes(i) && faq.answer" class="px-6 pb-4 text-body-xs">{{ faq.answer }}</p>
                    </div>
                </div>
            </section>

            <div v-if="reviews.length" class="flex items-center gap-2">
                <button type="button" class="text-primary-500" aria-label="Previous reviews" @click="scroll(-1)">
                    <Icon name="icon-park-outline:left" size="20" />
                </button>

                <div ref="track" class="flex flex-1 snap-x gap-4 overflow-x-auto pb-2 pt-14 scrollbar-none">
                    <article v-for="(review, i) in reviews" :key="i"
                        class="relative shrink-0 grow-0 basis-full snap-start rounded-md bg-white px-4 pb-4 pt-12 transition-shadow hover:shadow-md sm:basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-4rem)/5)]">
                        <img :src="review.avatar" :alt="review.name"
                            class="absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full object-cover" />
                        <p class="mb-2 flex items-center gap-2 text-label-m">
                            <Icon v-if="review.country" :name="`circle-flags:${review.country}`" size="16" />
                            {{ review.name }}
                            <span v-if="review.score" class="ml-auto text-caption-s text-gray-500">{{ review.score
                                }}</span>
                        </p>
                        <p class="line-clamp-4 text-body-xs">"{{ review.text }}"</p>
                        <NuxtLink to="#" class="text-caption-s text-primary-500">Read More ...</NuxtLink>
                    </article>
                </div>

                <button type="button" class="text-primary-500" aria-label="Next reviews" @click="scroll(1)">
                    <Icon name="icon-park-outline:right" size="20" />
                </button>
            </div>

            <section v-if="rates.length">
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
    </div>
</template>