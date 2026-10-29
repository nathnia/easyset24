<script setup lang="ts">
const logo = '/images/logo.svg'
</script>

<template>
    <div class="flex min-h-screen flex-col bg-background">
        <header class="border-b border-gray-300 bg-background">
            <div class="page-container flex items-center justify-between py-3">
                <NuxtLink to="/" class="shrink-0">
                    <img :src="logo" alt="EasySet 24" class="h-10 text-label-m text-primary-500" />
                </NuxtLink>
                <div class="flex items-center gap-4">
                    <Icon name="circle-flags:uk" size="24" aria-label="English" />
                    <Icon name="icon-park-outline:help" size="22" class="text-primary-500" />
                </div>
            </div>
        </header>

        <slot />
    </div>
</template>