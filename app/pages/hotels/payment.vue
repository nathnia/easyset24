<script setup lang="ts">
import { useHotelsStore } from '~/stores/hotels'
import { formatPrice, stayFromQuery } from '~/utils/liteapi'
import { cancelText, checkoutKey, formatDate, toPrebook } from '~/utils/booking'
import type { Prebook } from '~/utils/booking'

useHead({ title: 'Payment Details' })

const SDK_URL = 'https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1'

const route = useRoute()
const config = useRuntimeConfig()
const store = useHotelsStore()
const { user } = useAuth()
const { detail } = storeToRefs(store)

const hotelId = computed(() => String(route.query.hotelId ?? ''))
const offerId = computed(() => String(route.query.offerId ?? ''))
const stay = computed(() => stayFromQuery(route.query))
const hotel = computed(() => (detail.value?.id === hotelId.value ? detail.value : null))
// Extra room info (beds, size, photo) only exists if the person came from the Rooms tab
const offer = computed(() => store.rooms.find((o) => o.offerId === offerId.value))

const prebook = ref<Prebook | null>(null)
const loading = ref(true)
const loadError = ref('')
const payError = ref('')
const paying = ref(false)
const sdkReady = ref(false)
let payment: any = null

// shared classes
const field = 'w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-body-xs outline-none placeholder:text-gray-400 focus:border-primary-500'
const card = 'rounded-md bg-white p-4 md:p-6'

const nameFields = [
    { key: 'first', label: 'First name', required: true },
    { key: 'middle', label: 'Middle name', required: false },
    { key: 'last', label: 'Last name', required: true },
] as const

type Key = 'first' | 'middle' | 'last' | 'email' | 'phone'

const [firstGuess = '', ...restGuess] = (user.value?.name ?? '').trim().split(/\s+/)
const { form, errors, validateField, validateAll, onInput, scrollToFirstError } = usePaymentForm<Key>({
    initial: { first: firstGuess, middle: '', last: restGuess.join(' '), email: user.value?.email ?? '', phone: '' },
    rules: {
        first: required('First name is required'),
        last: required('Last name is required'),
        email: validEmail,
    },
})
const remarks = ref('')
const fieldCls = (key: Key) => [field, errors[key] ? 'border-error-light!' : '']

const backLink = computed(() => (hotelId.value ? `/hotels/${hotelId.value}` : '/hotels'))

function loadSdk() {
    return new Promise<void>((resolve, reject) => {
        if ((window as any).LiteAPIPayment) return resolve()
        const s = document.createElement('script')
        s.src = SDK_URL
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Payment form failed to load'))
        document.head.appendChild(s)
    })
}

onBeforeUnmount(() => {
    payment = null
})

// Card box stays locked until the guest details are good
const guestValid = computed(
    () => !!form.first.trim() && !!form.last.trim() && /^\S+@\S+\.\S+$/.test(form.email.trim()),
)

// The SDK redirects away after paying, so keep what /reservation needs to book.
// Saved on every change, so it is always up to date when the person presses Pay.
function saveCheckout() {
    const p = prebook.value
    if (!p) return
    try {
        sessionStorage.setItem(checkoutKey(p.prebookId), JSON.stringify({
            hotelId: hotelId.value,
            adults: stay.value.adults,
            remarks: remarks.value.trim(),
            holder: {
                firstName: [form.first, form.middle].map((v) => v.trim()).filter(Boolean).join(' '),
                lastName: form.last.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
            },
        }))
    } catch { /* storage blocked: the confirm page will say details were lost */ }
}
watch(() => ({ ...form, remarks: remarks.value }), saveCheckout)

// Tailwind resets button styles, so the SDK's own "Pay" button looks like plain text.
// Find it and give it a real button look.
function styleSdkPayButton(root: HTMLElement) {
    const apply = () => {
        root.querySelectorAll<HTMLElement>('button, [role="button"]').forEach((el) => {
            if (el.textContent?.trim().toLowerCase() !== 'pay') return
            el.style.cssText = 'display:block;width:100%;margin-top:16px;padding:12px;border-radius:4px;'
                + 'background:var(--color-primary-500,#07689f);color:#fff;font-weight:600;font-size:16px;'
                + 'text-align:center;cursor:pointer;border:0;'
        })
    }
    apply()
    new MutationObserver(apply).observe(root, { childList: true, subtree: true })
}

// Draws the card form ONE time. The card form has its own Pay button.
let started = false
async function startCardForm(p: Prebook) {
    if (started) return
    started = true
    try {
        await loadSdk()
        const el = document.getElementById('liteapi-payment')
        if (!el) throw new Error('Payment form failed to load. Refresh the page.')
        el.innerHTML = ''
        // We add the ids ourselves so the confirm page never depends on the SDK adding them
        const returnUrl = `${location.origin}/hotels/reservation?pid=${encodeURIComponent(p.prebookId)}&tid=${encodeURIComponent(p.transactionId)}`
        payment = new (window as any).LiteAPIPayment({
            publicKey: config.public.liteapiPaymentEnv,
            secretKey: p.secretKey,
            returnUrl,
            targetElement: '#liteapi-payment',
            appearance: { theme: 'flat' },
            options: { business: { name: 'EasySet24' } },
        })
        await payment.handlePayment()
        styleSdkPayButton(el)
        sdkReady.value = true
    } catch (e: any) {
        payError.value = e?.message || 'Payment form failed to load. Refresh the page.'
    }
}

