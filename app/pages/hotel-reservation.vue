<script setup lang="ts">
useHead({ title: 'Hotel Reservation Confirmed - EasySet24' })

const bookingNo = 1385

const columns = [
    { label: 'Stays', value: '5 Nights' },
    { label: 'Check-In', value: '25 Jan 2024', icon: 'icon-park-outline:calendar' },
    { label: 'Check-ut', value: '30 Jan 2024', icon: 'icon-park-outline:calendar' },
    { label: 'Quantity', value: '2 Rooms' },
    { label: 'Room Type', value: 'Double' },
    { label: 'Bed Type', value: 'Two Twin' },
]

const cols = 'grid grid-cols-[1.1fr_1fr_1fr_0.65fr_0.75fr_0.85fr]'
</script>

<template>
    <div class="page-container pb-12">
        <section class="rounded-md bg-white p-4 md:p-6">
            <h1 class="flex flex-wrap items-baseline gap-x-3 text-h4">
                Your Hotel Reservation
                <span class="text-h2 text-primary-500">Confirmed</span>
            </h1>
            <p class="mt-1 text-body-m">
                Contact EasySet24 If You Need To Change In Basic Information With
                <b>{{ bookingNo }}</b> Booking Number.
            </p>

            <div class="mt-10 rounded-md border border-gray-300 bg-gray-100 p-4 md:p-6 xl:max-w-250">
                <div class="relative h-72 overflow-hidden bg-gray-300 md:h-82.5">
                    <img src="https://picsum.photos/seed/easyset-beach/1600/700" alt=""
                        class="h-full w-full object-cover" />
                    <div class="absolute inset-0 bg-linear-to-b from-white/50 via-transparent to-black/80" />

                    <div class="absolute left-5 top-5">
                        <h2 class="text-h4">Booking No. {{ bookingNo }} Details</h2>
                        <p class="mt-2 text-body-m">Check Your Information Here !</p>
                    </div>

                    <div class="absolute inset-x-5 bottom-3 text-white">
                        <h3 class="text-h5">Hotel Roles</h3>
                        <div class="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
                            <p class="text-body-m">
                                Check-In At 14 :00 Every Day
                                <span class="ml-4">Check-Out At 12 :00 , Every Day</span>
                            </p>
                            <p class="text-button-s md:text-label-xs">Secure By EasySet24 Policy-2024</p>
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
                                class="flex h-16 items-center justify-center border border-gray-300 bg-white text-center text-label-m">
                                {{ c.value }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-2 text-body-m">
                    <p class="font-bold">Adults 2 ,Children 3 ,Infant 0</p>
                    <p><b>Additional Services Quantity</b> <span class="ml-1">None</span></p>
                    <p><b>Meal Plan</b> <span class="ml-1">Allergic</span></p>
                </div>
            </div>

            <div class="mt-10">
                <h2 class="text-h4">Cancelation Policy</h2>
                <p class="mt-3 text-body-m">Pay Attention</p>
                <p class="mt-5 max-w-280 text-body-m">
                    This Booking Represents The Conclusive Step In The Hotel Reservation Process. It Is Considered Final
                    And May Only Be Canceled By The Hotel In The Event Of Unforeseen Circumstances Or Natural Disasters.
                </p>
            </div>
        </section>
    </div>
</template>