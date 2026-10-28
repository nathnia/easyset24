<script setup lang="ts">
const { user, signOut } = useAuth()
const route = useRoute()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const items = [
    { label: 'My Account', to: '/profile', icon: 'icon-park-outline:user' },
    { label: 'Payments', to: '/payment', icon: 'icon-park-outline:bank-card' },
    { label: 'Settings', to: '/setting', icon: 'icon-park-outline:setting-two' },
    { label: 'Support', to: '/customer-service', icon: 'icon-park-outline:headset-one' },
]

function onDocClick(e: MouseEvent) {
    if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
watch(() => route.fullPath, () => (open.value = false))

function onSignOut() {
    signOut()
    open.value = false
    navigateTo('/')
}
</script>

<template>
    <div ref="root" class="relative">
        <button type="button" class="flex items-center gap-2" aria-haspopup="menu" :aria-expanded="open"
            @click="open = !open">
            <img :src="user?.avatar" alt="" class="h-8 w-8 shrink-0 rounded-full object-cover" />
            <span class="hidden text-left leading-tight sm:block">
                <span class="block text-label-m text-primary-500">Your Account</span>
                <span class="block text-caption-s text-primary-500">{{ user?.name }}</span>
            </span>
        </button>

        <div v-if="open" role="menu"
            class="absolute right-0 top-full z-50 mt-3 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <div class="flex items-center gap-3 border-b border-gray-300 pb-4">
                <img :src="user?.avatar" alt="" class="h-16 w-16 shrink-0 rounded-full object-cover" />
                <span class="break-all text-caption-s">{{ user?.email }}</span>
            </div>

            <nav class="mt-4 flex flex-col">
                <NuxtLink v-for="item in items" :key="item.label" :to="item.to" role="menuitem"
                    :class="['flex items-center gap-3 border-b px-2 py-2.5 text-body-xs',
                        route.path.startsWith(item.to)
                            ? 'rounded-sm border-transparent bg-primary-500 text-white'
                            : 'border-gray-300 hover:rounded-sm hover:border-transparent hover:bg-primary-500 hover:text-white']">
                    <Icon :name="item.icon" size="18" class="shrink-0" />
                    <span class="flex-1">{{ item.label }}</span>
                    <Icon name="icon-park-outline:right" size="16" class="shrink-0" />
                </NuxtLink>
            </nav>

            <button type="button" role="menuitem"
                class="mt-1 flex w-full items-center gap-3 border-b border-gray-300 px-2 py-2.5 text-body-xs text-primary-500 hover:rounded-sm hover:border-transparent hover:bg-primary-500 hover:text-white"
                @click="onSignOut">
                <Icon name="icon-park-outline:logout" size="18" class="shrink-0" />
                Sign Out
            </button>
        </div>
    </div>
</template>