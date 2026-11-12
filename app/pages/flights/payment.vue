<script setup lang="ts">
import { useFlightsStore } from '~/stores/flights'
import { formatDate, formatFlightPrice, formatMinutes } from '~/utils/flights'
import type { DetailLeg } from '~/utils/flights'
import { flightImage, onFlightImgError } from '~/utils/flightImage'
import { toFlightPrebook } from '~/utils/flightBooking'
import type { FlightPrebook } from '~/utils/flightBooking'

useHead({ title: 'Payment Details' })
definePageMeta({ layout: 'checkout' })

const SDK_URL = 'https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1'

const route = useRoute()
const config = useRuntimeConfig()
const flightStore = useFlightsStore()
const { user } = useAuth()
const { detail, detailLoading, detailError } = storeToRefs(flightStore)

// The detail page links here with ?offer=<offerId>&adults=<n>&children=<n>
const offerId = computed(() => (typeof route.query.offer === 'string' ? route.query.offer : ''))
const count = (v: unknown, min: number) => Math.min(9, Math.max(min, Number(typeof v === 'string' ? v : '') || min))
const adults = count(route.query.adults, 1)
const children = count(route.query.children, 0)
const travellers = [
    ...Array.from({ length: adults }, (_, i) => ({ type: 0 as const, label: `Adult ${i + 1}` })),
    ...Array.from({ length: children }, (_, i) => ({ type: 1 as const, label: `Child ${i + 1}` })),
]

const prebook = ref<FlightPrebook | null>(null)
const submitting = ref(false)
const payError = ref('')
const sdkReady = ref(false)
let payment: any = null

// shared classes
const field = 'w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-body-xs outline-none placeholder:text-gray-400 focus:border-primary-500'

const forWork = ref(true)
const showTerms = ref(false)

// ---- validation (dates are checked against the age on the last flight)
const DATE = /^\d{4}-\d{2}-\d{2}$/
const travelDate = () => detail.value?.back?.date || detail.value?.out.date || new Date().toISOString().slice(0, 10)
const ageOn = (birth: string, on: string) => {
    const [by, bm, bd] = birth.split('-').map(Number) as [number, number, number]
    const [y, m, d] = on.split('-').map(Number) as [number, number, number]
    return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0)
}
const birthRule = (type: 0 | 1) => (v: string) => {
    if (!DATE.test(v) || Number.isNaN(Date.parse(v))) return 'Date of birth is required'
    const age = ageOn(v, travelDate())
    if (age < 0) return 'Date of birth is after the travel date'
    if (type === 0 && age < 12) return 'Adults must be 12 or older on the travel date'
    if (type === 1 && (age < 2 || age > 11)) return 'Children must be 2 to 11 on the travel date'
    return ''
}

const k = (i: number, f: string) => `p${i}_${f}`
const [firstGuess = '', ...restGuess] = (user.value?.name ?? '').trim().split(/\s+/)
const initial: Record<string, string> = {
    first: firstGuess, middle: '', last: restGuess.join(' '), email: user.value?.email ?? '', code: '', phone: '',
}
const rules: Record<string, (v: string) => string> = {
    first: required('First name is required'),
    last: required('Last name is required'),
    email: validEmail,
    code: (v) => (/^\d{1,4}$/.test(v.trim()) ? '' : 'Code'),
    phone: validPhone,
}
travellers.forEach((t, i) => {
    for (const f of ['first', 'last', 'birth', 'gender', 'nat']) initial[k(i, f)] = ''
    const own = (rule: (v: string) => string) => (v: string) => (i === 0 ? '' : rule(v))
    rules[k(i, 'first')] = own(required('First name is required'))
    rules[k(i, 'last')] = own(required('Last name is required'))
    rules[k(i, 'birth')] = birthRule(t.type)
    rules[k(i, 'gender')] = required('Select a gender')
    rules[k(i, 'nat')] = (v) => (/^[A-Za-z]{2}$/.test(v.trim()) ? '' : '2-letter code, e.g. SE')
})

