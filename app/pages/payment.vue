<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Payment' })

const form = reactive({
    name: '',
    number: '',
    expiry: '',
})

const methods = [
    { name: 'Visa', icon: 'logos:visa' },
    { name: 'American Express', icon: 'logos:amex' },
    { name: 'Mastercard', icon: 'logos:mastercard' },
    { name: 'PayPal', icon: 'logos:paypal' },
]
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSidebar />

            <section class="rounded-md bg-white p-6 lg:p-8">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h1 class="text-h6 text-black">Payment</h1>
                        <p class="mt-3 text-body-xs text-gray-500">
                            Securely Add Or Remove Payment Methods To Make It Easier When You Book.
                        </p>
                    </div>
                    <button type="button"
                        class="text-body-xs text-primary-500 transition-colors hover:text-primary-600">
                        Edit
                    </button>
                </div>

                <h2 class="mt-10 text-h6 text-black">Payment Methods</h2>

                <ul class="mt-4 flex flex-wrap gap-4">
                    <li v-for="method in methods" :key="method.name" class="flex shrink-0 items-center justify-center"
                        style="width:72px;height:24px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:2px;">
                        <Icon :name="method.icon" mode="svg" :aria-label="method.name"
                            style="height:14px;width:auto;max-width:48px;" />
                    </li>
                </ul>

                <div class="mt-8 flex flex-col gap-6" style="width:100%;max-width:337px;">
                    <label class="flex flex-col gap-1.5" style="width:100%;">
                        <span class="text-caption-s text-black">
                            Name On The Card<span class="text-error-light">*</span>
                        </span>
                        <input v-model="form.name" type="text" autocomplete="cc-name"
                            class="text-caption-s outline-none transition-colors focus:border-primary-500"
                            style="display:block;width:100%;height:40px;padding:0 16px;border:1px solid #d1d5db;border-radius:2px;background:#fff;" />
                    </label>

                    <label class="flex flex-col gap-1.5" style="width:100%;">
                        <span class="text-caption-s text-black">
                            Card Number<span class="text-error-light">*</span>
                        </span>
                        <input v-model="form.number" type="text" inputmode="numeric" autocomplete="cc-number"
                            class="text-caption-s outline-none transition-colors focus:border-primary-500"
                            style="display:block;width:100%;height:40px;padding:0 16px;border:1px solid #d1d5db;border-radius:2px;background:#fff;" />
                    </label>

                    <label class="flex flex-col gap-1.5" style="width:138px;">
                        <span class="text-caption-s text-black">
                            Exp Date<span class="text-error-light">*</span>
                        </span>
                        <input v-model="form.expiry" type="text" inputmode="numeric" autocomplete="cc-exp"
                            placeholder="MM/YY"
                            class="text-caption-s outline-none transition-colors placeholder:text-gray-400 focus:border-primary-500"
                            style="display:block;width:138px;height:40px;padding:0 24px;border:1px solid #d1d5db;border-radius:2px;background:#fff;" />
                    </label>
                </div>
            </section>
        </div>
    </main>
</template>