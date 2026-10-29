<script setup lang="ts">
definePageMeta({ layout: 'checkout' })
useHead({ title: 'Help' })

const showChat = ref(false)

const actions = [
    { label: 'Chat', icon: 'icon-park-outline:communication', key: 'chat' },
    { label: 'Visit The Help Center', icon: 'icon-park-outline:help', key: 'help' },
    { label: 'Call Easyset', icon: 'icon-park-outline:phone-telephone', key: 'call' },
    { label: 'Share Your Feedback', icon: null, key: 'feedback' },
]

const martin = 'https://randomuser.me/api/portraits/men/32.jpg'
const anna = 'https://randomuser.me/api/portraits/women/44.jpg'

const messages = [
    { name: 'Martin', avatar: martin, text: 'Hello ! How Can I Help You ?', time: '10:22 AM', mine: false },
    { name: 'Anna', avatar: anna, text: 'I Want To Report An Error', time: '10:23 AM', mine: true },
    { name: 'Martin', avatar: martin, text: 'Of Course , What Is The Problem?', time: '10:24AM', mine: false },
]

function onAction(key: string) {
    if (key === 'chat') showChat.value = !showChat.value
}
</script>

<template>
    <main class="bg-background py-8">
        <div class="page-container grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSidebar />

            <section class="grid grid-cols-1 gap-8 rounded-md bg-white p-6 lg:p-8"
                :class="showChat ? 'lg:grid-cols-[1fr_393px]' : ''">
                <div>
                    <h1 class="text-h4 text-black">Help</h1>
                    <p class="mt-1 text-body-xs text-black">
                        Have Questions Or Feedback For Us? We're Listening.
                    </p>

                    <ul class="mt-9 flex w-full max-w-77.5 flex-col gap-4">
                        <li v-for="item in actions" :key="item.key">
                            <button type="button" @click="onAction(item.key)"
                                class="flex h-12 w-full items-center gap-2 rounded-sm border bg-white px-6 text-body-s transition-colors hover:bg-gray-50"
                                :class="item.key === 'chat' ? 'border-primary-500 text-primary-500' : 'border-gray-300 text-black'">
                                <Icon v-if="item.icon" :name="item.icon" size="20" class="shrink-0" />
                                <span class="flex-1 text-left">{{ item.label }}</span>
                                <Icon name="icon-park-outline:right" size="14"
                                    :class="item.key === 'chat' ? 'text-primary-500' : 'text-black'" />
                            </button>
                        </li>
                    </ul>
                </div>

                <div v-if="showChat"
                    class="flex h-115 w-full max-w-98.25 flex-col overflow-hidden rounded-md border border-primary-500 bg-gray-100">
                    <div class="flex h-14 shrink-0 items-center gap-4 bg-primary-500 px-8 text-white">
                        <button type="button" aria-label="Close chat" @click="showChat = false">
                            <Icon name="iconoir:xmark" size="20" />
                        </button>
                        <span class="h-px flex-1 bg-white" />
                        <span class="text-caption-s font-semibold">Dec 18, 2023</span>
                        <span class="h-px flex-1 bg-white" />

                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                            <path
                                d="M16 4C9.4 4 4 8.9 4 15s5.4 11 12 11c1.3 0 2.5-.2 3.7-.5L26 28l-1.3-5.2C26.8 20.9 28 18.1 28 15 28 8.9 22.6 4 16 4z"
                                stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                            <circle cx="11" cy="15" r="1.8" fill="currentColor" />
                            <circle cx="16" cy="15" r="1.8" fill="currentColor" />
                            <circle cx="21" cy="15" r="1.8" fill="currentColor" />
                        </svg>
                    </div>

                    <div class="flex flex-1 flex-col gap-5 px-8 py-4">
                        <div v-for="(msg, i) in messages" :key="i" class="flex items-start gap-1.5"
                            :class="msg.mine ? 'pl-25' : ''">
                            <div class="flex shrink-0 flex-col items-center gap-0.5">
                                <img :src="msg.avatar" :alt="msg.name"
                                    class="size-12 rounded-full border-2 object-cover"
                                    :class="msg.mine ? 'border-gray-300' : 'border-primary-500'" />
                                <span class="text-[10px] text-gray-500">{{ msg.time }}</span>
                            </div>
                            <div class="pt-0.5">
                                <p class="text-caption-s text-primary-500">{{ msg.name }}</p>
                                <p class="text-caption-s text-black">{{ msg.text }}</p>
                            </div>
                        </div>

                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none"
                            class="mt-auto self-end text-gray-700" aria-hidden="true">
                            <path
                                d="M16 4C9.4 4 4 8.9 4 15s5.4 11 12 11c1.3 0 2.5-.2 3.7-.5L26 28l-1.3-5.2C26.8 20.9 28 18.1 28 15 28 8.9 22.6 4 16 4z"
                                stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                            <circle cx="11" cy="15" r="1.8" class="fill-gray-400" />
                            <circle cx="16" cy="15" r="1.8" class="fill-gray-400" />
                            <circle cx="21" cy="15" r="1.8" class="fill-primary-500" />
                        </svg>
                    </div>

                    <div class="mx-auto flex h-11 w-57.5 shrink-0 items-center gap-3 bg-white px-3">
                        <Icon name="iconoir:plus" size="20" class="text-primary-500" />
                        <span class="flex-1 text-caption-s text-gray-500">Type A Message</span>
                        <Icon name="iconoir:send" size="22" class="text-primary-500" />
                    </div>

                    <p class="py-4 text-center text-caption-s font-semibold text-primary-700">Conversations</p>
                </div>
            </section>
        </div>
    </main>
</template>