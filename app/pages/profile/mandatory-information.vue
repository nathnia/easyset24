<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Provide Mandatory Information' })

const form = reactive({
    firstName: 'Anna',
    lastName: 'Carinna',
    phone: '220202222',
    code: '',
})
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSidebar />

            <form class="rounded-md bg-white p-6 lg:p-8" @submit.prevent>
                <div class="flex items-center gap-6">
                    <svg class="size-12 shrink-0 text-[#f5c400]" viewBox="0 0 48 48" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linejoin="round" aria-hidden="true">
                        <path d="M24 4 L46 43 H2 Z" />
                        <path d="M24 17 V30" stroke-linecap="round" />
                        <circle cx="24" cy="36" r="1.2" fill="currentColor" />
                    </svg>
                    <h1 class="text-h4 text-black">Provide Mandatory Information</h1>
                </div>

                <div class="mt-8 grid w-fit grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-[124px_104px_160px]">
                    <label class="block">
                        <span class="text-body-s text-black">First Name <span class="text-error-light">*</span></span>
                        <input v-model="form.firstName" type="text"
                            class="mt-1 h-12 w-full rounded-sm border border-gray-400 bg-white px-2 text-body-xs outline-none transition-colors focus:border-primary-500" />
                    </label>

                    <label class="block">
                        <span class="text-body-s text-black">Last Name <span class="text-error-light">*</span></span>
                        <input v-model="form.lastName" type="text"
                            class="mt-1 h-12 w-full rounded-sm border border-gray-400 bg-white px-2 text-body-xs outline-none transition-colors focus:border-primary-500" />
                    </label>

                    <label class="block">
                        <span class="text-body-s text-black">Phone Number <span class="text-error-light">*</span></span>
                        <div
                            class="mt-1 flex h-12 items-center gap-2 rounded-sm border border-gray-400 bg-white px-2 transition-colors focus-within:border-primary-500">
                            <Icon name="circle-flags:se" size="16" class="shrink-0" />
                            <input v-model="form.phone" type="tel" inputmode="numeric"
                                class="w-full bg-transparent text-body-xs outline-none" />
                        </div>
                    </label>

                    <div class="text-primary-500 sm:col-span-2 sm:self-end">
                        <p class="text-body-s">Pay Attention</p>
                        <p class="mt-1 max-w-55 text-body-xs">Insert the code that was sent to your Phone Number.
                        </p>
                    </div>

                    <label class="block">
                        <span class="text-body-s text-black">Insert The Code <span
                                class="text-error-light">*</span></span>
                        <input v-model="form.code" type="text" inputmode="numeric" placeholder="••••••"
                            class="mt-1 h-12 w-full rounded-sm border border-gray-400 bg-white px-2 text-body-xs tracking-widest outline-none transition-colors placeholder:text-gray-400 focus:border-primary-500" />
                    </label>
                </div>

                <div class="mt-10 flex w-full max-w-109 justify-center">
                    <button type="submit"
                        class="h-12 w-full max-w-57.5 rounded-sm bg-primary-500 text-button-xl text-white transition-colors hover:bg-primary-600">
                        Save
                    </button>
                </div>
            </form>
        </div>
    </main>
</template>