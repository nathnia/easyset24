<script setup lang="ts">
import { useAirportsStore } from '~/stores/airports'
import type { Airport } from '~/utils/airports'

// v-model is the IATA code ("ARN"); the box shows "ARN - Stockholm".
// Suggestions come from the server as you type (debounced).
const props = defineProps<{ modelValue: string; label: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [code: string] }>()

const store = useAirportsStore()
const text = ref('')
const open = ref(false)
const typed = ref(false)
const focused = ref(false)
const active = ref(0)
const results = ref<Airport[]>([])
const status = ref<'idle' | 'loading' | 'done' | 'failed'>('idle')

let timer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

// the box shows the city ("Stockholm"); the code is in the suggestions
const nameOf = (a: Airport) => a.city || a.name || a.code
const labelFor = (code: string) => {
    const a = store.known[code]
    return a ? nameOf(a) : code
}

// keep the box in sync with the code, and look up its name if we only have the code
watch(() => props.modelValue, (code) => {
    if (code && !store.known[code]) store.lookup(code)
}, { immediate: true })

watch([() => props.modelValue, () => store.known[props.modelValue]], () => {
    if (!focused.value) text.value = labelFor(props.modelValue)
}, { immediate: true })

const emptyText = computed(() => {
    if (status.value === 'loading') return 'Searching...'
    if (status.value === 'failed') return 'Could not load airports. Type a 3-letter code.'
    if (text.value.trim().length < 2) return 'Type at least 2 characters.'
    return 'No airport found.'
})

const detail = (a: Airport) => [a.city, a.name].filter(Boolean).join(', ')

function runSearch() {
    const q = text.value.trim()
    if (q.length < 2) {
        status.value = 'idle'
        return
    }
    const id = ++requestId
    store.search(q).then((list) => {
        if (id !== requestId) return // a newer search replaced this one
        results.value = list ?? []
        status.value = list === null ? 'failed' : 'done'
        active.value = 0
    })
}

function onInput() {
    typed.value = true
    open.value = true
    active.value = 0
    results.value = []
    requestId++
    clearTimeout(timer)
    status.value = text.value.trim().length >= 2 ? 'loading' : 'idle'
    timer = setTimeout(runSearch, 250)
}

function onFocus(e: FocusEvent) {
    focused.value = true
        ; (e.target as HTMLInputElement).select()
}

function pick(a: Airport) {
    clearTimeout(timer)
    requestId++
    emit('update:modelValue', a.code)
    text.value = nameOf(a)
    typed.value = false
    open.value = false
}

function onBlur() {
    focused.value = false
    open.value = false
    clearTimeout(timer)
    const t = text.value.trim()
    if (typed.value) {
        if (/^[A-Za-z]{3}$/.test(t)) emit('update:modelValue', t.toUpperCase())
        else if (!t) emit('update:modelValue', '')
    }
    typed.value = false
    nextTick(() => { text.value = labelFor(props.modelValue) })
}

function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && results.value.length) {
        e.preventDefault()
        active.value = (active.value + 1) % results.value.length
    } else if (e.key === 'ArrowUp' && results.value.length) {
        e.preventDefault()
        active.value = (active.value - 1 + results.value.length) % results.value.length
    } else if (e.key === 'Enter' && open.value && results.value[active.value]) {
        e.preventDefault() // don't submit the search form
        pick(results.value[active.value]!)
    } else if (e.key === 'Escape') {
        open.value = false
    }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
    <div class="relative min-w-0 flex-1">
        <input v-model="text" type="text" :placeholder="placeholder" :aria-label="label" autocomplete="off"
            role="combobox" :aria-expanded="open" class="w-full min-w-0 text-ellipsis outline-none" @focus="onFocus"
            @input="onInput" @blur="onBlur" @keydown="onKey" />

        <ul v-if="open && typed" role="listbox"
            class="absolute left-0 top-full z-50 mt-4 max-h-72 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            <li v-for="(a, i) in results" :key="a.code" role="option" :aria-selected="i === active">
                <button type="button" tabindex="-1" :class="['flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-body-xs',
                    i === active ? 'bg-primary-500 text-white' : 'hover:bg-gray-100']" @mousedown.prevent="pick(a)"
                    @mouseenter="active = i">
                    <b class="w-9 shrink-0">{{ a.code }}</b>
                    <span class="min-w-0 flex-1 truncate">{{ detail(a) }}</span>
                    <span v-if="a.country" class="max-w-24 shrink-0 truncate text-caption-s opacity-70">{{ a.country
                        }}</span>
                </button>
            </li>
            <li v-if="!results.length" class="px-3 py-3 text-body-xs text-gray-500">{{ emptyText }}</li>
        </ul>
    </div>
</template>