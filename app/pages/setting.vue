<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Settings - EasySet24' })

const security = [
    { label: 'Email', to: '/setting-email' },
    { label: 'Change Password', to: '/setting-password' },
    { label: 'Connected Device', to: '/setting-devices' },
]

const account = [
    { label: 'Data Control', to: '/setting-data' },
]
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSidebar />

            <section class="rounded-md bg-white p-6 lg:p-8">
                <h1 class="text-h4 text-black">Settings</h1>

                <h2 class="mt-3 text-h5 text-black">Sign-in and security</h2>
                <p class="mt-1 text-body-xs text-black">
                    Keep Your Account Safe With A Secure Password And By Signing Out Of Devices You're Not Actively
                    Using.
                </p>

                <ul class="mt-9 flex w-full max-w-77.5 flex-col gap-4">
                    <li v-for="item in security" :key="item.label">
                        <NuxtLink :to="item.to"
                            class="flex h-12 w-full items-center rounded-sm border border-gray-300 bg-white px-6 text-body-s text-black transition-colors hover:bg-gray-50">
                            <span class="flex-1 text-left">{{ item.label }}</span>
                            <Icon name="icon-park-outline:right" size="14" class="text-black" />
                        </NuxtLink>
                    </li>
                </ul>

                <h2 class="mt-12 text-h5 text-black">Account management</h2>
                <p class="mt-1 text-body-xs text-black">
                    Control Other Options To Manage Your Data, Like Deleting Your Account.
                </p>

                <ul class="mt-6 flex w-full max-w-77.5 flex-col gap-4">
                    <li v-for="item in account" :key="item.label">
                        <NuxtLink :to="item.to"
                            class="flex h-12 w-full items-center rounded-sm border border-gray-300 bg-white px-6 text-body-s text-black transition-colors hover:bg-gray-50">
                            <span class="flex-1 text-left">{{ item.label }}</span>
                            <Icon name="icon-park-outline:right" size="14" class="text-black" />
                        </NuxtLink>
                    </li>
                </ul>

                <button type="button"
                    class="mt-8 px-6 text-label-s font-semibold text-primary-500 transition-colors hover:text-primary-600">
                    Delete account
                </button>
            </section>
        </div>
    </main>
</template>