<script setup lang="ts">
useHead({ title: 'Digital Ticket - EasySet24' })

const columns = 'grid-cols-[240fr_300fr_260fr_125fr]'

const segments = [
    {
        airline: 'Lufthansa', icon: 'simple-icons:lufthansa', iconClass: 'text-gray-900', ring: true,
        code: 'Tk 881', cabin: 'Economy Class', duration: '3:45h', connecting: false,
        from: { time: '12:00 PM', date: 'Thursday , April 6', city: 'Stockholm(Sweden)', airport: 'Stockholm Arlanda Airport (ARN)' },
        to: { time: '15:45 PM', date: 'Thursday , April 6', city: 'Rome (Italy)', airport: 'Rome Fiumicino Airport (FCO)' },
    },
    {
        airline: 'British Airways', icon: 'simple-icons:britishairways', iconClass: 'text-[#075aaa]', ring: false,
        code: 'Tk 29', cabin: 'Economy Class', duration: '2 Hours', connecting: true,
        from: { time: '21:45 PM', date: 'Thursday , April 6', city: 'Rome (Italy)', airport: 'Rome Fiumicino Airport (FCO)' },
        to: { time: '23:45 PM', date: 'Thursday , April 6', city: 'Istanbul (Turkiye)', airport: 'Sabha (SAW)' },
    },
]

const layovers = [
    { title: 'Layovers & Connecting Flights For Rome, Italy', airport: 'Italy Fiumicino airport', duration: '4h 45m' },
]

const barcodeNumber = '(01)95012345678903(3103)000012'
const barcodeStripes = 'repeating-linear-gradient(to bottom, #111 0 3px, #fff 3px 5px, #111 5px 6px, #fff 6px 9px, #111 9px 12px, #fff 12px 13px)'

const terms = [
    'If You Are Purchasing Your Ticket Using A Debit Or Credit Card Via The Website, We Will Process These Payments Via The Automated Secure Common Payment Gateway Which Will Be Subject To Fraud Screening Purposes.',
    'If You Do Not Supply The Correct Card Billing Address And/Or Cardholder Information, Your Booking Will Not Be Confirmed And The Overall Cost May Increase. We Reserve The Right To Cancel Your Booking If Payment Is Declined For Any Reason Or If You Have Supplied Incorrect Card Information. If We Become Aware Of, Or Is Notified Of, Any Fraud Or Illegal Activity Associated With The Payment For The Booking, The Booking Will Be Cancelled And You Will Be Liable For All Costs And Expenses Arising From Such Cancellation, Without Prejudice To Any Action That May Be Taken Against Us.',
    'Golobe May Require The Card Holder To Provide Additional Payment Verification Upon Request By Either Submitting An Online Form Or Visiting The Nearest Golobe Office, Or At The Airport At The Time Of Check-In. Golobe Reserves The Right To Deny Boarding Or To Collect A Guarantee Payment (In Cash Or From Another Credit Card) If The Card Originally Used For The Purchase Cannot Be Presented By The Cardholder At Check-In Or When Collecting The Tickets, Or In The Case The Original Payment Has Been Withheld Or Disputed By The Card Issuing Bank. Credit Card Details Are Held In A Secured Environment And Transferred Through An Internationally Accepted System.',
]
</script>

