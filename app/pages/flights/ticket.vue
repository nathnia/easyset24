<script setup lang="ts">
import { useAirportsStore } from '~/stores/airports'
import { flightBookingKey, flightStatusLabel, rememberFlight, toFlightBooking } from '~/utils/flightBooking'
import type { FlightBooking } from '~/utils/flightBooking'

useHead({ title: 'Digital Ticket' })

const route = useRoute()
const airports = useAirportsStore()
const { user } = useAuth()

const pid = String(route.query.pid ?? '')
const tid = String(route.query.tid ?? '')

const status = ref<'loading' | 'done' | 'error'>('loading')
const error = ref('')
const booking = ref<FlightBooking | null>(null)
let running = false

const columns = 'grid-cols-[240fr_300fr_260fr_125fr]'

// "Stockholm (ARN)" once the city is known, else the airport name
const place = (code: string, name: string) => airports.known[code]?.city ? `${airports.known[code]!.city} (${code})` : name || code

const segments = computed(() => (booking.value?.segments ?? []).map((s) => ({
    ...s,
    from: { ...s.from, city: place(s.from.code, s.from.airport) },
    to: { ...s.to, city: place(s.to.code, s.to.airport) },
})))
const layovers = computed(() => (booking.value?.layovers ?? []).map((l) => l && ({
    title: 'Layover & Connecting Flight',
    airport: l.airport,
    duration: l.duration,
})))

const isPending = computed(() => booking.value?.status === 'PENDING_CONFIRMATION')
const barcodeNumber = computed(() => booking.value?.pnr || booking.value?.bookingId || '')
const barcodeStripes = 'repeating-linear-gradient(to bottom, #111 0 3px, #fff 3px 5px, #111 5px 6px, #fff 6px 9px, #111 9px 12px, #fff 12px 13px)'

async function run() {
    if (running) return
    running = true
    status.value = 'loading'
    error.value = ''
    try {
        if (!pid || !tid) throw new Error('Payment reference is missing.')
        if (route.query.redirect_status && route.query.redirect_status !== 'succeeded') {
            throw new Error('The payment was not completed. You were not charged for a booking.')
        }

        // Already booked (page refresh): show it. The book call is also safe to repeat for the same prebook.
        const saved = sessionStorage.getItem(flightBookingKey(pid))
        if (saved) {
            booking.value = JSON.parse(saved)
        } else {
            const res = await $fetch('/api/flight-book', { method: 'POST', body: { prebookId: pid, transactionId: tid } })
            const b = toFlightBooking(res)
            if (!b.bookingId) throw new Error('The booking was not confirmed.')
            booking.value = b
            sessionStorage.setItem(flightBookingKey(pid), JSON.stringify(b))
        }
        status.value = 'done'
        rememberFlight(user.value?.email ?? '', booking.value!.bookingId)
        // city names for the airport codes (not awaited: the ticket is already usable)
        const codes = new Set(booking.value!.segments.flatMap((s) => [s.from.code, s.to.code]))
        void Promise.all([...codes].filter(Boolean).map((c) => airports.lookup(c)))
    } catch (e: any) {
        error.value = e?.data?.data?.description || e?.data?.statusMessage || e?.statusMessage || e?.message || 'Booking failed.'
        status.value = 'error'
    } finally {
        running = false
    }
}

onMounted(run)

const terms = [
    'If You Are Purchasing Your Ticket Using A Debit Or Credit Card Via The Website, We Will Process These Payments Via The Automated Secure Common Payment Gateway Which Will Be Subject To Fraud Screening Purposes.',
    'If You Do Not Supply The Correct Card Billing Address And/Or Cardholder Information, Your Booking Will Not Be Confirmed And The Overall Cost May Increase. We Reserve The Right To Cancel Your Booking If Payment Is Declined For Any Reason Or If You Have Supplied Incorrect Card Information. If We Become Aware Of, Or Is Notified Of, Any Fraud Or Illegal Activity Associated With The Payment For The Booking, The Booking Will Be Cancelled And You Will Be Liable For All Costs And Expenses Arising From Such Cancellation, Without Prejudice To Any Action That May Be Taken Against Us.',
    'Golobe May Require The Card Holder To Provide Additional Payment Verification Upon Request By Either Submitting An Online Form Or Visiting The Nearest Golobe Office, Or At The Airport At The Time Of Check-In. Golobe Reserves The Right To Deny Boarding Or To Collect A Guarantee Payment (In Cash Or From Another Credit Card) If The Card Originally Used For The Purchase Cannot Be Presented By The Cardholder At Check-In Or When Collecting The Tickets, Or In The Case The Original Payment Has Been Withheld Or Disputed By The Card Issuing Bank. Credit Card Details Are Held In A Secured Environment And Transferred Through An Internationally Accepted System.',
]
</script>

<template>
    <div class="page-container pb-12">
        <p v-if="status === 'loading'" class="py-10 text-body-s text-gray-500">Confirming your booking, please wait...
        </p>

        <section v-else-if="status === 'error'" class="rounded-md bg-white p-4 md:p-6">
            <h1 class="text-h4">We could not confirm your booking</h1>
            <p class="mt-3 text-body-m text-error-light">{{ error }}</p>
            <p v-if="tid" class="mt-3 text-body-s">
                If you were charged, contact EasySet24 with this payment reference:
                <b>{{ tid }}</b>
            </p>
            <div class="mt-6 flex gap-3">
                <button v-if="pid && tid" type="button"
                    class="rounded-sm bg-primary-500 px-6 py-3 text-button-l text-white hover:bg-primary-600"
                    @click="run">
                    Try again
                </button>
                <NuxtLink to="/flights"
                    class="rounded-sm border border-primary-500 px-6 py-3 text-button-l text-primary-500">
                    Back to flights
                </NuxtLink>
            </div>
        </section>

        <section v-else-if="booking" class="bg-white px-8 py-12">
            <h1 class="text-h3">Digital Ticket</h1>
            <p class="mt-3 text-label-m">It Is Not Necessary To Print Your Ticket</p>
            <p class="mt-2 text-body-m">
                Booking Number <b>{{ booking.bookingId }}</b>
                <template v-if="booking.pnr"> - Airline Reference <b>{{ booking.pnr }}</b></template>
                <template v-if="booking.status"> - <span class="text-primary-500">{{ flightStatusLabel(booking.status)
                        }}</span></template>
            </p>
            <p v-if="isPending" class="mt-1 text-body-xs text-gray-500">
                Your booking is saved. The airline has not confirmed the ticket yet.
            </p>

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
                                        <span
                                            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gray-900">
                                            <img v-if="s.logoUrl" :src="s.logoUrl" alt=""
                                                class="h-9 w-9 object-contain" />
                                            <Icon v-else name="icon-park-outline:airplane" size="32"
                                                class="text-gray-900" />
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