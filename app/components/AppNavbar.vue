<script setup lang="ts">
const logo = '/images/logo.svg'
const tabs = ['Trip', '%Deals', 'Hotel', 'Flight', 'Apartment', 'Camper']
const active = ref('Hotel')
</script>

<template>
    <header class="bg-background">
        <!-- Top row: logo, help, flag, search, auth buttons -->
        <div class="page-container flex items-center gap-3 py-5 md:gap-4">
            <NuxtLink to="/" class="shrink-0">
                <img :src="logo" alt="EasySet 24" class="h-10 text-label-m text-primary-500" />
            </NuxtLink>
            <Icon name="icon-park-outline:help" size="22" class="shrink-0 text-primary-500" />
            <Icon name="circle-flags:uk" size="24" class="shrink-0" aria-label="English" />

            <div class="relative hidden flex-1 md:block">
                <input type="text" placeholder="Search"
                    class="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-caption-s outline-none placeholder:text-gray-400 focus:border-primary-400" />
                <Icon name="icon-park-outline:search" size="16"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div class="ml-auto flex gap-3 md:ml-4">
                <NuxtLink to="/login"
                    class="w-24 rounded-sm border border-primary-400 bg-white py-2 text-button-xl text-primary-500 hover:bg-primary-500 hover:text-white md:w-[120px] text-center">
                    Sign In
                </NuxtLink>
                <NuxtLink to="/register"
                    class="w-24 rounded-sm border border-primary-400 bg-white py-2 text-button-xl text-primary-500 hover:bg-primary-500 hover:text-white md:w-[120px] text-center">
                    Register
                </NuxtLink>
            </div>
        </div>

        <!-- Tabs -->
        <nav class="page-container flex gap-3 overflow-x-auto pb-7 md:justify-center">
            <button v-for="tab in tabs" :key="tab"
                class="w-24 shrink-0 rounded-full border py-1.5 text-center text-caption-s md:w-[78px] xl:w-[90px]"
                :class="active === tab ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 bg-white text-gray-400 hover:border-primary-400'"
                @click="active = tab">
                {{ tab }}
            </button>
        </nav>
    </header>
</template>