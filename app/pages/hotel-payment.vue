<script setup lang="ts">
useHead({ title: 'Payment Details - EasySet24' })

const photo = (n: number) => `https://picsum.photos/seed/easyset-pay-${n}/200/160`

const location = ['0 m to City Centre', '24 km to Landvetter Airport', '2,5 km to Liseberg Amusment Park', '0 m to Gothenburg Central Station']
const facilities = [
    { icon: 'icon-park-outline:cup', label: 'Breakfast Included' },
    { icon: 'icon-park-outline:wifi', label: 'Free Wi-Fi' },
    { icon: 'icon-park-outline:parking', label: 'Free Parking' },
    { icon: 'icon-park-outline:dog', label: 'Pets Are Welcome' },
    { icon: 'icon-park-outline:washing-machine', label: 'Free Laundry Service' },
    { icon: 'icon-park-outline:close-one', label: 'No Smoking' },
    { icon: 'icon-park-outline:run-left', label: 'Free Entrance Exercise Centre' },
]
const stay = ['You Will Stay 4 Nights', 'You Selected 2 Rooms For :', '2 Adults', '3 Children (12 ,7 And 5 Years Old)', '0 Infant']
const roomTags = [
    { icon: 'icon-park-outline:ruler', label: '18 M²' },
    { icon: 'icon-park-outline:local', label: 'City Center' },
    { icon: 'icon-park-outline:tree', label: 'Next To Forest' },
    { icon: 'icon-park-outline:shower-head', label: 'En-Suite Bath Room' },
    { icon: 'icon-park-outline:tv', label: 'Flat-Screen TV' },
]

const originalPrice = 960
const discount = 100
const total = originalPrice - discount

const bookingFor = ref('other')
const payLater = ref(true)
const forWork = ref(true)

// shared classes
const field = 'w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-body-xs outline-none placeholder:text-gray-400 focus:border-primary-500'
const card = 'rounded-md bg-white p-4 md:p-6'
const check = 'h-4 w-4 accent-primary-500'

const nameFields = [
    { key: 'first', label: 'First name', required: true },
    { key: 'middle', label: 'Middle name', required: false },
    { key: 'last', label: 'Last name', required: true },
] as const
const tagRows = [roomTags.slice(0, 3), roomTags.slice(3)]

type Key = 'first' | 'middle' | 'last' | 'email' | 'phone' | 'country' | 'cardName' | 'cardNumber' | 'exp' | 'cvc'

const form = reactive<Record<Key, string>>({
    first: '', middle: '', last: '', email: '', phone: '', country: '',
    cardName: '', cardNumber: '', exp: '', cvc: '',
})
const errors = reactive<Partial<Record<Key, string>>>({})

