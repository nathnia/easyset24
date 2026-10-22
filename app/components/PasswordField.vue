<!-- Password input with show/hide eye and error state. Use: <PasswordField v-model="password" id="password" label="Password" /> -->
<script setup lang="ts">
defineProps<{
    id: string
    label: string
    placeholder?: string
    error?: string
}>()

const model = defineModel<string>({ default: '' })
const show = ref(false)
</script>

<template>
    <div>
        <label :for="id" class="text-body-xs" :class="error ? 'text-error-light' : ''">{{ label }}</label>
        <div class="relative mt-1">
            <input :id="id" v-model="model" :type="show ? 'text' : 'password'" :placeholder="placeholder"
                class="w-full rounded-sm border bg-white py-2.5 pl-3 pr-10 text-body-xs outline-none placeholder:text-gray-400"
                :class="error ? 'border-error-light text-error-light' : 'border-gray-300 focus:border-primary-400'" />
            <Icon v-if="error" name="icon-park-outline:attention" size="18"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-error-light" />
            <button v-else type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500"
                :aria-label="show ? 'Hide password' : 'Show password'" @click="show = !show">
                <Icon :name="show ? 'icon-park-outline:preview-open' : 'icon-park-outline:preview-close-one'"
                    size="18" />
            </button>
        </div>
        <p v-if="error" class="mt-1 text-body-xs text-error-light">{{ error }}</p>
    </div>
</template>