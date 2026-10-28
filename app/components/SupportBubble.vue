<script setup lang="ts">
type Mode = 'hidden' | 'expanded' | 'mini' | 'open'
type Message = { id: number, from: 'agent' | 'user', text: string, time: string }

const agents = [
    { name: 'Agent 1', img: 'https://i.pravatar.cc/80?img=47' },
    { name: 'Agent 2', img: 'https://i.pravatar.cc/80?img=12' },
    { name: 'Agent 3', img: 'https://i.pravatar.cc/80?img=32' },
]

const replies = [
    'Thanks for your message! One of our agents will reply in a moment.',
    'Got it. For anything urgent, you can also call us 24/7 on +44 20 7123 4567.',
    'We are looking into it and will get back to you as soon as possible.',
]

const mode = ref<Mode>('hidden')
const draft = ref('')
const typing = ref(false)
const messages = ref<Message[]>([])
const dateLabel = ref('')
const listEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

let nextId = 1
let replyCount = 0
const timers: ReturnType<typeof setTimeout>[] = []

const later = (fn: () => void, ms: number) => {
    timers.push(setTimeout(fn, ms))
}

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const push = (from: Message['from'], text: string) => {
    messages.value.push({ id: nextId++, from, text, time: nowTime() })
}

const scrollDown = async () => {
    await nextTick()
    if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
}

const openChat = async () => {
    mode.value = 'open'
    await nextTick()
    inputEl.value?.focus()
    scrollDown()
}

const closeChat = () => {
    mode.value = 'mini'
}

const send = () => {
    const text = draft.value.trim()
    if (!text) return
    push('user', text)
    draft.value = ''
    typing.value = true
    scrollDown()
    later(() => {
        typing.value = false
        push('agent', replies[replyCount % replies.length]!)
        replyCount++
        scrollDown()
    }, 1400)
}

onMounted(() => {
    dateLabel.value = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    push('agent', 'Hello, how can I help you?')
    later(() => {
        if (mode.value === 'hidden') mode.value = 'expanded'
    }, 1500)
    later(() => {
        if (mode.value === 'expanded') mode.value = 'mini'
    }, 8000)
})

onBeforeUnmount(() => {
    timers.forEach(clearTimeout)
})
</script>

<template>
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <Transition mode="out-in" enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
            enter-from-class="translate-y-3 scale-95 opacity-0" enter-to-class="translate-y-0 scale-100 opacity-100"
            leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
            leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-2 opacity-0">
            <button v-if="mode === 'expanded'" key="expanded" type="button"
                class="flex origin-bottom-right flex-col items-end gap-1.5" aria-label="Open chat" @click="openChat">
                <span class="flex">
                    <img v-for="(a, i) in agents" :key="a.name" :src="a.img" :alt="a.name"
                        class="size-8 rounded-full border-2 border-white object-cover shadow-sm"
                        :class="i > 0 ? '-ml-2' : ''" />
                </span>
                <span
                    class="rounded-sm border border-primary-400 bg-white px-3 py-1.5 text-caption-s text-primary-500 shadow-md">
                    If You Have Any Questions, We Are Here!
                </span>
            </button>

            <button v-else-if="mode === 'mini'" key="mini" type="button"
                class="flex origin-bottom-right items-center gap-2" aria-label="Open chat" @click="openChat">
                <span
                    class="rounded-sm border border-primary-400 bg-white px-3 py-1.5 text-caption-s text-primary-500 shadow-md">
                    Need Help? Chat With Us
                </span>
                <img :src="agents[0]!.img" :alt="agents[0]!.name"
                    class="size-10 rounded-full border-2 border-white object-cover shadow-md" />
            </button>

            <section v-else-if="mode === 'open'" key="open" role="dialog" aria-label="Chat with customer service"
                class="flex h-112 w-80 origin-bottom-right flex-col overflow-hidden rounded-md bg-white shadow-xl max-sm:w-[calc(100vw-3rem)]">
                <header class="flex items-center justify-between bg-primary-600 px-3 py-3 text-white">
                    <button type="button" aria-label="Minimize chat" @click="closeChat">
                        <Icon name="icon-park-outline:down" size="18" />
                    </button>
                    <span class="text-caption-s">{{ dateLabel }}</span>
                    <button type="button" aria-label="Close chat" @click="closeChat">
                        <Icon name="icon-park-outline:close" size="18" />
                    </button>
                </header>

                <div ref="listEl" class="flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-200 p-3" aria-live="polite">
                    <div v-for="m in messages" :key="m.id" class="flex items-end gap-2"
                        :class="m.from === 'user' ? 'justify-end' : ''">
                        <img v-if="m.from === 'agent'" :src="agents[0]!.img" alt=""
                            class="size-7 shrink-0 rounded-full object-cover" />
                        <div class="flex max-w-[75%] flex-col gap-0.5"
                            :class="m.from === 'user' ? 'items-end' : 'items-start'">
                            <p class="rounded-md px-3 py-2 text-body-xs"
                                :class="m.from === 'user' ? 'bg-primary-500 text-white' : 'bg-white text-black'">
                                {{ m.text }}
                            </p>
                            <span class="text-[10px] text-gray-500">{{ m.time }}</span>
                        </div>
                    </div>

                    <div v-if="typing" class="flex items-end gap-2">
                        <img :src="agents[0]!.img" alt="" class="size-7 shrink-0 rounded-full object-cover" />
                        <p class="flex items-center gap-1 rounded-md bg-white px-3 py-3">
                            <span class="size-1.5 animate-bounce rounded-full bg-gray-400"
                                style="animation-delay: 0ms" />
                            <span class="size-1.5 animate-bounce rounded-full bg-gray-400"
                                style="animation-delay: 150ms" />
                            <span class="size-1.5 animate-bounce rounded-full bg-gray-400"
                                style="animation-delay: 300ms" />
                        </p>
                    </div>
                </div>

                <form class="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2"
                    @submit.prevent="send">
                    <button type="button" aria-label="Attach file" class="text-gray-400 hover:text-primary-500">
                        <Icon name="icon-park-outline:plus" size="20" />
                    </button>
                    <input ref="inputEl" v-model="draft" type="text" placeholder="Type a message"
                        class="min-w-0 flex-1 text-body-xs outline-none placeholder:text-gray-400" />
                    <button type="submit" aria-label="Send message" :disabled="!draft.trim()"
                        class="text-primary-500 transition-colors disabled:text-gray-300">
                        <Icon name="icon-park-outline:send" size="20" />
                    </button>
                </form>

                <NuxtLink to="/customer-service"
                    class="block border-t border-gray-200 bg-white py-2 text-center text-caption-s text-primary-500 hover:underline"
                    @click="closeChat">
                    Conversations
                </NuxtLink>
            </section>
        </Transition>
    </div>
</template>