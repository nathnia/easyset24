<script setup lang="ts">
import { cancelText, formatDate, getRememberedBookings, nightsBetween, toBooking, toCancelInfo } from '~/utils/booking'
import type { Booking } from '~/utils/booking'
import { formatPrice } from '~/utils/liteapi'
import { formatFlightPrice } from '~/utils/flights'
import { flightStatusLabel, getRememberedFlights, toFlightBooking, toFlightCancel, toFlightQuote } from '~/utils/flightBooking'
import type { FlightBooking, FlightQuote } from '~/utils/flightBooking'

definePageMeta({ layout: 'checkout' })
useHead({ title: 'My Bookings' })

interface Item {
    id: string
    booking: Booking | null
    error: string
    confirming: boolean
    cancelling: boolean
    cancelError: string
    refund?: number
    fee?: number
}

interface FlightItem {
    id: string
    booking: FlightBooking | null
    error: string
    quoting: boolean
    confirming: boolean
    cancelling: boolean
    cancelError: string
    quote: FlightQuote | null
    result: { pending: boolean; fee: number; refund: number; currency: string } | null
}

const { user } = useAuth()
const items = ref<Item[]>([])
const flights = ref<FlightItem[]>([])
const loading = ref(true)

interface ApiError {
    message?: string
    statusMessage?: string
    data?: { statusMessage?: string; data?: { description?: string } }
}
const errText = (e: unknown, fallback: string) => {
    const x = e as ApiError | null
    return x?.data?.statusMessage || x?.statusMessage || x?.message || fallback
}
const isCancelled = (b: Booking) => /^cancel/i.test(b.status)

async function fetchBooking(id: string) {
    return toBooking(await $fetch('/api/booking', { query: { id } }))
}

onMounted(async () => {
    const email = user.value?.email ?? ''
    const [hotelItems, flightItems] = await Promise.all([
        Promise.all(
            getRememberedBookings(email).map(async (id): Promise<Item> => {
                const base = { id, confirming: false, cancelling: false, cancelError: '' }
                try {
                    return { ...base, booking: await fetchBooking(id), error: '' }
                } catch (e) {
                    return { ...base, booking: null, error: errText(e, 'Could not load this booking.') }
                }
            }),
        ),
        Promise.all(
            getRememberedFlights(email).map(async (id): Promise<FlightItem> => {
                const base = { id, quoting: false, confirming: false, cancelling: false, cancelError: '', quote: null, result: null }
                try {
                    return { ...base, booking: await fetchFlight(id), error: '' }
                } catch (e) {
                    return { ...base, booking: null, error: flightErr(e, 'Could not load this booking.') }
                }
            }),
        ),
    ])
    items.value = hotelItems
    flights.value = flightItems
    loading.value = false
})

const flightErr = (e: unknown, fallback: string) => (e as ApiError | null)?.data?.data?.description || errText(e, fallback)
const fetchFlight = async (id: string) => toFlightBooking(await $fetch('/api/flight-booking', { query: { id } }))
const flightCancelled = (b: FlightBooking) => /^cancel/i.test(b.status)
const money = (n: number, c: string) => formatFlightPrice(n, c)

async function startFlightCancel(f: FlightItem) {
    f.quoting = true
    f.cancelError = ''
    try {
        f.quote = toFlightQuote(await $fetch('/api/flight-cancel', { query: { id: f.id } }))
        f.confirming = true
    } catch (e) {
        f.cancelError = flightErr(e, 'Could not get the cancellation quote.')
    } finally {
        f.quoting = false
    }
}

async function confirmFlightCancel(f: FlightItem) {
    f.cancelling = true
    f.cancelError = ''
    try {
        f.result = toFlightCancel(await $fetch('/api/flight-cancel', { method: 'POST', body: { id: f.id } }))
        f.booking = await fetchFlight(f.id)
        f.confirming = false
    } catch (e) {
        f.cancelError = flightErr(e, 'Could not cancel this booking.')
    } finally {
        f.cancelling = false
    }
}

