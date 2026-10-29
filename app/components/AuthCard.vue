<script setup lang="ts">
const image = 'https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=900&q=80'
</script>

<template>
    <div class="page-container flex flex-1 items-center py-6">
        <div
            class="mx-auto grid w-full max-w-262.5 gap-6 rounded-lg border border-gray-300 bg-gray-200 p-5 md:grid-cols-[39fr_61fr] md:p-6">
            <div class="relative hidden min-h-130 md:block">
                <img :src="image" alt="" class="absolute inset-0 h-full w-full rounded-md object-cover" />
            </div>

            <div class="mx-auto flex w-full max-w-100 flex-col justify-center py-4">
                <slot />
            </div>
        </div>
    </div>
</template>