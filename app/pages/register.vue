<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agree = ref(false)
const confirmError = ref('')

watch(confirmPassword, () => (confirmError.value = ''))

function onSubmit() {
    // Demo only: replace with a real API call later
    if (password.value !== confirmPassword.value) {
        confirmError.value = 'The Passwords Do Not Match'
        return
    }
    if (!agree.value) return
}

const inputClass =
    'mt-1 w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-body-xs outline-none placeholder:text-gray-400 focus:border-primary-400'
</script>

<template>
    <AuthCard>
        <form @submit.prevent="onSubmit">
            <h1 class="text-h6">Register</h1>

            <!-- First + last name side by side -->
            <div class="mt-4 grid grid-cols-2 gap-3">
                <div>
                    <label for="first-name" class="text-body-xs">First Name</label>
                    <input id="first-name" v-model="firstName" type="text" placeholder="EasySet24"
                        :class="inputClass" />
                </div>
                <div>
                    <label for="last-name" class="text-body-xs">Last Name</label>
                    <input id="last-name" v-model="lastName" type="text" placeholder="EasySet24" :class="inputClass" />
                </div>
            </div>

            <div class="mt-3">
                <label for="email" class="text-body-xs">Email</label>
                <input id="email" v-model="email" type="email" placeholder="EasySet24@Gmail.Com" :class="inputClass" />
            </div>

            <PasswordField id="password" v-model="password" label="Password" placeholder="Password" class="mt-3" />
            <PasswordField id="confirm-password" v-model="confirmPassword" label="Confirm Password"
                placeholder="Confirm Password" :error="confirmError" class="mt-3" />

            <label class="mt-3 flex cursor-pointer items-center gap-2 text-body-xxs">
                <input v-model="agree" type="checkbox" class="h-4 w-4 rounded-sm accent-primary-500" />
                <span>I agree to all the <NuxtLink to="#" class="text-primary-500 hover:underline">Terms and Privacy
                        Policies</NuxtLink></span>
            </label>

            <button type="submit" :disabled="!agree"
                class="mt-4 w-full rounded-sm bg-primary-500 py-2.5 text-button-l text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-400">
                Register Now
            </button>

            <p class="mt-3 text-center text-body-xxs">
                Already have an account?
                <NuxtLink to="/login" class="text-primary-500 hover:underline">Login</NuxtLink>
            </p>

            <SocialButtons />
        </form>
    </AuthCard>
</template>