<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Payment - EasySet24' })

const heroImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80'

const trip = {
    duration: '9: 45h',
    flights: [
        { label: 'First Flight No From Stockholm', code: 'C650', airline: 'Delta Airlines', icon: '' }, // Delta triangle is drawn as SVG
        { label: 'Second Flight No From Rome', code: 'JSG113', airline: 'Turkish Airways', icon: 'simple-icons:turkishairlines' },
    ],
    summary: [
        'Your Flight Take Off From ARN Gate 23A , You Enter Through C Entrance.',
        'In FCO Airport In Rome You Will Stay 3h &45m Then Exit Through Gate D14 .',
        'Final Destination Will Be SABIHA Airport And You Can Exit Through L Door .',
    ],
}

const priceLines = [
    { amount: 87, label: '2 Adults' },
    { amount: 24, label: '3 Children' },
    { amount: 12, label: '1 Infants' },
]
const total = 157

const paymentMethods = [
    { value: 'paypal', label: 'PayPal', icon: 'logos:paypal' },
    { value: 'mastercard', label: 'Mastercard', icon: 'logos:mastercard' },
    { value: 'visa', label: 'Visa', icon: 'logos:visa' },
    { value: 'amex', label: 'Amex', icon: 'logos:amex' },
]
const method = ref('paypal')
const selectedMethod = computed(() => paymentMethods.find(m => m.value === method.value) ?? paymentMethods[0]!)
const bookingForWork = ref(true)

const saved = ref(false)
const paying = ref(false)

type Key = 'firstName' | 'lastName' | 'phone' | 'card' | 'cvc' | 'exp'

const form = reactive<Record<Key, string>>({
    firstName: 'Anna',
    lastName: 'Carinna',
    phone: '764378888888',
    card: '',
    cvc: '',
    exp: '',
})
const errors = reactive<Partial<Record<Key, string>>>({})

