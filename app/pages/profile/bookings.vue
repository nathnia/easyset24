<script setup lang="ts">
import { cancelText, formatDate, getRememberedBookings, nightsBetween, toBooking, toCancelInfo } from '~/utils/booking'
import type { Booking } from '~/utils/booking'
import { formatPrice } from '~/utils/liteapi'

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

const { user } = useAuth()
const items = ref<Item[]>([])
const loading = ref(true)

const errText = (e: any, fallback: string) => e?.data?.statusMessage || e?.statusMessage || e?.message || fallback
const isCancelled = (b: Booking) => /^cancel/i.test(b.status)

async function fetchBooking(id: string) {
    return toBooking(await $fetch('/api/booking', { query: { id } }))
}

onMounted(async () => {
    const ids = getRememberedBookings(user.value?.email ?? '')
    items.value = await Promise.all(
        ids.map(async (id): Promise<Item> => {
            const base = { id, confirming: false, cancelling: false, cancelError: '' }
            try {
                return { ...base, booking: await fetchBooking(id), error: '' }
            } catch (e: any) {
                return { ...base, booking: null, error: errText(e, 'Could not load this booking.') }
            }
        }),
    )
    loading.value = false
})

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
    } catch (e: any) {
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
                    Hotel bookings made on this device. You can cancel a booking here.
                </p>

                <p v-if="loading" class="mt-8 text-body-s text-gray-500">Loading your bookings...</p>
                <p v-else-if="!items.length" class="mt-8 text-body-s text-gray-500">
                    No bookings yet.
                    <NuxtLink to="/hotels" class="text-primary-500 underline">Find a hotel</NuxtLink>
                </p>

                <ul v-else class="mt-6 space-y-4">
                    <li v-for="item in items" :key="item.id" class="rounded-md border border-gray-300 p-4">
                        <p v-if="!item.booking" class="text-body-xs">
                            <b>Booking {{ item.id }}</b>
                            <span class="block text-error-light">{{ item.error }}</span>
                        </p>

                        <template v-else>
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 class="text-label-m">{{ item.booking.hotelName || 'Hotel booking' }}</h2>
                                    <p class="mt-1 text-caption-s text-gray-500">Booking No. {{ item.booking.bookingId
                                        }}</p>
                                </div>
                                <span class="rounded-full px-3 py-1 text-caption-s font-semibold!" :class="isCancelled(item.booking)
                                    ? 'bg-gray-300 text-gray-500'
                                    : item.booking.status === 'CONFIRMED'
                                        ? 'bg-success-light text-success-dark'
                                        : 'bg-gray-100 text-black'">
                                    {{ isCancelled(item.booking) ? 'Cancelled' : item.booking.status || 'Received' }}
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
                                        {{ nights(item.booking) }} {{ nights(item.booking) === 1 ? 'night' : 'nights'
                                        }},
                                        {{ item.booking.rooms }} {{ item.booking.rooms === 1 ? 'room' : 'rooms' }}
                                    </dd>
                                </div>
                                <div>
                                    <dt class="text-caption-s text-gray-500">Total</dt>
                                    <dd>{{ item.booking.price !== undefined ? formatPrice(item.booking.price) : '-' }}
                                    </dd>
                                </div>
                            </dl>

                            <p v-if="item.booking.roomName" class="mt-3 text-body-xs text-gray-500">
                                {{ [item.booking.roomName, item.booking.board].filter(Boolean).join(' | ') }}
                            </p>

                            <template v-if="isCancelled(item.booking)">
                                <p v-if="item.refund !== undefined || item.fee !== undefined" class="mt-3 text-body-xs">
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
                                        <span v-if="!item.booking.refundable"> It is non-refundable, so you may not get
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
            </section>
        </div>
    </main>
</template>