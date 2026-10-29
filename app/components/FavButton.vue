<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const sizes = {
    sm: { box: 'h-7 w-7', icon: 16 },
    md: { box: 'h-9 w-9', icon: 22 },
    lg: { box: 'h-10 w-10', icon: 22 },
} as const
</script>

<template>
    <button type="button" aria-label="Save"
        class="flex cursor-pointer items-center justify-center rounded-full bg-black/70 text-white transition hover:scale-110 hover:bg-primary-500"
        :class="sizes[size].box">
        <Icon name="icon-park-outline:like" :size="sizes[size].icon" />
    </button>
</template>