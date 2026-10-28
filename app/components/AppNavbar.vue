<script setup lang="ts">
const logo = '/images/logo.svg'
const { isLoggedIn } = useAuth()

const tabs = [
    { label: 'Trip', to: '/' },
    { label: '%Deals' },
    { label: 'Hotel', to: '/hotels' },
    { label: 'Flight', to: '/flights' },
    { label: 'Apartment' },
    { label: 'Camper' },
]

const route = useRoute()
const active = computed(() => {
    if (route.path === '/') return 'Trip'
    if (route.path.startsWith('/flights') || route.path === '/hotel-reservation') return 'Flight'
    if (route.path.startsWith('/hotels')) return 'Hotel'
    if (route.path.startsWith('/flights') || route.path === '/hotel-reservation' || route.path === '/flight-ticket') return 'Flight'
    return ''
})

const tabBase = 'w-24 shrink-0 rounded-full border py-1.5 text-center text-caption-s md:w-[78px] xl:w-[90px]'
const tabActive = 'border-primary-500 bg-primary-500 text-white'
const authBtn =
    'w-24 rounded-sm border border-primary-400 bg-white py-2 text-center text-button-xl text-primary-500 hover:bg-primary-500 hover:text-white md:w-[120px]'
</script>

<template>
    <header class="sticky top-0 z-40 bg-background">
        <div class="page-container flex items-center gap-3 py-5 md:gap-4">
            <NuxtLink to="/" class="shrink-0">
                <img :src="logo" alt="EasySet 24" class="h-10 text-label-m text-primary-500" />
            </NuxtLink>

            <template v-if="!isLoggedIn">
                <Icon name="icon-park-outline:help" size="22" class="shrink-0 text-primary-500" />
                <Icon name="circle-flags:uk" size="24" class="shrink-0" aria-label="English" />
            </template>

            <div class="relative hidden flex-1 md:block">
                <input type="text" placeholder="Search"
                    class="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-caption-s outline-none placeholder:text-gray-400 focus:border-primary-400" />
                <Icon name="icon-park-outline:search" size="16"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div v-if="!isLoggedIn" class="ml-auto flex gap-3 md:ml-4">
                <NuxtLink to="/login" :class="authBtn">Sign In</NuxtLink>
                <NuxtLink to="/register" :class="authBtn">Register</NuxtLink>
            </div>

            <div v-else class="ml-auto flex items-center gap-2.5 md:ml-4 md:gap-3">
                <Icon name="circle-flags:uk" size="18" class="shrink-0" aria-label="English" />
                <Icon name="icon-park-outline:dollar" size="18" class="shrink-0 text-primary-500"
                    aria-label="Currency" />
                <Icon name="icon-park-outline:help" size="18" class="shrink-0 text-primary-500" />
                <Icon name="icon-park-outline:like" size="18" class="shrink-0 text-primary-500" />
                <Icon name="icon-park-outline:phone-call" size="18" class="shrink-0 text-primary-500" />
                <AccountMenu />
            </div>
        </div>

        <nav class="page-container flex gap-3 overflow-x-auto pb-7 md:justify-center">
            <template v-for="tab in tabs" :key="tab.label">
                <NuxtLink v-if="tab.to" :to="tab.to"
                    :class="[tabBase, active === tab.label ? tabActive : 'border-gray-300 bg-white text-gray-400 hover:border-primary-400']">
                    {{ tab.label }}
                </NuxtLink>
                <span v-else
                    :class="[tabBase, active === tab.label ? tabActive : 'cursor-not-allowed border-gray-300 bg-white text-gray-400 opacity-60']">
                    {{ tab.label }}
                </span>
            </template>
        </nav>
    </header>
</template>