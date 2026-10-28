<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Input PIN - EasySet24' })

const IMAGE_SRC = 'https://unsplash.com/photos/iCQ9vAECrxM/download?force=true&w=1000'

const code = ref('')
const types = reactive({ hotel: true, flight: false })

const typeOptions = [
    { key: 'hotel', label: 'Hotel' },
    { key: 'flight', label: 'Flight' },
] as const
</script>

<template>
    <main class="bg-white py-12">
        <div class="page-container">
            <form
                class="mx-auto grid w-full max-w-254 grid-cols-1 md:w-[70vw] md:min-w-160 gap-6 rounded-md border border-gray-300 bg-background p-6 md:grid-cols-2"
                @submit.prevent>
                <div class="relative h-56 overflow-hidden rounded-md md:h-auto">
                    <img :src="IMAGE_SRC" alt="Map with travel pins" class="absolute inset-0 size-full object-cover" />
                </div>

                <div class="flex flex-col md:pb-3">
                    <h1 class="text-h4 text-black">Input PIN</h1>
                    <p class="mt-3 text-body-m text-black">
                        This Page Displays All Your Bookings. If You've Previously Made A Booking And It's Not Visible
                        Here, You
                        Can Conveniently Access It Again By Entering The Tracking Code.
                    </p>

                    <div class="mt-8 md:mt-auto">
                        <label for="tracking-code" class="text-h6 text-black">Tracking Code</label>
                        <input id="tracking-code" v-model="code" type="text"
                            class="mt-0.5 h-10 w-full border border-gray-400 bg-white px-3 text-body-s outline-none transition-colors focus:border-primary-500" />

                        <div class="mt-6 flex flex-wrap items-center gap-4">
                            <label v-for="option in typeOptions" :key="option.key"
                                class="flex h-12 cursor-pointer items-center gap-3 rounded-sm border border-primary-500 bg-white px-3 text-body-m text-primary-500 transition-colors hover:bg-gray-100">
                                <input v-model="types[option.key]" type="checkbox"
                                    class="h-4 w-4 cursor-pointer accent-primary-500" />
                                {{ option.label }}
                            </label>

                            <button type="submit"
                                class="h-12 min-w-35 flex-1 rounded-sm bg-primary-500 text-button-xxl text-white transition-colors hover:bg-primary-600">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </main>
</template>