<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Basic Information' })

const form = reactive({
    firstName: '',
    middleName: '',
    lastName: '',
    bio: '',
    month: '',
    day: '',
    year: '',
    gender: '',
    accessibility: 'Not Provided',
})

const nameFields = [
    { key: 'firstName', label: 'First name', required: true },
    { key: 'middleName', label: 'Middle name', required: false },
    { key: 'lastName', label: 'Last name', required: true },
] as const

const birthFields = [
    { key: 'month', label: 'Month', placeholder: 'MM' },
    { key: 'day', label: 'Day', placeholder: 'DD' },
    { key: 'year', label: 'Year', placeholder: 'YYYY' },
] as const

const accessibilityOptions = ['Not Provided', 'Wheelchair access', 'Visual assistance', 'Hearing assistance']
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
            <ProfileSidebar />

            <form class="rounded-lg bg-white p-6 lg:p-8" @submit.prevent>
                <h1 class="text-h4 text-black">Basic Information</h1>
                <p class="mt-3 text-body-s text-black">
                    Make Sure This Information Matches Your Travel ID, Like Your Passport Or License.
                </p>

                <div class="mt-12 max-w-sm space-y-12">
                    <fieldset>
                        <legend class="text-label-s text-black">Full name</legend>
                        <div class="mt-4 space-y-2">
                            <div v-for="field in nameFields" :key="field.key" class="relative">
                                <input v-model="form[field.key]" type="text" placeholder=" "
                                    class="peer h-10 w-full rounded-sm border border-gray-400 bg-white px-2 text-body-s outline-none transition-colors focus:border-primary-500" />
                                <span
                                    class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-body-xs text-gray-500 peer-focus:hidden peer-not-placeholder-shown:hidden">
                                    {{ field.label }}
                                    <span v-if="field.required" class="text-error-light">*</span>
                                </span>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend class="text-label-s text-black">About you</legend>
                        <label
                            class="mt-4 block rounded-sm border border-gray-400 px-2 py-2 transition-colors focus-within:border-primary-500">
                            <span class="block text-body-xs text-gray-500">Bio</span>
                            <textarea v-model="form.bio" rows="1"
                                placeholder="You can share your travel style, hobbies, interests, and more."
                                class="w-full resize-none bg-transparent text-body-xs outline-none placeholder:text-gray-500" />
                        </label>
                    </fieldset>

                    <fieldset>
                        <legend class="text-label-s text-black">Date of birth</legend>
                        <div class="mt-4 grid grid-cols-3 gap-4">
                            <label v-for="field in birthFields" :key="field.key"
                                class="block rounded-sm border border-gray-400 px-2 py-1 transition-colors focus-within:border-primary-500">
                                <span class="block text-body-xs text-gray-500">{{ field.label }}</span>
                                <input v-model="form[field.key]" type="text" inputmode="numeric"
                                    :placeholder="field.placeholder"
                                    class="w-full bg-transparent text-body-xs outline-none placeholder:text-gray-500" />
                            </label>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend class="text-label-s text-black">Gender</legend>
                        <div class="mt-4 space-y-3">
                            <label v-for="option in ['Female', 'Male']" :key="option"
                                class="flex cursor-pointer items-center">
                                <span class="w-20.5 text-body-xs text-black">{{ option }}</span>
                                <input v-model="form.gender" type="radio" name="gender" :value="option"
                                    class="size-5 cursor-pointer appearance-none rounded-full border border-gray-400 p-0.75 transition-colors checked:border-2 checked:border-primary-600 checked:bg-primary-500 checked:bg-clip-content" />
                            </label>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend class="text-body-s text-black">Accessibility Needs</legend>
                        <p class="mt-1 text-body-xs text-black">
                            Help us build features that make travel accessible for all by sharing this information.
                        </p>
                        <div
                            class="relative mt-4 rounded-sm border border-gray-400 transition-colors focus-within:border-primary-500">
                            <span class="pointer-events-none absolute left-2 top-1 text-body-xs text-gray-500">Choose an
                                option</span>
                            <select v-model="form.accessibility"
                                class="h-12 w-full appearance-none bg-transparent px-2 pt-4 text-body-s outline-none">
                                <option v-for="option in accessibilityOptions" :key="option" :value="option">{{ option
                                }}</option>
                            </select>
                            <Icon name="icon-park-outline:down" size="14"
                                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                    </fieldset>

                    <button type="submit"
                        class="h-10 w-full rounded-sm bg-primary-500 text-button-xl text-white transition-colors hover:bg-primary-600">
                        Save
                    </button>
                </div>
            </form>
        </div>
    </main>
</template>