const rules: Partial<Record<Key, (v: string) => string>> = {
    first: v => (v.trim() ? '' : 'First name is required'),
    last: v => (v.trim() ? '' : 'Last name is required'),
    email: v => (!v.trim() ? 'Email is required' : /^\S+@\S+\.\S+$/.test(v) ? '' : 'Enter a valid email'),
    phone: v => (/^\d{7,15}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid phone number'),
    country: v => (v ? '' : 'Country is required'),
    cardName: v => (v.trim() ? '' : 'Name on the card is required'),
    cardNumber: v => (/^\d{13,19}$/.test(v.replace(/\s/g, '')) ? '' : 'Enter a valid card number'),
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
    cvc: v => (/^\d{3,4}$/.test(v) ? '' : '3-4 digits'),
}

function validateField(key: Key) {
    errors[key] = rules[key]?.(form[key]) ?? ''
    return !errors[key]
}
function onInput(key: Key) {
    if (errors[key]) validateField(key)
}
const fieldCls = (key: Key) => [field, errors[key] ? 'border-error-light!' : '']

function formatCard() {
    form.cardNumber = form.cardNumber.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
    onInput('cardNumber')
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

async function submit() {
    const results = (Object.keys(rules) as Key[]).map(validateField)
    if (results.every(Boolean)) {
        await navigateTo('/hotel-reservation')
        return
    }
    await nextTick()
    document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
    <div class="page-container grid gap-6 pb-12 lg:grid-cols-[5fr_6fr]">
        <div class="flex flex-col justify-between gap-6">
            <section :class="card" class="flex gap-4">
                <div class="flex w-28 shrink-0 flex-col gap-2 sm:w-32">
                    <img v-for="n in 3" :key="n" :src="photo(n)" alt="" class="h-24 w-full rounded-sm object-cover" />
                    <div class="relative h-24 overflow-hidden rounded-sm">
                        <img :src="photo(4)" alt="" class="h-full w-full object-cover" />
                        <span class="absolute inset-0 flex items-end bg-black/50 p-1.5 text-[10px] text-white">See More
                            Photos</span>
                    </div>
                </div>

                <div class="min-w-0 flex-1">
                    <h1 class="text-h5">First Hotel G</h1>
                    <p class="text-body-xxs">Modern Hotel at Gothenburg Central Station</p>
                    <p class="mt-2 flex items-center gap-1 text-body-xs">
                        More Than 4,325 Review
                        <Icon name="icon-park-outline:down" size="12" />
                        <span
                            class="ml-auto rounded-sm border border-primary-500 px-1 text-button-s text-primary-500">9,2</span>
                    </p>
                    <div class="mt-1 h-1 rounded-full bg-gray-300">
                        <div class="h-full w-[92%] rounded-full bg-primary-500" />
                    </div>

                    <h2 class="mt-4 flex items-center gap-1 text-label-m">
                        <Icon name="icon-park-outline:local" size="16" class="text-primary-500" />
                        Location Information
                    </h2>
                    <ul class="mt-1 list-disc space-y-1 pl-6 text-body-xxs">
                        <li v-for="l in location" :key="l">{{ l }}</li>
                    </ul>

                    <ul class="mt-4 space-y-3 text-body-xs text-gray-500">
                        <li v-for="f in facilities" :key="f.label" class="flex items-center gap-3">
                            <Icon :name="f.icon" size="16" />{{ f.label }}
                        </li>
                    </ul>
                </div>
            </section>

            <section :class="card">
                <h2 class="text-h6">Your Booking Deteiels</h2>
                <div class="mt-4 grid grid-cols-2 gap-3">
                    <div class="rounded-l-sm border-l border-primary-400 py-2 pl-3">
                        <p class="text-label-m">Check - In</p>
                        <p class="mt-2 text-body-s">2 August 2023</p>
                    </div>
                    <div class="rounded-l-sm border-l border-primary-400 py-2 pl-3">
                        <p class="text-label-m">Check -Out</p>
                        <p class="mt-2 text-body-s">6 August 2023</p>
                    </div>
                </div>
                <ul class="mt-4 list-disc space-y-1 pl-5 text-body-xs">
                    <li v-for="s in stay" :key="s">{{ s }}</li>
                </ul>
            </section>

            <section :class="card">
                <h2 class="text-body-m"><b>The Room :</b> Superior Twin Room</h2>
                <p class="mt-3 flex items-center gap-2 text-body-s">
                    <Icon name="icon-park-outline:plus" size="14" />
                    <b class="text-label-m">Guest Number</b> 2 Adult
                </p>
                <p class="mt-2 flex items-center gap-2 text-body-xs">
                    <Icon name="icon-park-outline:handwashing" size="16" />
                    Cleanliness Rooms Rate
                    <span class="rounded-sm border border-primary-500 px-1 text-button-s text-primary-500">8,9</span>
                </p>
                <div class="mt-4 space-y-3">
                    <div v-for="(row, i) in tagRows" :key="i" class="grid gap-3"
                        :class="i === 0 ? 'grid-cols-3' : 'grid-cols-2'">
                        <span v-for="t in row" :key="t.label"
                            class="flex items-center justify-center gap-2 rounded-sm border border-success-dark bg-success-light px-2 py-2 text-center text-body-s">
                            <Icon :name="t.icon" size="18" class="shrink-0" />{{ t.label }}
                        </span>
                    </div>
                </div>
            </section>

            <section :class="card">
                <h2 class="text-h3">Payment Information</h2>

                <h3 class="mt-6 border-b border-gray-300 pb-2 text-h5">Your Price Summary</h3>
                <p class="flex items-baseline justify-between border-b border-gray-300 py-3 text-body-s">
                    <b class="text-label-m">Original Price</b>
                    <span><b class="text-label-m">${{ originalPrice }}</b> <b class="text-label-s text-gray-500">4
                            Nights</b></span>
                </p>
                <p class="flex items-baseline justify-between border-b border-gray-300 py-3 text-body-xs">
                    EasySet24 Loyalty Discount 4 %
                    <span><span class="text-error-light">${{ discount }}</span> <span
                            class="text-gray-500">Discount</span></span>
                </p>
                <p class="mt-3 flex items-center justify-between border-b border-gray-300 px-3 py-3 text-label-m">
                    Total Amount For Payment
                    <span class="text-h4 text-success-dark">${{ total }}</span>
                </p>

                <h3 class="mt-8 text-h5">Cancellation Policy</h3>
                <p class="mt-2 flex items-center gap-2 text-label-m">
                    <Icon name="icon-park-outline:check" size="16" />Free Cancellation
                </p>
                <p class="mt-1 text-body-xs">Cancel /Rebook No Later Than 24 Hours Before, Otherwise You Pay 80% Of The
                    Cost.</p>

                <div class="mt-8 flex items-center justify-between">
                    <h3 class="text-h5">Pay Part Now, Part Later</h3>
                    <input type="radio" :checked="payLater" class="h-5 w-5 accent-primary-500"
                        @click="payLater = !payLater" />
                </div>
                <p class="mt-2 text-body-xs">
                    Pay $ 200 Now, And The Rest ($6,60) Will Be Automatically Charged To The Same Payment Method On
                    August 27, 2023. No Extra Fees.
                </p>
            </section>

            <section :class="card">
                <h2 class="text-h5">Payment Methods</h2>
                <div class="mt-3 flex items-center justify-between">
                    <label class="flex items-center gap-3 text-label-m">
                        Payment Method
                        <span
                            class="flex w-28 items-center justify-between rounded-sm border border-gray-300 px-2 py-1.5">
                            <Icon name="logos:paypal" size="16" />
                            <Icon name="icon-park-outline:down" size="12" class="text-gray-400" />
                        </span>
                    </label>
                    <label class="flex items-center gap-3 text-label-m">
                        Booking For Work
                        <input type="radio" :checked="forWork" class="h-5 w-5 accent-primary-500"
                            @click="forWork = !forWork" />
                    </label>
                </div>
            </section>
        </div>

        <div class="flex flex-col justify-between gap-6">
            <section :class="card">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <img src="https://i.pravatar.cc/100?img=47" alt="Anna Carinna"
                            class="h-12 w-12 rounded-full object-cover" />
                        <div>
                            <p class="text-label-m">Anna Carinna</p>
                            <p class="text-body-xs">Easyset24@Gmail.Com</p>
                        </div>
                    </div>
                    <NuxtLink to="#"
                        class="flex items-center gap-2 rounded-sm border border-primary-500 px-4 py-2 text-button-m text-primary-500 hover:bg-primary-500 hover:text-white">
                        Check Your Booking History
                        <Icon name="icon-park-outline:right" size="14" />
                    </NuxtLink>
                </div>

                <div class="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2">
                    <p class="text-label-m">Who Are You Booking For?</p>
                    <label class="flex items-center gap-2 text-body-xxs">
                        <input v-model="bookingFor" type="radio" value="me" class="accent-primary-500" />I Am The Main
                        Guest
                    </label>
                    <label class="flex items-center gap-2 text-body-xxs">
                        <input v-model="bookingFor" type="radio" value="other" class="accent-primary-500" />Booking Is
                        For Someone Else
                    </label>
                </div>

                <h2 class="mt-6 text-h5">Enter Your Information</h2>
                <p class="mt-2 text-body-xs">Make Sure The Information That You Have Already Written In Yoy Profile Is
                    Correct.</p>
                <NuxtLink to="#" class="mt-2 flex items-center justify-end gap-1 text-body-xs text-primary-500">
                    <Icon name="icon-park-outline:edit" size="14" />Edit Profile
                </NuxtLink>
            </section>

            <section :class="card" class="space-y-4">
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
                            <input v-model="form.email" type="email" placeholder="..........."
                                class="w-full outline-none" @blur="validateField('email')" @input="onInput('email')" />
                        </span>
                        <span v-if="errors.email" data-error class="mt-1 block text-body-xxs text-error-light">{{
                            errors.email }}</span>
                    </label>
                    <label>
                        <span class="mb-1 block text-label-m">Phone Number</span>
                        <span class="flex items-center gap-2" :class="fieldCls('phone')">
                            <Icon name="circle-flags:se" size="16" />
                            <input v-model="form.phone" type="tel" placeholder="764378888888"
                                class="w-full outline-none" @blur="validateField('phone')" @input="onInput('phone')" />
                        </span>
                        <span v-if="errors.phone" data-error class="mt-1 block text-body-xxs text-error-light">{{
                            errors.phone }}</span>
                    </label>
                </div>

                <div>
                    <p class="text-label-m">If You Need Assistance</p>
                    <p class="text-body-xxs">Choose An Option Based On Physical Disability Accordingly.</p>
                    <div class="mt-2 grid gap-3 sm:grid-cols-2">
                        <label>
                            <span class="mb-1 block text-caption-s">Chose An Option</span>
                            <select :class="field">
                                <option>Not Provided</option>
                            </select>
                        </label>
                        <label>
                            <span class="mb-1 block text-caption-s">Region /Country</span>
                            <span class="relative block">
                                <select v-model="form.country"
                                    :class="[fieldCls('country'), form.country ? '' : 'text-transparent']"
                                    @change="validateField('country')">
                                    <option value="" disabled class="text-black">Country</option>
                                    <option value="Sweden" class="text-black">Sweden</option>
                                </select>
                                <span v-if="!form.country"
                                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body-xs text-gray-400">
                                    Country<span class="text-error-light"> *</span>
                                </span>
                            </span>
                            <span v-if="errors.country" data-error class="mt-1 block text-body-xxs text-error-light">{{
                                errors.country }}</span>
                        </label>
                    </div>
                </div>
            </section>

            <section :class="card" class="space-y-5">
                <h2 class="text-h5">Add To Your Stay</h2>

                <div>
                    <label class="flex items-center gap-3 text-label-m">
                        <input type="checkbox" :class="check" />I Will Need A Flight For My Trip
                    </label>
                    <p class="mt-2 flex items-center gap-2 pl-7 text-body-xxs">
                        <Icon name="icon-park-outline:airplane" size="14" />20% Special Offer If You Book A Flight
                    </p>
                    <p class="mt-2 pl-7 text-body-xs">Flexible Flight Options From Stockholm To Turkiye From SLK
                        766/Round Trip. Fnnish Booking</p>
                    <p class="mt-1 pl-7 text-body-xs">This Stay To Get Flight Recommendations That Match Your Selected
                        Dates.</p>
                </div>

                <div>
                    <label class="flex items-center gap-3 text-label-m">
                        <input type="checkbox" :class="check" />Want To Book A Taxi Or Shuttle Ride In Advance?
                    </label>
                    <p class="mt-2 flex items-center gap-2 pl-7 text-body-xxs">
                        <Icon name="icon-park-outline:taxi" size="14" />10% Special Offer If You Rent A Taxi
                    </p>
                    <p class="mt-2 pl-7 text-body-xs">Avoid Surprises_ Get From The Airport To Your Accommodation
                        Without A Hitch.</p>
                    <p class="mt-1 pl-7 text-body-xs">We Will Add Taxi Options To Your Booking Confirmation.</p>
                </div>

                <div>
                    <h3 class="text-label-m">Special Requests</h3>
                    <p class="mt-2 text-body-xs">Special Requests Can Not Be Guaranteed _ But The Property Will Do Its
                        Best To Meet Your Needs.</p>
                    <p class="mt-2 text-body-xs">You Can Always Make A Special Request After Your Booking Is Complete!
                    </p>
                    <p class="mt-2 text-body-xxs">(Optional)</p>
                    <div class="relative">
                        <textarea rows="4" :class="field" />
                        <Icon name="icon-park-outline:edit" size="14"
                            class="pointer-events-none absolute left-2 top-2 text-gray-400" />
                    </div>
                    <label class="mt-3 flex items-center gap-3 text-body-xs">
                        <input type="checkbox" :class="check" />I Would Like Rooms Close To Each Other
                    </label>
                </div>

                <div>
                    <h3 class="text-label-m">Your Arrival Time</h3>
                    <ul class="mt-2 space-y-2 text-body-xs">
                        <li class="flex items-center gap-2">
                            <Icon name="icon-park-outline:check-one" size="16" />Your Rooms Will Be Ready For Check_in
                            Between 15:00 And 23:00
                        </li>
                        <li class="flex items-center gap-2">
                            <Icon name="icon-park-outline:history" size="16" />24-Huor Front Desk_Help Wherever You Need
                            It!
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 class="text-label-m">Add Your Estimated Arrival Time <span
                            class="text-body-xs font-normal">(Optional)</span></h3>
                    <select :class="field" class="mt-2 max-w-48">
                        <option>Please Select</option>
                    </select>
                    <p class="mt-1 text-body-xxs">Time for <b>CET</b> time zone</p>
                </div>
            </section>

            <section :class="card">
                <h2 class="text-h5">Bank Card Information</h2>
                <div class="mt-4 grid grid-cols-[1fr_1.4fr_72px_72px] gap-3">
                    <label>
                        <span class="mb-1 block text-caption-s">Full Name On The Card</span>
                        <input v-model="form.cardName" type="text" placeholder="Anna Carina"
                            :class="fieldCls('cardName')" @blur="validateField('cardName')"
                            @input="onInput('cardName')" />
                        <span v-if="errors.cardName" data-error class="mt-1 block text-body-xxs text-error-light">{{
                            errors.cardName }}</span>
                    </label>
                    <label>
                        <span class="mb-1 block text-caption-s">Card Number</span>
                        <span class="flex items-center gap-2" :class="fieldCls('cardNumber')">
                            <Icon name="icon-park-outline:bank-card" size="16" class="text-gray-400" />
                            <input v-model="form.cardNumber" type="text" inputmode="numeric"
                                placeholder="................" class="w-full outline-none"
                                @blur="validateField('cardNumber')" @input="formatCard" />
                        </span>
                        <span v-if="errors.cardNumber" data-error class="mt-1 block text-body-xxs text-error-light">{{
                            errors.cardNumber }}</span>
                    </label>
                    <label>
                        <span class="mb-1 block text-caption-s">EXP Date</span>
                        <input v-model="form.exp" type="text" inputmode="numeric" placeholder="**/**"
                            :class="fieldCls('exp')" @blur="validateField('exp')" @input="formatExp" />
                        <span v-if="errors.exp" data-error class="mt-1 block text-body-xxs text-error-light">{{
                            errors.exp }}</span>
                    </label>
                    <label>
                        <span class="mb-1 block text-caption-s">CVC</span>
                        <input v-model="form.cvc" type="text" inputmode="numeric" placeholder="***"
                            :class="fieldCls('cvc')" @blur="validateField('cvc')" @input="formatCvc" />
                        <span v-if="errors.cvc" data-error class="mt-1 block text-body-xxs text-error-light">{{
                            errors.cvc }}</span>
                    </label>
                </div>

                <div class="mt-6 grid gap-3 sm:grid-cols-2">
                    <button type="button"
                        class="flex items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white py-3 text-button-m text-primary-500 hover:border-primary-500">
                        Save In Shortcut
                        <Icon name="icon-park-outline:like" size="14" />
                    </button>
                    <button type="button"
                        class="rounded-sm bg-primary-500 py-3 text-button-l text-white hover:bg-primary-600"
                        @click="submit">
                        Payment
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>