<template>
    <div class="page-container pb-12">
        <section class="bg-white px-8 py-12">
            <h1 class="text-h3">Digital Ticket</h1>
            <p class="mt-3 text-label-m">It Is Not Necessary To Print Your Ticket</p>

            <div class="mt-10 flex gap-4 rounded-md border border-gray-300 p-4 max-lg:flex-col">
                <div class="min-w-0 flex-1 overflow-x-auto">
                    <div class="min-w-190">
                        <div class="grid gap-px" :class="columns">
                            <div class="flex h-12 items-center gap-3 bg-gray-400 px-3 text-h6 text-white">
                                <span
                                    class="flex h-9 w-9 items-center justify-center rounded-full border border-primary-500 bg-white text-primary-500">
                                    <Icon name="icon-park-outline:airplane" size="20" />
                                </span>
                                Flight
                            </div>
                            <div class="flex h-12 items-center gap-3 bg-gray-400 px-3 text-h6 text-white">
                                <span
                                    class="flex h-9 w-9 items-center justify-center rounded-full border border-primary-500 bg-white text-primary-500">
                                    <Icon name="icon-park-outline:take-off-one" size="20" />
                                </span>
                                From
                            </div>
                            <div class="flex h-12 items-center gap-3 bg-gray-400 px-3 text-h6 text-white">
                                <span
                                    class="flex h-9 w-9 items-center justify-center rounded-full border border-primary-500 bg-white text-primary-500">
                                    <Icon name="icon-park-outline:landing" size="20" />
                                </span>
                                To
                            </div>
                            <div class="flex h-12 items-center justify-center bg-gray-400 px-3 text-h6 text-white">
                                Duration</div>
                        </div>

                        <template v-for="(s, i) in segments" :key="s.code">
                            <div class="grid divide-x divide-gray-300 border-x border-b border-gray-300"
                                :class="columns">
                                <div class="flex flex-col justify-between gap-6 p-3">
                                    <p class="flex items-center gap-3 text-h6">
                                        <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                                            :class="s.ring ? 'border border-gray-900' : ''">
                                            <Icon :name="s.icon" size="32" :class="s.iconClass" />
                                        </span>
                                        {{ s.airline }}
                                    </p>
                                    <div>
                                        <p class="text-label-m">{{ s.code }}</p>
                                        <p class="mt-1 text-body-s text-primary-500">{{ s.cabin }}</p>
                                    </div>
                                </div>

                                <div class="flex flex-col justify-between gap-6 p-3">
                                    <div>
                                        <p class="text-label-m text-primary-500">{{ s.from.time }}</p>
                                        <p class="mt-1 text-label-m text-success-dark">{{ s.from.date }}</p>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span v-if="s.connecting"
                                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-500 text-primary-500">
                                            <Icon name="icon-park-outline:double-right" size="16" />
                                        </span>
                                        <div>
                                            <p class="text-label-m">{{ s.from.city }}</p>
                                            <p class="mt-1 text-body-s text-gray-500">{{ s.from.airport }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-col justify-between gap-6 p-3">
                                    <div>
                                        <p class="text-label-m text-primary-500">{{ s.to.time }}</p>
                                        <p class="mt-1 text-label-m text-success-dark">{{ s.to.date }}</p>
                                    </div>
                                    <div>
                                        <p class="text-label-m">{{ s.to.city }}</p>
                                        <p class="mt-1 text-body-s text-gray-500">{{ s.to.airport }}</p>
                                    </div>
                                </div>

                                <div class="flex items-center justify-center p-3 text-h6">{{ s.duration }}</div>
                            </div>

                            <div v-if="layovers[i]"
                                class="grid divide-x divide-gray-300 border-x border-b border-gray-300"
                                :class="columns">
                                <div class="flex items-center gap-4 p-3">
                                    <span
                                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-500 text-primary-500">
                                        <Icon name="icon-park-outline:double-right" size="16" />
                                    </span>
                                    <p class="text-label-m">One Stop</p>
                                </div>
                                <div class="col-span-2 p-3">
                                    <p class="text-body-m">{{ layovers[i]!.title }}</p>
                                    <p class="mt-1 text-body-xxs text-primary-500">
                                        {{ layovers[i]!.airport }} , <button type="button" class="hover:underline">See
                                            More...</button>
                                    </p>
                                </div>
                                <div class="flex items-center justify-center p-3 text-h6">{{ layovers[i]!.duration }}
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="border-dashed border-gray-900 max-lg:border-t-2 lg:border-l-2" />

                <div class="flex w-full shrink-0 flex-col lg:w-31.25">
                    <div class="flex h-12 items-center justify-center bg-gray-400 px-3 text-h6 text-white">Bar Code
                    </div>
                    <div class="flex flex-1 flex-col items-center gap-4 border border-t-0 border-gray-300 p-3">
                        <Icon name="icon-park-outline:two-dimensional-code" size="70" class="text-gray-900" />
                        <div class="flex min-h-50 w-full flex-1 items-stretch justify-center gap-1">
                            <div class="w-12" :style="{ background: barcodeStripes }" aria-hidden="true" />
                            <p class="self-center rotate-180 text-[10px] text-gray-500 [writing-mode:vertical-rl]">{{
                                barcodeNumber }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 class="mt-16 text-h3">Terms And Conditions</h2>
            <h3 class="mt-4 text-label-m">Payments</h3>
            <ul class="mt-4 list-disc space-y-4 pl-6 text-body-m">
                <li v-for="t in terms" :key="t.slice(0, 24)">{{ t }}</li>
            </ul>
        </section>
    </div>
</template>