const statusLabel = (b: FlightBooking) => {
    if (flightCancelled(b)) return 'Cancelled'
    if (b.cancelPending) return 'Cancellation requested'
    return flightStatusLabel(b.status) || 'Received'
}
const statusClass = (b: FlightBooking) => {
    if (flightCancelled(b)) return 'bg-gray-300 text-gray-500'
    if (b.status === 'CONFIRMED' && !b.cancelPending) return 'bg-success-light text-success-dark'
    return 'bg-gray-100 text-black'
}
const fareText = (b: FlightBooking) => (b.refundable ? 'This fare is refundable.' : 'This fare is non-refundable.')
const fareClass = (b: FlightBooking) => (b.refundable ? 'text-success-dark' : 'text-error-light')
const paxText = (b: FlightBooking) => {
    const n = b.passengers.length
    return n + (n === 1 ? ' passenger' : ' passengers')
}
const totalText = (b: FlightBooking) => (b.price !== null ? money(b.price, b.currency) : '-')
const segmentsText = (b: FlightBooking) => b.segments.map((s) => s.code + ' ' + s.from.code + '-' + s.to.code).join(' | ')
const cancelBtnText = (f: FlightItem) => (f.quoting ? 'Checking the cost...' : 'Cancel booking')
const confirmBtnText = (f: FlightItem) => (f.cancelling ? 'Cancelling...' : 'Yes, cancel it')

function quoteText(q: FlightQuote) {
    const parts: string[] = []
    if (q.penalty !== null) parts.push(`Cancellation fee: ${money(q.penalty, q.currency)}.`)
    if (q.refund) {
        parts.push(`You may get back up to ${money(q.refund, q.currency)}${q.destination === 'voucher' ? ' as an airline credit' : ''}. The airline decides the final amount.`)
    } else if (q.voucher) {
        parts.push(`You get an airline credit of ${money(q.voucher, q.currency)}.`)
    } else {
        parts.push('No refund is available for this fare.')
    }
    return parts.join(' ')
}

async function cancel(item: Item) {
    item.cancelling = true
    item.cancelError = ''
    try {
        const res = await $fetch('/api/booking', { method: 'PUT', body: { id: item.id } })
        const { fee, refund } = toCancelInfo(res)
        item.fee = fee
        item.refund = refund
        item.booking = await fetchBooking(item.id)
        item.confirming = false
    } catch (e) {
        item.cancelError = errText(e, 'Could not cancel this booking.')
    } finally {
        item.cancelling = false
    }
}

