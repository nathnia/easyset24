<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Preferences' })

const currency = ref('U.S Dollar')
const currencies = ['U.S Dollar', 'Euro', 'British Pound']
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSidebar />

            <section class="rounded-md bg-white p-6 lg:p-8">
                <h1 class="text-h6 text-black">Preferences</h1>
                <p class="mt-3 text-body-xs text-gray-500">
                    Change Your Language, Currency, And Accessibility Requirements.
                </p>

                <div class="mt-8 space-y-8">
                    <div class="grid grid-cols-1 items-center gap-3 md:grid-cols-[165px_1fr_100px]">
                        <h2 class="text-h6 text-black">Currency</h2>

                        <div class="relative h-10 w-full max-w-61 rounded-sm border border-primary-400 bg-white">
                            <Icon name="icon-park-outline:dollar" size="16"
                                class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-primary-400" />
                            <select v-model="currency"
                                class="h-full w-full appearance-none bg-transparent pl-9 pr-8 text-body-xs text-primary-500 outline-none">
                                <option v-for="item in currencies" :key="item" :value="item">{{ item }}</option>
                            </select>
                            <span
                                class="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 flex-col text-primary-400">
                                <Icon name="icon-park-outline:up" size="10" />
                                <Icon name="icon-park-outline:down" size="10" />
                            </span>
                        </div>

                        <button type="button"
                            class="text-left text-body-xs text-primary-500 transition-colors hover:text-primary-600">
                            Edit
                        </button>
                    </div>

                    <div class="grid grid-cols-1 items-center gap-3 md:grid-cols-[165px_1fr_100px]">
                        <h2 class="text-h6 text-black">Language</h2>

                        <div class="flex items-center gap-2">
                            <span class="flex h-10 w-10 items-center justify-center rounded-sm bg-gray-200">
                                <Icon name="circle-flags:gb" size="28" />
                            </span>
                            <span class="text-body-xs text-black">United Kingdom English</span>
                        </div>

                        <button type="button"
                            class="text-left text-body-xs text-primary-500 transition-colors hover:text-primary-600">
                            Edit
                        </button>
                    </div>

                    <div class="grid grid-cols-1 items-center gap-3 md:grid-cols-[165px_1fr_100px]">
                        <h2 class="text-h6 text-black">Accessibility Requirements</h2>

                        <p class="text-body-xs text-black">Filter Out Properties That Don’t Meet Your Needs</p>

                        <button type="button"
                            class="text-left text-body-xs text-primary-500 transition-colors hover:text-primary-600">
                            Edit
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </main>
</template>