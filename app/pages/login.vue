<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')

// typing again clears the error
watch(password, () => (error.value = ''))

function onSubmit() {
    // Demo only: replace with a real API call later
    error.value = password.value.length < 8 ? 'The Password Is Incorrect' : ''
}
</script>

<template>
    <AuthCard>
        <form @submit.prevent="onSubmit">
            <h1 class="text-h6">Login</h1>
            <p class="mt-1 text-body-xs">Login to access your EasySet24 account</p>

            <label for="email" class="mt-6 block text-body-xs">Email</label>
            <input id="email" v-model="email" type="email" placeholder="EasySet24@Gmail.Com"
                class="mt-1 w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-body-xs outline-none placeholder:text-gray-400 focus:border-primary-400" />

            <PasswordField id="password" v-model="password" label="Password" placeholder="Password" :error="error"
                class="mt-4" />

            <div class="mt-4 flex items-center justify-between">
                <label class="flex cursor-pointer items-center gap-2 text-body-xs">
                    <input v-model="remember" type="checkbox" class="h-4 w-4 rounded-sm accent-primary-500" />
                    Remember Me
                </label>
                <NuxtLink to="#" class="text-body-xs text-primary-500 hover:underline">Forgot Password?</NuxtLink>
            </div>

            <button type="submit"
                class="mt-5 w-full rounded-sm bg-primary-500 py-2.5 text-button-l text-white hover:bg-primary-600">
                Login
            </button>

            <SocialButtons />

            <p class="mt-5 text-center text-body-xxs">
                Don't have an account in EasySet24 yet?
                <NuxtLink to="/register" class="text-primary-500 hover:underline">Register !</NuxtLink>
            </p>
        </form>
    </AuthCard>
</template>