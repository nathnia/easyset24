<script setup lang="ts">
const logo = '/images/logo.svg'
</script>

<template>
    <div class="flex min-h-screen flex-col bg-background">
        <header class="border-b border-gray-200 bg-background">
            <div class="page-container flex items-center justify-between gap-3 py-5 md:gap-4">
                <NuxtLink to="/" class="shrink-0">
                    <img :src="logo" alt="EasySet 24" class="h-10 text-label-m text-primary-500" />
                </NuxtLink>

                <div class="flex items-center gap-3 md:gap-4">
                    <Icon name="circle-flags:uk" size="24" class="shrink-0" aria-label="English" />
                    <Icon name="icon-park-outline:help" size="22" class="shrink-0 text-primary-500" />
                    <NuxtLink to="/account" class="flex items-center gap-2">
                        <img src="https://i.pravatar.cc/100?img=47" alt=""
                            class="h-10 w-10 shrink-0 rounded-full object-cover" />
                        <span class="hidden leading-tight sm:block">
                            <span class="block text-label-m text-primary-500">Your Account</span>
                            <span class="block text-caption-s text-primary-500">Anna Carinna</span>
                        </span>
                    </NuxtLink>
                </div>
            </div>
        </header>

        <main class="flex-1">
            <slot />
        </main>

        <AppFooter />
    </div>
</template>