const nights = (b: Booking) => nightsBetween(b.checkin, b.checkout)
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSidebar />

            <section class="rounded-md bg-white p-6 lg:p-8">
                <h1 class="text-h6 text-black">My Bookings</h1>
                <p class="mt-3 text-body-xs text-gray-500">
                    Hotel and flight bookings made on this device. You can cancel a booking here.
                </p>

                <p v-if="loading" class="mt-8 text-body-s text-gray-500">Loading your bookings...</p>
                <p v-else-if="!items.length && !flights.length" class="mt-8 text-body-s text-gray-500">
                    No bookings yet.
                    <NuxtLink to="/hotels" class="text-primary-500 underline">Find a hotel</NuxtLink>
                    or
                    <NuxtLink to="/flights" class="text-primary-500 underline">a flight</NuxtLink>
                </p>

                <template v-else>
                    <h2 v-if="items.length && flights.length" class="mt-6 text-label-m">Hotel bookings</h2>
                    <ul v-if="items.length" class="mt-6 space-y-4">
                        <li v-for="item in items" :key="item.id" class="rounded-md border border-gray-300 p-4">
                            <p v-if="!item.booking" class="text-body-xs">
                                <b>Booking {{ item.id }}</b>
                                <span class="block text-error-light">{{ item.error }}</span>
                            </p>

                            <template v-else>
                                <div class="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 class="text-label-m">{{ item.booking.hotelName || 'Hotel booking' }}</h2>
                                        <p class="mt-1 text-caption-s text-gray-500">Booking No. {{
                                            item.booking.bookingId
                                        }}</p>
                                    </div>
                                    <span class="rounded-full px-3 py-1 text-caption-s font-semibold!" :class="isCancelled(item.booking)
                                        ? 'bg-gray-300 text-gray-500'
                                        : item.booking.status === 'CONFIRMED'
                                            ? 'bg-success-light text-success-dark'
                                            : 'bg-gray-100 text-black'">
                                        {{ isCancelled(item.booking) ? 'Cancelled' : item.booking.status || 'Received'
                                        }}
                                    </span>
                                </div>

                                <dl class="mt-4 grid grid-cols-2 gap-4 text-body-xs sm:grid-cols-4">
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Check-In</dt>
                                        <dd>{{ formatDate(item.booking.checkin) }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Check-Out</dt>
                                        <dd>{{ formatDate(item.booking.checkout) }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Stay</dt>
                                        <dd>
                                            {{ nights(item.booking) }} {{ nights(item.booking) === 1 ? 'night' :
                                                'nights'
                                            }},
                                            {{ item.booking.rooms }} {{ item.booking.rooms === 1 ? 'room' : 'rooms' }}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Total</dt>
                                        <dd>{{ item.booking.price !== undefined ? formatPrice(item.booking.price) : '-'
                                        }}
                                        </dd>
                                    </div>
                                </dl>

                                <p v-if="item.booking.roomName" class="mt-3 text-body-xs text-gray-500">
                                    {{ [item.booking.roomName, item.booking.board].filter(Boolean).join(' | ') }}
                                </p>

                                <template v-if="isCancelled(item.booking)">
                                    <p v-if="item.refund !== undefined || item.fee !== undefined"
                                        class="mt-3 text-body-xs">
                                        <span v-if="item.refund !== undefined">Refund: <b>{{ formatPrice(item.refund)
                                        }}</b></span>
                                        <span v-if="item.fee !== undefined" class="ml-4">Cancellation fee: <b>{{
                                            formatPrice(item.fee) }}</b></span>
                                    </p>
                                </template>

                                <div v-else class="mt-4 border-t border-gray-300 pt-4">
                                    <p class="text-body-xs"
                                        :class="item.booking.refundable ? 'text-success-dark' : 'text-error-light'">
                                        {{ cancelText(item.booking) }}
                                    </p>

                                    <button v-if="!item.confirming" type="button"
                                        class="mt-3 rounded-sm border border-error-light px-5 py-2 text-button-s text-error-light hover:bg-error-light hover:text-white"
                                        @click="item.confirming = true">
                                        Cancel booking
                                    </button>

                                    <div v-else class="mt-3">
                                        <p class="text-body-xs">
                                            Cancel this booking?
                                            <span v-if="!item.booking.refundable"> It is non-refundable, so you may not
                                                get
                                                your money back.</span>
                                        </p>
                                        <div class="mt-2 flex gap-3">
                                            <button type="button" :disabled="item.cancelling"
                                                class="rounded-sm bg-error-light px-5 py-2 text-button-s text-white disabled:opacity-50"
                                                @click="cancel(item)">
                                                {{ item.cancelling ? 'Cancelling...' : 'Yes, cancel it' }}
                                            </button>
                                            <button type="button" :disabled="item.cancelling"
                                                class="rounded-sm border border-gray-300 px-5 py-2 text-button-s hover:bg-gray-100"
                                                @click="item.confirming = false">
                                                Keep booking
                                            </button>
                                        </div>
                                    </div>
                                    <p v-if="item.cancelError" class="mt-2 text-body-xs text-error-light">{{
                                        item.cancelError }}</p>
                                </div>
                            </template>
                        </li>
                    </ul>

                    <h2 v-if="flights.length" class="mt-8 text-label-m">Flight bookings</h2>
                    <ul v-if="flights.length" class="mt-4 space-y-4">
                        <li v-for="f in flights" :key="f.id" class="rounded-md border border-gray-300 p-4">
                            <p v-if="!f.booking" class="text-body-xs">
                                <b>Booking {{ f.id }}</b>
                                <span class="block text-error-light">{{ f.error }}</span>
                            </p>

                            <template v-else>
                                <div class="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 class="text-label-m">{{ f.booking.route || 'Flight booking' }}</h2>
                                        <p class="mt-1 text-caption-s text-gray-500">Booking No. {{ f.booking.bookingId
                                        }}
                                            <template v-if="f.booking.pnr"> | Airline Reference {{ f.booking.pnr
                                            }}</template>
                                        </p>
                                    </div>
                                    <span class="rounded-full px-3 py-1 text-caption-s font-semibold!"
                                        :class="statusClass(f.booking)">
                                        {{ statusLabel(f.booking) }}
                                    </span>
                                </div>

                                <dl class="mt-4 grid grid-cols-2 gap-4 text-body-xs sm:grid-cols-4">
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Departure</dt>
                                        <dd>{{ f.booking.departDate || '-' }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Return</dt>
                                        <dd>{{ f.booking.returnDate || 'One way' }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Passengers</dt>
                                        <dd>{{ paxText(f.booking) }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-caption-s text-gray-500">Total</dt>
                                        <dd>{{ totalText(f.booking) }}</dd>
                                    </div>
                                </dl>

                                <p v-if="f.booking.segments.length" class="mt-3 text-body-xs text-gray-500">
                                    {{ segmentsText(f.booking) }}
                                </p>

                                <template v-if="flightCancelled(f.booking)">
                                    <p v-if="f.result" class="mt-3 text-body-xs">
                                        <span>Refund: <b>{{ money(f.result.refund, f.result.currency) }}</b></span>
                                        <span class="ml-4">Cancellation fee: <b>{{ money(f.result.fee,
                                            f.result.currency) }}</b></span>
                                    </p>
                                </template>

                                <p v-else-if="f.booking.cancelPending || f.result?.pending"
                                    class="mt-4 border-t border-gray-300 pt-4 text-body-xs">
                                    The cancellation was sent to the airline. It is waiting for their confirmation.
                                </p>

                                <div v-else class="mt-4 border-t border-gray-300 pt-4">
                                    <p class="text-body-xs" :class="fareClass(f.booking)">{{ fareText(f.booking) }}</p>

                                    <button v-if="!f.confirming" type="button" :disabled="f.quoting"
                                        class="mt-3 rounded-sm border border-error-light px-5 py-2 text-button-s text-error-light hover:bg-error-light hover:text-white disabled:opacity-50"
                                        @click="startFlightCancel(f)">
                                        {{ cancelBtnText(f) }}
                                    </button>

                                    <div v-else class="mt-3">
                                        <p class="text-body-xs">
                                            Cancel this booking? <span v-if="f.quote">{{ quoteText(f.quote) }}</span>
                                        </p>
                                        <div class="mt-2 flex gap-3">
                                            <button type="button" :disabled="f.cancelling"
                                                class="rounded-sm bg-error-light px-5 py-2 text-button-s text-white disabled:opacity-50"
                                                @click="confirmFlightCancel(f)">
                                                {{ confirmBtnText(f) }}
                                            </button>
                                            <button type="button" :disabled="f.cancelling"
                                                class="rounded-sm border border-gray-300 px-5 py-2 text-button-s hover:bg-gray-100"
                                                @click="f.confirming = false">
                                                Keep booking
                                            </button>
                                        </div>
                                    </div>
                                    <p v-if="f.cancelError" class="mt-2 text-body-xs text-error-light">{{ f.cancelError
                                    }}</p>
                                </div>
                            </template>
                        </li>
                    </ul>
                </template>
            </section>
        </div>
    </main>
</template>