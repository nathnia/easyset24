<script setup lang="ts">
useHead({ title: 'Customer Service - EasySet24' })

const contacts = [
    {
        icon: 'icon-park-outline:phone-telephone',
        title: 'Call Us',
        text: 'For Anything Urgent, You Can Call Us 24/7 At A Local Or International Phone Number.',
    },
    {
        icon: 'icon-park-outline:message',
        title: 'Send Us A Message',
        text: "Contact Our Agents About Your Booking, And We'll Reply As Soon As Possible.",
    },
    {
        icon: 'icon-park-outline:building-one',
        title: 'Contact The Property',
        text: 'For Details About Your Stay, They Usually Know Best.',
    },
]

const helpCenter = [
    { title: 'Tailor-made Customer Service', text: "Tell Us What's Happening And We'll Guide You Through What To Do Next." },
    { title: 'Contact us anytime', text: 'Send Us A Message Or Pick Up The Phone – Our Agents Are Always Available' },
    { title: 'All the important things in one place', text: 'Call Or Message The Property, And See All The Essential Information About Your Stay.' },
]

const answer = 'Since This Option Is A Non-Refundable Reservation And There Is No Cancellation Opportunity, Payment Is Usually Processed At The Time Of Booking Or Shortly Thereafter.'

const faqs = [
    { q: 'How And When Do I Pay?', a: answer },
    { q: 'Is There Anti-Allergic Meal?', a: answer },
    { q: 'Does The Hotel Have A Pool?', a: answer },
    { q: 'Any Identification Documents Is Necessary', a: answer },
    { q: 'What Are The Check-In And Check-Out Times?', a: answer },
    { q: 'Why Was I Charged?', a: answer },
    { q: 'Is There A Spa?', a: answer },
]

const openItems = ref<number[]>(faqs.map((_, i) => i))
const isOpen = (i: number) => openItems.value.includes(i)
const toggle = (i: number) => {
    openItems.value = isOpen(i)
        ? openItems.value.filter(n => n !== i)
        : [...openItems.value, i]
}
</script>

<template>
    <div>
        <div class="flex flex-col gap-16 py-12">
            <section class="page-container flex flex-col gap-5 md:px-3">
                <div class="flex flex-col gap-1">
                    <h1 class="text-h3">Customer Service</h1>
                    <p class="text-body-s">How Can We Help? We're Available 24 Hours A Day.</p>
                </div>

                <div class="grid gap-4 md:grid-cols-3">
                    <div v-for="c in contacts" :key="c.title"
                        class="flex items-center gap-6 rounded-md bg-white px-8 py-8 shadow-sm">
                        <Icon :name="c.icon" size="32" class="shrink-0" />
                        <div class="flex flex-col gap-2">
                            <h2 class="text-label-m">{{ c.title }}</h2>
                            <p class="text-body-xs">{{ c.text }}</p>
                        </div>
                    </div>
                </div>

                <a href="#help-center"
                    class="self-start rounded-sm bg-primary-500 px-4 py-3 text-button-m text-white hover:bg-primary-600">
                    Go To The Help Center
                </a>
            </section>

            <section id="help-center" class="page-container flex scroll-mt-6 flex-col gap-5">
                <h2 class="text-h3">Our Help Center</h2>
                <div class="flex flex-col gap-5 rounded-md bg-white px-4 py-4">
                    <div v-for="h in helpCenter" :key="h.title" class="flex flex-col gap-2">
                        <h3 class="text-h5">{{ h.title }}</h3>
                        <p class="text-body-s">{{ h.text }}</p>
                    </div>
                </div>
            </section>

            <section class="page-container flex flex-col gap-5">
                <h2 class="text-h3">Frequently Asked Questions</h2>
                <div class="bg-white">
                    <div v-for="(f, i) in faqs" :key="f.q" class="border-b border-gray-200">
                        <button type="button" :id="`faq-btn-${i}`" :aria-expanded="isOpen(i)"
                            :aria-controls="`faq-panel-${i}`"
                            class="group flex w-full items-center justify-between gap-4 px-6 pb-3 pt-6 text-left"
                            @click="toggle(i)">
                            <span class="text-label-m transition-colors group-hover:text-gray-500">{{ f.q }}</span>
                            <Icon name="icon-park-outline:down" size="18"
                                class="shrink-0 text-gray-400 transition-transform duration-200"
                                :class="isOpen(i) ? 'rotate-180' : ''" />
                        </button>
                        <div v-show="isOpen(i)" :id="`faq-panel-${i}`" role="region" :aria-labelledby="`faq-btn-${i}`"
                            class="px-6 pb-6">
                            <p class="text-body-xs">{{ f.a }}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>