<script setup lang="ts">
const socials = [
    { name: 'Facebook', icon: 'logos:facebook' },
    { name: 'Apple', icon: 'logos:apple' },
    { name: 'Google', icon: 'logos:google-icon' },
]
</script>

<template>
    <div>
        <p class="mt-4 text-center text-body-xs">Or</p>
        <div class="mt-3 flex justify-center gap-3">
            <button v-for="s in socials" :key="s.name" type="button"
                class="flex h-9 w-9 items-center justify-center rounded-sm border border-gray-300 bg-white hover:border-primary-400"
                :aria-label="`Continue with ${s.name}`">
                <Icon :name="s.icon" size="18" />
            </button>
        </div>
    </div>
</template>