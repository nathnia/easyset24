<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Profile - EasySet24' })

const basicInfo = [
    { label: 'Full Name', value: 'Anna Carolina' },
    { label: 'Date Of Birth', value: '' },
    { label: 'Bio', value: '' },
    { label: 'Disability', value: 'None' },
    { label: 'Accessibility Needs', value: '' },
    { label: 'Gender', value: '' },
]

const contact = [
    { label: 'Mobile Number', value: '' },
    { label: 'Email', value: 'Annacarolina@Gmail.Com' },
    { label: 'Emergency Contact', value: '' },
    { label: 'Address', value: '' },
]
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSidebar />

            <section class="rounded-md bg-white p-6 lg:p-8">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h2 class="text-h6 text-black">Basic Information</h2>
                        <p class="mt-3 text-body-xs text-gray-500">
                            Make Sure This Information Matches Your Travel ID, Like Your Passport Or License.
                        </p>
                    </div>
                    <NuxtLink to="/profile-basic-information"
                        class="text-body-xs text-primary-500 transition-colors hover:text-primary-600">
                        Edit
                    </NuxtLink>
                </div>

                <dl class="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
                    <div v-for="item in basicInfo" :key="item.label">
                        <dt class="text-caption-s font-semibold! text-black">{{ item.label }}</dt>
                        <dd class="mt-1 text-caption-s" :class="item.value ? 'text-black' : 'text-gray-500'">
                            {{ item.value || 'Not Provided' }}
                        </dd>
                    </div>
                </dl>

                <div class="mt-10 flex items-start justify-between gap-4">
                    <div>
                        <h2 class="text-h6 text-black">Contact</h2>
                        <p class="mt-3 text-body-xs text-gray-500">
                            Receive Account Activity Alerts And Trip Updates By Sharing This Information.
                        </p>
                    </div>
                    <button type="button"
                        class="text-body-xs text-primary-500 transition-colors hover:text-primary-600">
                        Edit
                    </button>
                </div>

                <dl class="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                    <div v-for="item in contact" :key="item.label">
                        <dt class="text-caption-s font-semibold! text-black">{{ item.label }}</dt>
                        <dd class="mt-1 text-caption-s" :class="item.value ? 'text-black' : 'text-gray-500'">
                            {{ item.value || 'Not Provided' }}
                        </dd>
                    </div>
                </dl>
            </section>
        </div>
    </main>
</template>