<script setup lang="ts">
const logo = '/images/logo.svg'

const scrolled = ref(false)
const onScroll = () => { scrolled.value = window.scrollY > 4 }
onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
    <div class="flex min-h-screen flex-col bg-background">
        <header class="sticky top-0 z-40 border-b border-gray-200 bg-background transition-shadow duration-200"
            :class="scrolled ? 'shadow-md' : ''">
            <div class="page-container flex items-center justify-between gap-3 py-5 md:gap-4">
                <NuxtLink to="/" class="shrink-0">
                    <img :src="logo" alt="EasySet 24" class="h-10 text-label-m text-primary-500" />
                </NuxtLink>

                <div class="flex items-center gap-2.5 md:gap-3">
                    <Icon name="circle-flags:uk" size="18" class="shrink-0" aria-label="English" />
                    <Icon name="icon-park-outline:help" size="18" class="shrink-0 text-primary-500" />
                    <AccountMenu />
                </div>
            </div>
        </header>

        <main class="flex-1">
            <slot />
        </main>

        <AppFooter />
    </div>
</template>