const rules: Record<Key, (v: string) => string> = {
    firstName: v => (v.trim() ? '' : 'First name is required'),
    lastName: v => (v.trim() ? '' : 'Last name is required'),
    phone: v => (/^\d{7,15}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid phone number'),
    card: v => (/^\d{13,19}$/.test(v.replace(/\s/g, '')) ? '' : 'Enter a valid card number'),
    cvc: v => (/^\d{3,4}$/.test(v) ? '' : '3-4 digits'),
    exp: (v) => {
        const m = v.match(/^(\d{2})\/(\d{2})$/)
        if (!m) return 'MM/YY'
        const month = Number(m[1])
        const year = 2000 + Number(m[2])
        const now = new Date()
        if (month < 1 || month > 12) return 'Invalid month'
        const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
        return expired ? 'Card expired' : ''
    },
}

function validateField(key: Key) {
    errors[key] = rules[key](form[key])
    return !errors[key]
}
function onInput(key: Key) {

    if (errors[key]) validateField(key)
}

const field = 'h-2 w-full border border-gray-400 bg-white px-2 text-body-xs outline-none placeholder:text-gray-400 focus:border-primary-500'
const fieldCls = (key: Key) => [field, errors[key] ? 'border-error-light!' : '']
const labelCls = (key: Key) => ['text-body-s', errors[key] ? 'text-error-light' : '']

function formatCard() {
    form.card = form.card.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
    onInput('card')
}
function formatExp() {
    const d = form.exp.replace(/\D/g, '').slice(0, 4)
    form.exp = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
    onInput('exp')
}
function formatCvc() {
    form.cvc = form.cvc.replace(/\D/g, '').slice(0, 4)
    onInput('cvc')
}

async function confirmAndPay() {
    if (paying.value) return
    const results = (Object.keys(rules) as Key[]).map(validateField)
    if (!results.every(Boolean)) {
        await nextTick()
        document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
    }
    paying.value = true
    try {
        await navigateTo('/flight-ticket')
        console.log('pay', { ...form, method: method.value, bookingForWork: bookingForWork.value, total })
    }
    finally {
        paying.value = false
    }
}
</script>

<template>
    <section class="bg-gray-50 px-4 py-12">
        <div class="mx-auto grid w-full max-w-306 gap-x-32 gap-y-12 bg-white px-8 py-16 lg:grid-cols-2">
            <div>
                <h1 class="text-h3">Information You Need To Pay Attention .</h1>
                <p class="mt-4 text-h6 font-normal">Passengers Are Divided According To Age Categories .</p>
                <p class="mt-1 text-body-xs">Please Check Categories</p>

                s <div class="mt-10 overflow-hidden rounded-md">
                    <div class="flex h-20 items-center justify-between bg-primary-500 px-3 text-white">
                        <p class="text-label-m">One Stop, 3h Between</p>
                        <p class="text-body-s">Flight Duration <b class="ml-1 text-label-m">{{ trip.duration }}</b></p>
                    </div>
                    <div class="relative h-50 bg-gray-300">
                        <img :src="heroImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
                        <div
                            class="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/90 via-black/60 to-transparent" />
                        <div class="absolute inset-x-0 bottom-0 text-white">
                            <div v-for="f in trip.flights" :key="f.code"
                                class="flex h-10 items-center justify-between border-t border-white/25 px-2">
                                <p class="text-body-s">{{ f.label }} <b class="text-label-m">{{ f.code }}</b></p>
                                <p class="flex w-47.5 items-center gap-2 text-label-m">
                                    <svg v-if="!f.icon" viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true">
                                        <path d="M12 3 22 20H2z" fill="#e01933" />
                                        <path d="M12 10.5 16.5 18h-9z" fill="#fff" />
                                    </svg>
                                    <Icon v-else :name="f.icon" size="20" class="text-[#e81932]" />
                                    {{ f.airline }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="mt-8 text-h5">Your Trip Summary</h2>
                <ul class="mt-4 space-y-3 text-body-s">
                    <li v-for="line in trip.summary" :key="line">{{ line }}</li>
                </ul>

                <div class="mt-8 grid grid-cols-2 gap-6 border-b border-gray-300 pb-2">
                    <details class="group">
                        <summary class="flex cursor-pointer list-none items-center gap-2 text-body-m">
                            <span><b class="text-label-m">Very Good</b> , 2.259 Reviews</span>
                            <Icon name="icon-park-outline:down" size="16"
                                class="transition-transform group-open:rotate-180" />
                        </summary>
                        <p class="mt-2 text-body-xs text-gray-500">More details coming soon.</p>
                    </details>
                    <details class="group">
                        <summary class="flex cursor-pointer list-none items-center gap-2 text-body-m">
                            <Icon name="icon-park-outline:leaf" size="16" class="text-success-dark" />
                            <span>Sustainability Level</span>
                            <Icon name="icon-park-outline:down" size="16"
                                class="transition-transform group-open:rotate-180" />
                        </summary>
                        <p class="mt-2 text-body-xs text-gray-500">More details coming soon.</p>
                    </details>
                </div>
            </div>

            <form novalidate @submit.prevent="confirmAndPay">
                <h2 class="text-h3">Payment Methods And Information</h2>

                <h3 class="mt-12 text-h5">Price Details</h3>
                <div
                    class="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-gray-300 px-5 pb-1 text-body-m">
                    <p v-for="l in priceLines" :key="l.label">
                        <span class="mr-1 text-success-dark">$ {{ l.amount }}</span>{{ l.label }}
                    </p>
                </div>
                <div class="flex items-center justify-between border-b border-gray-300 px-5 py-2">
                    <p class="text-label-m">Total (USD)</p>
                    <p class="text-h5 text-success-dark">$ {{ total }}</p>
                </div>

                <div class="mt-10 flex items-center justify-between gap-4">
                    <label class="flex cursor-pointer items-center gap-4 text-label-m">
                        <input type="radio" :checked="bookingForWork"
                            class="h-6 w-6 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-primary-500 bg-white checked:bg-primary-500 checked:shadow-[inset_0_0_0_4px_#fff]"
                            @click="bookingForWork = !bookingForWork" />
                        Booking For Work
                    </label>
                    <div class="flex items-center gap-3">
                        <label for="method" class="text-label-m">Payment <br />Method</label>
                        <div class="relative">
                            <Icon :name="selectedMethod.icon" size="20"
                                class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2" />
                            <select id="method" v-model="method"
                                class="h-12 w-32.5 appearance-none border border-gray-400 bg-white pl-9 pr-8 text-body-xs">
                                <option v-for="m in paymentMethods" :key="m.value" :value="m.value">{{ m.label }}
                                </option>
                            </select>
                            <Icon name="icon-park-outline:down" size="16"
                                class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                <div class="mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_1.4fr] sm:gap-x-4">
                    <div>
                        <label for="firstName" :class="labelCls('firstName')">First Name <span
                                class="text-error-light">*</span></label>
                        <input id="firstName" v-model="form.firstName" type="text" autocomplete="given-name"
                            :class="fieldCls('firstName')" class="mt-1 text-gray-500" @blur="validateField('firstName')"
                            @input="onInput('firstName')" />
                        <p v-if="errors.firstName" data-error class="mt-1 text-body-xxs text-error-light">{{
                            errors.firstName }}</p>
                    </div>
                    <div>
                        <label for="lastName" :class="labelCls('lastName')">Last Name <span
                                class="text-error-light">*</span></label>
                        <input id="lastName" v-model="form.lastName" type="text" autocomplete="family-name"
                            :class="fieldCls('lastName')" class="mt-1 text-gray-500" @blur="validateField('lastName')"
                            @input="onInput('lastName')" />
                        <p v-if="errors.lastName" data-error class="mt-1 text-body-xxs text-error-light">{{
                            errors.lastName }}</p>
                    </div>
                    <div>
                        <label for="phone" :class="labelCls('phone')">Phone Number <span
                                class="text-error-light">*</span></label>
                        <span class="mt-1 flex items-center gap-2" :class="fieldCls('phone')">
                            <Icon name="circle-flags:se" size="16" class="shrink-0" />
                            <input id="phone" v-model="form.phone" type="tel" autocomplete="tel"
                                class="w-full bg-transparent text-gray-500 outline-none" @blur="validateField('phone')"
                                @input="onInput('phone')" />
                        </span>
                        <p v-if="errors.phone" data-error class="mt-1 text-body-xxs text-error-light">{{ errors.phone }}
                        </p>
                    </div>
                </div>

                <div class="mt-6 grid gap-4 sm:grid-cols-[2fr_1fr_1fr] sm:gap-x-8">
                    <div>
                        <label for="card" :class="labelCls('card')">Card Number <span
                                class="text-error-light">*</span></label>
                        <span class="mt-1 flex items-center gap-2" :class="fieldCls('card')">
                            <Icon name="icon-park-outline:bank-card" size="16" class="shrink-0 text-gray-500" />
                            <input id="card" v-model="form.card" type="text" inputmode="numeric"
                                autocomplete="cc-number" placeholder="0000 0000 0000 0000"
                                class="w-full bg-transparent outline-none placeholder:text-gray-400"
                                @blur="validateField('card')" @input="formatCard" />
                        </span>
                        <p v-if="errors.card" data-error class="mt-1 text-body-xxs text-error-light">{{ errors.card }}
                        </p>
                    </div>
                    <div>
                        <label for="cvc" :class="labelCls('cvc')">CVC <span class="text-error-light">*</span></label>
                        <input id="cvc" v-model="form.cvc" type="text" inputmode="numeric" autocomplete="cc-csc"
                            placeholder="***" :class="fieldCls('cvc')" class="mt-1" @blur="validateField('cvc')"
                            @input="formatCvc" />
                        <p v-if="errors.cvc" data-error class="mt-1 text-body-xxs text-error-light">{{ errors.cvc }}</p>
                    </div>
                    <div>
                        <label for="exp" :class="labelCls('exp')">EXP Date <span
                                class="text-error-light">*</span></label>
                        <input id="exp" v-model="form.exp" type="text" inputmode="numeric" autocomplete="cc-exp"
                            placeholder="**/**" :class="fieldCls('exp')" class="mt-1" @blur="validateField('exp')"
                            @input="formatExp" />
                        <p v-if="errors.exp" data-error class="mt-1 text-body-xxs text-error-light">{{ errors.exp }}</p>
                    </div>
                </div>

                <!-- cancellation -->
                <h3 class="mt-12 text-h5">Cancellation Policy</h3>
                <p class="mt-2 flex flex-wrap items-baseline gap-x-6 text-body-m">
                    Get A Full Refund If You Cancel By Jun 23 (PDT) .
                    <NuxtLink to="/cancellation-policy" class="text-body-xs hover:text-primary-500">Read More ...
                    </NuxtLink>
                </p>

                <!-- actions -->
                <div class="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-x-8">
                    <div>
                        <button type="submit" :disabled="paying"
                            class="h-14 w-full rounded-sm bg-primary-500 text-button-xl text-white hover:bg-primary-600 disabled:opacity-60">
                            Confirm And Pay
                        </button>
                        <p class="mt-1 text-body-xxs text-gray-400">Check your information before submitting .</p>
                    </div>
                    <div>
                        <button type="button" :aria-pressed="saved" @click="saved = !saved"
                            class="flex h-14 w-full items-center justify-center gap-2 rounded-sm border border-primary-500 bg-white text-button-xl text-primary-500 hover:bg-primary-500/5">
                            Save If You Like It
                            <Icon :name="saved ? 'icon-park-solid:like' : 'icon-park-outline:like'" size="20" />
                        </button>
                        <p class="mt-1 text-body-xxs text-gray-400">Save your flight info , find it through Shortcut.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    </section>
</template>