onMounted(async () => {
    if (!hotelId.value || !offerId.value) {
        loading.value = false
        return
    }
    if (detail.value?.id !== hotelId.value) store.fetchHotel(hotelId.value)

    try {
        const res = await $fetch('/api/prebook', { method: 'POST', body: { offerId: offerId.value } })
        const p = toPrebook(res)
        if (!p.prebookId || !p.transactionId || !p.secretKey) throw new Error('Checkout could not be started.')
        prebook.value = p
    } catch (e: any) {
        loadError.value = e?.data?.statusMessage || e?.statusMessage || e?.message || 'This room is no longer available.'
    } finally {
        loading.value = false
    }
    if (prebook.value) {
        await nextTick()
        saveCheckout()
        await startCardForm(prebook.value)
    }
})
</script>

<template>
    <div class="page-container pb-12">
        <p v-if="!hotelId || !offerId" class="py-10 text-body-s">
            No room selected.
            <NuxtLink :to="backLink" class="text-primary-500 underline">Pick a room first</NuxtLink>
        </p>
        <p v-else-if="loading" class="py-10 text-body-s text-gray-500">Preparing your checkout...</p>
        <div v-else-if="loadError" class="py-10 text-body-s">
            <p class="text-error-light">{{ loadError }}</p>
            <NuxtLink :to="backLink" class="mt-2 inline-block text-primary-500 underline">Back to rooms</NuxtLink>
        </div>

        <div v-else-if="prebook" class="grid gap-6 lg:grid-cols-[5fr_6fr]">
            <div class="flex flex-col gap-6">
                <section :class="card" class="flex flex-col gap-4 sm:flex-row">
                    <img v-if="hotel" :src="hotel.images[0]" :alt="hotel.name"
                        class="h-40 w-full shrink-0 rounded-sm object-cover sm:w-48" />
                    <div class="min-w-0 flex-1">
                        <h1 class="text-h5">{{ hotel?.name ?? 'Your hotel' }}</h1>
                        <p v-if="hotel?.address" class="mt-2 flex items-center gap-1 text-body-xs">
                            <Icon name="icon-park-outline:local" size="16" class="shrink-0 text-primary-500" />
                            {{ hotel.address }}
                        </p>
                        <ul v-if="hotel?.amenities.length" class="mt-4 space-y-2 text-body-xs text-gray-500">
                            <li v-for="a in hotel.amenities.slice(0, 5)" :key="a.label" class="flex items-center gap-3">
                                <Icon :name="a.icon" size="16" />{{ a.label }}
                            </li>
                        </ul>
                    </div>
                </section>

                <section :class="card">
                    <h2 class="text-h6">Your Booking Details</h2>
                    <div class="mt-4 grid grid-cols-2 gap-3">
                        <div class="rounded-l-sm border-l border-primary-400 py-2 pl-3">
                            <p class="text-label-m">Check - In</p>
                            <p class="mt-2 text-body-s">{{ formatDate(stay.checkin) }}</p>
                        </div>
                        <div class="rounded-l-sm border-l border-primary-400 py-2 pl-3">
                            <p class="text-label-m">Check - Out</p>
                            <p class="mt-2 text-body-s">{{ formatDate(stay.checkout) }}</p>
                        </div>
                    </div>
                    <ul class="mt-4 list-disc space-y-1 pl-5 text-body-xs">
                        <li>You will stay {{ stay.nights }} {{ stay.nights === 1 ? 'night' : 'nights' }}</li>
                        <li>{{ prebook.rooms }} {{ prebook.rooms === 1 ? 'room' : 'rooms' }} for {{ stay.adults }} {{
                            stay.adults === 1 ? 'adult' : 'adults' }}</li>
                    </ul>
                </section>

                <section :class="card">
                    <h2 class="text-body-m"><b>The Room :</b> {{ offer?.name ?? prebook.roomName }}</h2>
                    <p v-if="offer && (offer.beds || offer.size)" class="mt-2 text-body-xs text-gray-500">
                        {{ [offer.beds, offer.size].filter(Boolean).join(' | ') }}
                    </p>
                    <p class="mt-2 flex items-center gap-2 text-body-xs">
                        <Icon name="icon-park-outline:cup" size="16" />{{ prebook.board }}
                    </p>
                </section>

                <section :class="card">
                    <h2 class="text-h3">Payment Information</h2>

                    <h3 class="mt-6 border-b border-gray-300 pb-2 text-h5">Your Price Summary</h3>
                    <p class="mt-3 flex items-center justify-between border-b border-gray-300 px-3 py-3 text-label-m">
                        Total Amount For Payment
                        <span class="text-h4 text-success-dark">{{ formatPrice(prebook.price) }}</span>
                    </p>
                    <p class="mt-2 text-body-xxs text-gray-500">
                        {{ prebook.currency }}, {{ stay.nights }} {{ stay.nights === 1 ? 'night' : 'nights' }}. Includes
                        taxes and charges.
                    </p>
                    <p v-if="prebook.priceDifferencePercent" class="mt-2 text-body-xs text-error-light">
                        The price changed by {{ prebook.priceDifferencePercent }}% since you picked this room.
                    </p>
                    <p v-if="prebook.boardChanged" class="mt-2 text-body-xs text-error-light">
                        The meal plan changed since you picked this room. Check it above.
                    </p>

                    <h3 class="mt-8 text-h5">Cancellation Policy</h3>
                    <p v-if="prebook.cancellationChanged" class="mt-2 text-body-xs text-error-light">
                        The cancellation terms changed since you picked this room.
                    </p>
                    <p class="mt-2 flex items-center gap-2 text-label-m"
                        :class="prebook.refundable ? 'text-success-dark' : 'text-error-light'">
                        <Icon :name="prebook.refundable ? 'icon-park-outline:check-one' : 'icon-park-outline:attention'"
                            size="16" />
                        {{ cancelText(prebook) }}
                    </p>
                </section>
            </div>

            <div class="flex flex-col gap-6">
                <section v-if="user" :class="card">
                    <div class="flex items-center gap-3">
                        <img :src="user.avatar" :alt="user.name" class="h-12 w-12 rounded-full object-cover" />
                        <div>
                            <p class="text-label-m">{{ user.name }}</p>
                            <p class="text-body-xs">{{ user.email }}</p>
                        </div>
                    </div>
                </section>

                <section :class="card" class="space-y-4">
                    <h2 class="text-h5">Main Guest</h2>
                    <div>
                        <p class="mb-2 text-label-m">Full Name</p>
                        <div class="grid gap-3 sm:grid-cols-3">
                            <div v-for="n in nameFields" :key="n.key">
                                <label class="relative block">
                                    <input v-model="form[n.key]" type="text" placeholder=" " :class="fieldCls(n.key)"
                                        class="peer" @blur="validateField(n.key)" @input="onInput(n.key)" />
                                    <span
                                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body-xs text-gray-400 peer-not-placeholder-shown:hidden">
                                        {{ n.label }}<span v-if="n.required" class="text-error-light"> *</span>
                                    </span>
                                </label>
                                <p v-if="errors[n.key]" data-error class="mt-1 text-body-xxs text-error-light">{{
                                    errors[n.key] }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2">
                        <label>
                            <span class="mb-1 block text-label-m">Email Address</span>
                            <span class="flex items-center gap-2" :class="fieldCls('email')">
                                <Icon name="icon-park-outline:mail" size="16" class="text-gray-400" />
                                <input v-model="form.email" type="email" placeholder="name@email.com"
                                    class="w-full outline-none" @blur="validateField('email')"
                                    @input="onInput('email')" />
                            </span>
                            <span v-if="errors.email" data-error class="mt-1 block text-body-xxs text-error-light">{{
                                errors.email }}</span>
                        </label>
                        <label>
                            <span class="mb-1 block text-label-m">Phone Number <span
                                    class="text-body-xs font-normal">(Optional)</span></span>
                            <span class="flex items-center gap-2" :class="fieldCls('phone')">
                                <Icon name="icon-park-outline:phone-telephone" size="16" class="text-gray-400" />
                                <input v-model="form.phone" type="tel" placeholder="764378888888"
                                    class="w-full outline-none" @blur="validateField('phone')"
                                    @input="onInput('phone')" />
                            </span>
                            <span v-if="errors.phone" data-error class="mt-1 block text-body-xxs text-error-light">{{
                                errors.phone }}</span>
                        </label>
                    </div>
                </section>

                <section :class="card">
                    <h2 class="text-label-m">Special Requests <span class="text-body-xs font-normal">(Optional)</span>
                    </h2>
                    <p class="mt-2 text-body-xs">Special requests can not be guaranteed, but the property will do its
                        best to meet your needs.</p>
                    <textarea v-model="remarks" rows="4" maxlength="500" :class="field" class="mt-3" />
                </section>

                <section :class="card">
                    <h2 class="text-h5">Pay By Card</h2>
                    <p class="mt-1 text-body-xs text-gray-500">
                        Total {{ formatPrice(prebook.price) }}. Enter your card, then press Pay.
                    </p>
                    <!-- The payment SDK draws the card fields here. Card data never touches our server. -->
                    <div class="relative mt-4">
                        <div id="liteapi-payment" class="min-h-24" />
                        <div v-if="!guestValid"
                            class="absolute inset-0 z-10 flex cursor-not-allowed items-center justify-center bg-white/80 p-4 text-center text-body-s text-gray-500">
                            Fill in your name and email above to unlock payment.
                        </div>
                    </div>
                    <p v-if="!sdkReady && !payError" class="mt-3 text-body-xs text-gray-500">Loading payment form...</p>
                    <p v-if="payError" class="mt-3 text-body-xs text-error-light">{{ payError }}</p>
                </section>
            </div>
        </div>
    </div>
</template>