<script setup lang="ts">
import { useHotelsStore } from '~/stores/hotels'
import { bookingKey, cancelText, checkoutKey, formatDate, nightsBetween, toBooking } from '~/utils/booking'
import type { Booking } from '~/utils/booking'
import { formatPrice } from '~/utils/liteapi'

useHead({ title: 'Hotel Reservation' })

const route = useRoute()
const store = useHotelsStore()

const pid = String(route.query.pid ?? '')
const tid = String(route.query.tid ?? '')

const status = ref<'loading' | 'done' | 'error'>('loading')
const error = ref('')
const booking = ref<Booking | null>(null)
let running = false

const hotel = computed(() => (booking.value && store.detail?.id === booking.value.hotelId ? store.detail : null))
const image = computed(() => hotel.value?.images[0] || 'https://picsum.photos/seed/easyset-beach/1600/700')
const nights = computed(() => (booking.value ? nightsBetween(booking.value.checkin, booking.value.checkout) : 0))

const columns = computed(() => {
    const b = booking.value
    if (!b) return []
    return [
        { label: 'Stays', value: `${nights.value} ${nights.value === 1 ? 'Night' : 'Nights'}` },
        { label: 'Check-In', value: formatDate(b.checkin), icon: 'icon-park-outline:calendar' },
        { label: 'Check-Out', value: formatDate(b.checkout), icon: 'icon-park-outline:calendar' },
        { label: 'Quantity', value: `${b.rooms} ${b.rooms === 1 ? 'Room' : 'Rooms'}` },
        { label: 'Room Type', value: b.roomName || '-' },
        { label: 'Meal Plan', value: b.board || '-' },
    ]
})
const cols = 'grid grid-cols-[1.1fr_1fr_1fr_0.65fr_0.75fr_0.85fr]'

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

        // Already booked (page refresh): show it, never book twice
        const saved = sessionStorage.getItem(bookingKey(pid))
        if (saved) {
            booking.value = JSON.parse(saved)
        } else {
            const raw = sessionStorage.getItem(checkoutKey(pid))
            if (!raw) throw new Error('Your checkout details were lost.')
            const info = JSON.parse(raw)
            const res = await $fetch('/api/book', {
                method: 'POST',
                body: { prebookId: pid, transactionId: tid, holder: info.holder, adults: info.adults, remarks: info.remarks },
            })
            const b = toBooking(res)
            if (!b.bookingId) throw new Error('The booking was not confirmed.')
            b.hotelId ||= info.hotelId
            booking.value = b
            sessionStorage.setItem(bookingKey(pid), JSON.stringify(b))
            sessionStorage.removeItem(checkoutKey(pid))
        }
        status.value = 'done'
        if (booking.value?.hotelId && store.detail?.id !== booking.value.hotelId) store.fetchHotel(booking.value.hotelId)
    } catch (e: any) {
        error.value = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Booking failed.'
        status.value = 'error'
    } finally {
        running = false
    }
}

onMounted(run)
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
                <NuxtLink to="/hotels"
                    class="rounded-sm border border-primary-500 px-6 py-3 text-button-l text-primary-500">
                    Back to hotels
                </NuxtLink>
            </div>
        </section>

        <section v-else-if="booking" class="rounded-md bg-white p-4 md:p-6">
            <h1 class="flex flex-wrap items-baseline gap-x-3 text-h4">
                Your Hotel Reservation
                <span class="text-h2 text-primary-500">{{ booking.status === 'CONFIRMED' ? 'Confirmed' : booking.status
                    || 'Received' }}</span>
            </h1>
            <p class="mt-1 text-body-m">
                Contact EasySet24 If You Need To Change In Basic Information With
                <b>{{ booking.bookingId }}</b> Booking Number.
            </p>

            <div class="mt-10 rounded-md border border-gray-300 bg-gray-100 p-4 md:p-6 xl:max-w-250">
                <div class="relative h-72 overflow-hidden bg-gray-300 md:h-82.5">
                    <img :src="image" alt="" class="h-full w-full object-cover" />
                    <div class="absolute inset-0 bg-linear-to-b from-white/50 via-transparent to-black/80" />

                    <div class="absolute left-5 top-5">
                        <h2 class="text-h4">Booking No. {{ booking.bookingId }} Details</h2>
                        <p class="mt-2 text-body-m">Check Your Information Here !</p>
                    </div>

                    <div class="absolute inset-x-5 bottom-3 text-white">
                        <h3 class="text-h5">{{ booking.hotelName || hotel?.name }}</h3>
                        <div class="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
                            <p v-if="booking.confirmationCode" class="text-body-m">
                                Hotel Confirmation Code: <b>{{ booking.confirmationCode }}</b>
                            </p>
                            <p class="text-button-s md:text-label-xs">Secure By EasySet24 Policy</p>
                        </div>
                    </div>
                </div>

                <div class="mt-1 overflow-x-auto">
                    <div class="min-w-180">
                        <div :class="cols" class="gap-px bg-white">
                            <div v-for="c in columns" :key="c.label"
                                class="flex h-16 items-center justify-center gap-3 bg-gray-400 px-2 text-center text-h5 text-white">
                                <Icon v-if="c.icon" :name="c.icon" size="30" class="shrink-0" />
                                {{ c.label }}
                            </div>
                        </div>
                        <div :class="cols" class="mt-px gap-px">
                            <div v-for="c in columns" :key="c.label"
                                class="flex min-h-16 items-center justify-center border border-gray-300 bg-white px-2 text-center text-label-m">
                                {{ c.value }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-2 text-body-m">
                    <p class="font-bold">Adults {{ booking.adults }} ,Children {{ booking.children }}</p>
                    <p><b>Guest</b> <span class="ml-1">{{ booking.holder }}</span></p>
                    <p v-if="booking.price !== undefined"><b>Total Paid</b>
                        <span class="ml-1">{{ formatPrice(booking.price) }}</span>
                    </p>
                </div>
            </div>

            <div class="mt-10">
                <h2 class="text-h4">Cancelation Policy</h2>
                <p class="mt-3 text-body-m" :class="booking.refundable ? 'text-success-dark' : 'text-error-light'">
                    {{ cancelText(booking) }}
                </p>
                <p v-for="r in booking.hotelRemarks" :key="r" class="mt-3 max-w-280 text-body-m">{{ r }}</p>
            </div>
        </section>
    </div>
</template>