<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; active?: boolean }>(), { size: 'md', active: false })

const sizes = {
    sm: { box: 'h-7 w-7', icon: 16 },
    md: { box: 'h-9 w-9', icon: 22 },
    lg: { box: 'h-10 w-10', icon: 22 },
} as const
</script>

<template>
    <button type="button" :aria-label="active ? 'Remove from favourites' : 'Save'" :aria-pressed="active"
        class="flex cursor-pointer items-center justify-center rounded-full text-white transition hover:scale-110 hover:bg-primary-500"
        :class="[sizes[size].box, active ? 'bg-primary-500' : 'bg-black/70']" @click.stop.prevent>
        <Icon name="icon-park-outline:like" :size="sizes[size].icon" />
    </button>
</template>