const { form, errors, validateField, validateAll, onInput, scrollToFirstError } = usePaymentForm<string>({ initial, rules })
const pf = form as Record<string, any>
const err = errors as Record<string, any>
const fieldCls = (key: string) => [field, errors[key] ? 'border-error-light!' : '']
const phoneError = computed(() => errors.phone || 'Enter the country code')
const onUpper = (key: string) => {
    form[key] = form[key]!.toUpperCase().slice(0, 2)
    onInput(key)
}

// ---- page state
// A held reservation can't be edited: reloading starts a clean checkout
const startOver = () => location.reload()
const shownPrice = computed(() => prebook.value?.price ?? detail.value?.price ?? 0)
const shownCurrency = computed(() => prebook.value?.currency ?? detail.value?.currency ?? 'USD')
const legs = computed(() => [
    { title: 'Outbound', leg: detail.value?.out ?? null },
    { title: 'Return', leg: detail.value?.back ?? null },
].filter((l): l is { title: string; leg: DetailLeg } => !!l.leg))

// ---- left column: photo card + trip summary
const ORDINALS = ['First', 'Second', 'Third', 'Fourth']
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
// "One Stop, 3h Between": the waiting time between two flights of the outbound trip
const stopHeadline = computed(() => {
    const segs = detail.value?.out.segments ?? []
    const waits = segs.slice(1).map((s, i) => (toMin(s.departure) - toMin(segs[i]!.landing) + 1440) % 1440)
    const n = detail.value?.out.stops ?? 0
    if (n === 0) return 'Non-stop'
    const label = n === 1 ? 'One Stop' : `${n} Stops`
    return waits.length === n ? `${label}, ${waits.map(formatMinutes).join(' & ')} Between` : label
})
const mins = (t: string) => (Number(/(\d+)h/.exec(t)?.[1]) || 0) * 60 + (Number(/(\d+)m/.exec(t)?.[1]) || 0)
const flightTime = computed(() => {
    const m = (detail.value?.out.segments ?? []).reduce((a, s) => a + mins(s.duration), 0)
    return m ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}h` : ''
})
const outFlights = computed(() => (detail.value?.out.segments ?? []).map((s, i) => ({
    label: `${ORDINALS[i] ?? `Flight ${i + 1}`} Flight No From ${s.fromName || s.fromCode}`,
    code: s.flightNo,
    airline: s.airline,
    logoUrl: s.logoUrl,
})))
const photoAirline = computed(() => detail.value?.out.segments[0]?.airline ?? 'Airline')
const summary = computed(() => legs.value.map(({ title, leg }) => {
    const f = leg.segments[0]!
    const t = leg.segments[leg.segments.length - 1]!
    let text = `${title === 'Outbound' ? 'Your flight' : 'Your return flight'} takes off from ${f.fromName || f.fromCode} (${f.fromCode}) on ${formatDate(leg.date)} at ${f.departure}.`
    for (const l of leg.layovers) {
        text += ` You change flights at ${l.name || l.code} (${l.code})${l.changeAirport ? ' and you must change airports' : ''}.`
    }
    return `${text} You land at ${t.toName || t.toCode} (${t.toCode}) on ${formatDate(leg.arriveDate)} at ${t.landing}.`
}))

// ---- right column: price rows (amounts only shown when they add up to the verified total)
const priceRows = computed(() => {
    const d = detail.value
    if (!d) return []
    const rows = [{ n: adults, label: adults === 1 ? 'Adult' : 'Adults', unit: d.perPassenger.adult }]
    if (children) rows.push({ n: children, label: children === 1 ? 'Child' : 'Children', unit: d.perPassenger.child })
    const amounts = rows.map((r) => (r.unit == null ? null : Math.round(r.unit * r.n * 100) / 100))
    const sum = amounts.reduce<number>((a, b) => a + (b ?? Number.NaN), 0)
    const match = Number.isFinite(sum) && Math.abs(sum - d.price) < 0.05
    return rows.map((r, i) => ({ ...r, amount: match ? amounts[i] ?? null : null }))
})

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

// Tailwind resets button styles, so the SDK's own "Pay" button looks like plain text.
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
async function startCardForm(p: FlightPrebook) {
    if (started) return
    started = true
    try {
        await loadSdk()
        const el = document.getElementById('liteapi-payment')
        if (!el) throw new Error('Payment form failed to load. Refresh the page.')
        el.innerHTML = ''
        const returnUrl = `${location.origin}/flights/ticket?pid=${encodeURIComponent(p.prebookId)}&tid=${encodeURIComponent(p.transactionId)}`
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

// Step 1: send passengers + contact, the airline holds the seats and we get the card keys
async function continueToPayment() {
    payError.value = ''
    if (!validateAll()) {
        await scrollToFirstError()
        return
    }
    const passengers = travellers.map((t, i) => {
        const v = (f: string) => pf[k(i, f)]!.trim()
        const copy = i === 0
        return {
            passengerType: t.type,
            firstName: copy ? form.first!.trim() : v('first'),
            middleName: copy ? form.middle!.trim() : '',
            lastName: copy ? form.last!.trim() : v('last'),
            birthday: v('birth'),
            gender: v('gender'),
            nationality: v('nat'),
        }
    })
    submitting.value = true
    try {
        const res = await $fetch('/api/flight-prebook', {
            method: 'POST',
            body: {
                offerId: offerId.value,
                contact: {
                    firstName: form.first!.trim(), middleName: form.middle!.trim(), lastName: form.last!.trim(),
                    email: form.email!.trim(), phoneCountryCode: form.code!.trim(), phoneNumber: form.phone!.trim(),
                },
                passengers,
            },
        })
        const p = toFlightPrebook(res)
        if (!p.prebookId || !p.transactionId || !p.secretKey) throw new Error('Checkout could not be started.')
        prebook.value = p
        await nextTick()
        // the card form appears below the passenger fields: bring it into view
        document.getElementById('liteapi-payment')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await startCardForm(p)
    } catch (e: any) {
        payError.value = e?.data?.data?.description || e?.data?.statusMessage || e?.statusMessage || e?.message
            || 'Could not start the checkout. Please try again.'
    } finally {
        submitting.value = false
    }
}

onMounted(async () => {
    // Always re-verify: it fills the page after a refresh and gives the latest price
    if (offerId.value) await flightStore.verify(offerId.value)
})
</script>

<template>
    <div class="page-container pb-12 pt-8 md:pt-10">
        <p v-if="!offerId" class="py-10 text-body-s">
            No flight selected.
            <NuxtLink to="/flights/search" class="text-primary-500 underline">Pick a flight first</NuxtLink>
        </p>
        <p v-else-if="detailLoading || (!detail && !detailError)" class="py-10 text-body-s text-gray-500">
            Preparing your checkout...</p>
        <div v-else-if="detailError" class="py-10 text-body-s">
            <p class="text-error-light">{{ detailError }}</p>
            <NuxtLink to="/flights/search" class="mt-2 inline-block text-primary-500 underline">Back to flights
            </NuxtLink>
        </div>

        <section v-else-if="detail" class=" bg-white p-4 md:p-5 xl:p-6">
            <div class="grid items-stretch gap-x-10 gap-y-8 lg:grid-cols-2 xl:gap-x-24 2xl:gap-x-28">
                <!-- Left: what to know + the flight -->
                <div class="flex h-full min-w-0 flex-col">
                    <h1 class="text-subtitle-l">Information You Need To Pay Attention .</h1>
                    <p class="mt-2 text-body-s">Passengers Are Divided According To Age Categories .</p>
                    <p class="text-body-xxs">Please Check Categories</p>

                    <div class="relative mt-4 aspect-video max-h-48 overflow-hidden rounded-md bg-gray-300">
                        <img :src="flightImage(photoAirline, 700, 420)" alt="" class="h-full w-full object-cover"
                            @error="onFlightImgError($event, photoAirline, 700, 420)" />
                        <div class="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70" />
                        <div class="absolute inset-x-4 top-3 flex items-center justify-between gap-3 text-white">
                            <span class="text-label-m">{{ stopHeadline }}</span>
                            <span v-if="flightTime" class="text-body-xs">Flight Duration <b class="text-label-m">{{
                                flightTime }}</b></span>
                        </div>
                        <div class="absolute inset-x-4 bottom-3 space-y-1 text-white">
                            <p v-for="(f, i) in outFlights" :key="i"
                                class="flex items-center justify-between gap-3 text-body-xs">
                                <span class="min-w-0 truncate">{{ f.label }} <b>{{ f.code }}</b></span>
                                <span class="flex shrink-0 items-center gap-1">
                                    <img v-if="f.logoUrl" :src="f.logoUrl" alt=""
                                        class="h-5 w-5 rounded-full bg-white object-contain" />
                                    {{ f.airline }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <h2 class="mt-4 text-subtitle-l">Your Trip Summary</h2>
                    <p v-for="(t, i) in summary" :key="i" class="mt-2 text-body-xs">{{ t }}</p>

                    <div
                        class="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-gray-300 pt-3 text-body-xs">
                        <span class="flex items-center gap-1"><b>Very Good</b> 2,259 Reviews
                            <Icon name="icon-park-outline:down" size="12" />
                        </span>
                        <span class="flex items-center gap-1">
                            <Icon name="icon-park-outline:tree" size="14" class="text-success-dark" />Sustainability
                            Level
                            <Icon name="icon-park-outline:down" size="12" />
                        </span>
                    </div>
                </div>

                <!-- Right: price, passengers, card -->
                <div class="flex h-full min-w-0 flex-col">
                    <h2 class="text-subtitle-l">Payment Methods And Information</h2>

                    <h3 class="mt-4 text-label-m">Price Details</h3>
                    <ul class="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-body-s">
                        <li v-for="r in priceRows" :key="r.label" class="flex items-center gap-2">
                            <span v-if="r.amount != null" class="text-success-dark">{{ formatFlightPrice(r.amount,
                                detail.currency) }}</span>
                            {{ r.n }} {{ r.label }}
                        </li>
                    </ul>
                    <p class="mt-2 flex items-center justify-between border-y border-gray-300 py-2 text-label-m">
                        Total ({{ shownCurrency }})
                        <span class="text-h6 text-success-dark">{{ formatFlightPrice(shownPrice, shownCurrency)
                        }}</span>
                    </p>
                    <p v-if="detail.priceChange" class="mt-2 text-body-xs text-error-light">
                        The price changed from {{ formatFlightPrice(detail.priceChange.oldPrice, detail.currency) }} to
                        {{ formatFlightPrice(detail.priceChange.newPrice, detail.currency) }} since the search.
                    </p>

                    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <label class="flex items-center gap-2 text-label-m">
                            <input type="radio" :checked="forWork" class="h-4 w-4 accent-primary-500"
                                @click="forWork = !forWork" />Booking For Work
                        </label>
                        <span class="flex items-center gap-3 text-label-m">
                            Payment Method
                            <span
                                class="flex w-24 items-center justify-between rounded-sm border border-gray-300 px-2 py-1.5">
                                <Icon name="logos:visa" size="22" />
                                <Icon name="icon-park-outline:down" size="12" class="text-gray-400" />
                            </span>
                        </span>
                    </div>

                    <!-- Locked once the seats are held: card payment is for exactly these details -->
                    <fieldset :disabled="!!prebook" class="mt-4 min-w-0 space-y-3 border-0 p-0">
                        <div class="grid gap-3 sm:grid-cols-3">
                            <label>
                                <span class="mb-1 block text-caption-s">First Name <span
                                        class="text-error-light">*</span></span>
                                <input v-model="pf.first" type="text" :class="fieldCls('first')"
                                    @blur="validateField('first')" @input="onInput('first')" />
                                <span v-if="err.first" data-error class="mt-1 block text-body-xxs text-error-light">{{
                                    err.first }}</span>
                            </label>
                            <label>
                                <span class="mb-1 block text-caption-s">Last Name <span
                                        class="text-error-light">*</span></span>
                                <input v-model="pf.last" type="text" :class="fieldCls('last')"
                                    @blur="validateField('last')" @input="onInput('last')" />
                                <span v-if="err.last" data-error class="mt-1 block text-body-xxs text-error-light">{{
                                    err.last }}</span>
                            </label>
                            <label>
                                <span class="mb-1 block text-caption-s">Phone Number <span
                                        class="text-error-light">*</span></span>
                                <span class="flex items-center gap-1" :class="fieldCls('phone')">
                                    <span class="text-gray-400">+</span>
                                    <input v-model="pf.code" type="tel" inputmode="numeric" placeholder="46"
                                        maxlength="4" class="w-9 outline-none" @blur="validateField('code')"
                                        @input="onInput('code')" />
                                    <input v-model="pf.phone" type="tel" placeholder="764378888888"
                                        class="w-full min-w-0 outline-none" @blur="validateField('phone')"
                                        @input="onInput('phone')" />
                                </span>
                                <span v-if="err.code || err.phone" data-error
                                    class="mt-1 block text-body-xxs text-error-light">{{ phoneError }}</span>
                            </label>
                        </div>

                        <!-- Required by the airline for every passenger -->
                        <div v-for="(t, i) in travellers" :key="i" class="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <p v-if="i > 0" class="col-span-2 text-label-m md:col-span-4">{{ t.label }}</p>
                            <template v-if="i > 0">
                                <label class="md:col-span-2">
                                    <span class="mb-1 block text-caption-s">First Name <span
                                            class="text-error-light">*</span></span>
                                    <input v-model="pf[k(i, 'first')]" type="text" :class="fieldCls(k(i, 'first'))"
                                        @blur="validateField(k(i, 'first'))" @input="onInput(k(i, 'first'))" />
                                    <span v-if="err[k(i, 'first')]" data-error
                                        class="mt-1 block text-body-xxs text-error-light">{{ err[k(i, 'first')]
                                        }}</span>
                                </label>
                                <label class="md:col-span-2">
                                    <span class="mb-1 block text-caption-s">Last Name <span
                                            class="text-error-light">*</span></span>
                                    <input v-model="pf[k(i, 'last')]" type="text" :class="fieldCls(k(i, 'last'))"
                                        @blur="validateField(k(i, 'last'))" @input="onInput(k(i, 'last'))" />
                                    <span v-if="err[k(i, 'last')]" data-error
                                        class="mt-1 block text-body-xxs text-error-light">{{ err[k(i, 'last')] }}</span>
                                </label>
                            </template>
                            <label v-else class="col-span-2">
                                <span class="mb-1 block text-caption-s">Email <span
                                        class="text-error-light">*</span></span>
                                <input v-model="pf.email" type="email" :class="fieldCls('email')"
                                    @blur="validateField('email')" @input="onInput('email')" />
                                <span v-if="err.email" data-error class="mt-1 block text-body-xxs text-error-light">{{
                                    err.email }}</span>
                            </label>
                            <label class="col-span-2">
                                <span class="mb-1 block text-caption-s">Date Of Birth <span
                                        class="text-error-light">*</span></span>
                                <input v-model="pf[k(i, 'birth')]" type="date" :class="fieldCls(k(i, 'birth'))"
                                    @blur="validateField(k(i, 'birth'))" @input="onInput(k(i, 'birth'))" />
                                <span v-if="err[k(i, 'birth')]" data-error
                                    class="mt-1 block text-body-xxs text-error-light">{{ err[k(i, 'birth')]
                                    }}</span>
                            </label>
                            <label>
                                <span class="mb-1 block text-caption-s">Gender <span
                                        class="text-error-light">*</span></span>
                                <span class="relative block">
                                    <select v-model="pf[k(i, 'gender')]" :class="fieldCls(k(i, 'gender'))"
                                        class="appearance-none pr-10" @change="validateField(k(i, 'gender'))">
                                        <option value="" disabled>Select</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                    <Icon name="icon-park-outline:down" size="14"
                                        class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                </span>
                                <span v-if="err[k(i, 'gender')]" data-error
                                    class="mt-1 block text-body-xxs text-error-light">{{ err[k(i, 'gender')]
                                    }}</span>
                            </label>
                            <label>
                                <span class="mb-1 block text-caption-s">Nationality <span
                                        class="text-error-light">*</span></span>
                                <input v-model="pf[k(i, 'nat')]" type="text" maxlength="2" placeholder="SE"
                                    :class="fieldCls(k(i, 'nat'))" @blur="validateField(k(i, 'nat'))"
                                    @input="onUpper(k(i, 'nat'))" />
                                <span v-if="err[k(i, 'nat')]" data-error
                                    class="mt-1 block text-body-xxs text-error-light">{{ err[k(i, 'nat')]
                                    }}</span>
                            </label>
                        </div>
                    </fieldset>

                    <!-- The payment SDK draws the card fields here. Card data never touches our server. -->
                    <div v-if="prebook" class="mt-3">
                        <div id="liteapi-payment" class="min-h-24" />
                        <p v-if="!sdkReady && !payError" class="mt-3 text-body-xs text-gray-500">Loading payment form...
                        </p>
                        <button type="button" class="mt-2 text-body-xxs text-primary-500 underline"
                            @click="startOver">Change
                            details</button>
                    </div>

                    <h3 class="mt-4 text-h6">Cancellation Policy</h3>
                    <p class="mt-1 text-body-xs">
                        {{ detail.refundable ? 'This fare is refundable.' : 'This fare is non-refundable.' }}
                        {{ detail.changeable ? 'Changes are allowed.' : 'Changes are not allowed.' }}
                        <button v-if="detail.terms.length" type="button"
                            class="inline-flex items-center gap-1 font-bold" @click="showTerms = !showTerms">
                            Read More
                            <Icon name="icon-park-outline:down" size="12" />
                        </button>
                    </p>
                    <ul v-if="showTerms" class="mt-2 list-disc space-y-1 pl-5 text-body-xs">
                        <li v-for="t in detail.terms" :key="t.message">{{ t.message }}</li>
                    </ul>

                    <p v-if="payError" class="mt-4 text-body-xs text-error-light">{{ payError }}</p>
                    <div class="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                            <button v-if="!prebook" type="button" :disabled="submitting"
                                class="w-full rounded-sm bg-primary-500 py-2.5 text-button-m text-white hover:bg-primary-600 disabled:opacity-60"
                                @click="continueToPayment">
                                {{ submitting ? 'Reserving your seats...' : 'Confirm And Pay' }}
                            </button>
                            <p v-else class="rounded-sm bg-gray-100 py-3 text-center text-body-xs">Enter your card
                                above, then press Pay.
                            </p>
                            <p class="mt-1 text-body-xxs text-gray-400">Check Your Information Before Submitting</p>
                        </div>
                        <div>
                            <button type="button"
                                class="flex w-full items-center justify-center gap-2 rounded-sm border border-primary-500 bg-white py-2.5 text-button-m text-primary-500 hover:bg-primary-500 hover:text-white">
                                Save If You Like It
                                <Icon name="icon-park-outline:like" size="14" />
                            </button>
                            <p class="mt-1 text-body-xxs text-gray-400">Save Your Flight Into Your Favourites</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>