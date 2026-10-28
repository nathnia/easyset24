<script setup lang="ts">
const route = useRoute()

const user = {
    name: 'Anna',
    email: 'Annacarlinna@Gmail.Com',
}

const menus = [
    { label: 'Profile', icon: 'icon-park-outline:user', to: '/profile' },
    { label: 'Preferences', icon: 'icon-park-outline:list-checkbox', to: '/preferences' },
    { label: 'Payment', icon: 'icon-park-outline:wallet', to: '/payment' },
    { label: 'Help', icon: 'icon-park-outline:help', to: '/help' },
    { label: 'Setting', icon: 'icon-park-outline:setting', to: '/setting' },
]

const isActive = (to: string) => route.path.startsWith(to)
</script>

<template>
    <aside class="flex flex-col gap-3">
        <div class="rounded-md bg-white p-4">
            <p class="text-label-m text-black">Hi, {{ user.name }}</p>
            <p class="text-caption-s text-gray-500">{{ user.email }}</p>
            <p class="mt-4 text-caption-s text-gray-500">
                Manage your profile, rewards, and preferences for all our brands in one place.
            </p>
        </div>

        <nav class="flex flex-col gap-2">
            <NuxtLink v-for="menu in menus" :key="menu.label" :to="menu.to"
                class="flex w-full items-center gap-3 rounded-md bg-white px-4 py-3 text-body-xs transition-colors hover:bg-gray-100"
                :class="isActive(menu.to) ? 'text-primary-500' : 'text-black'">
                <Icon :name="menu.icon" size="16" />
                <span class="flex-1 text-left">{{ menu.label }}</span>
                <Icon name="icon-park-outline:right" size="14"
                    :class="isActive(menu.to) ? 'text-primary-500' : 'text-gray-500'" />
            </NuxtLink>
        </nav>

        <NuxtLink to="/login"
            class="rounded-md bg-white px-4 py-3 text-left text-body-xs font-semibold! text-primary-500 transition-colors hover:bg-gray-100">
            Sign Out
        </NuxtLink>
    </aside>
</template>