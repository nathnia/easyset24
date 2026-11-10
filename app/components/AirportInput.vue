<script setup lang="ts">
import { useAirportsStore } from '~/stores/airports'
import { airportLabel, searchAirports } from '~/utils/airports'
import type { Airport } from '~/utils/airports'

// v-model is the IATA code ("ARN"), the box shows "ARN - Stockholm"
const props = defineProps<{ modelValue: string; label: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [code: string] }>()

const store = useAirportsStore()
const text = ref('')
const open = ref(false)
const typed = ref(false)
const focused = ref(false)
const active = ref(0)

const labelFor = (code: string) => {
    const a = store.find(code)
    return a ? airportLabel(a) : code
}

// keep the box in sync with the code (also once the airport list arrives)
watch([() => props.modelValue, () => store.list], () => {
    if (!focused.value) text.value = labelFor(props.modelValue)
}, { immediate: true })

const results = computed(() => (typed.value ? searchAirports(store.list, text.value) : []))

// message shown when there is nothing to list
const emptyText = computed(() => {
    if (store.loading) return 'Loading airports...'
    if (store.list.length) return 'No airport found.'
    return 'Type a 3-letter airport code.'
})

// "Stockholm, Arlanda"
const detail = (a: Airport) => [a.city, a.name].filter(Boolean).join(', ')

function onFocus(e: FocusEvent) {
    focused.value = true
    store.fetchAirports()
        ; (e.target as HTMLInputElement).select()
}

function onInput() {
    typed.value = true
    open.value = true
    active.value = 0
}

function pick(a: Airport) {
    emit('update:modelValue', a.code)
    text.value = airportLabel(a)
    typed.value = false
    open.value = false
}

function onBlur() {
    focused.value = false
    open.value = false
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
</script>

<template>
    <div class="relative min-w-0 flex-1">
        <input v-model="text" type="text" :placeholder="placeholder" :aria-label="label" autocomplete="off"
            role="combobox" :aria-expanded="open" class="w-full min-w-0 outline-none" @focus="onFocus" @input="onInput"
            @blur="onBlur" @keydown="onKey" />

        <ul v-if="open && typed" role="listbox"
            class="absolute left-0 top-full z-50 mt-4 max-h-72 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            <li v-for="(a, i) in results" :key="a.code" role="option" :aria-selected="i === active">
                <button type="button" tabindex="-1" :class="['flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-body-xs',
                    i === active ? 'bg-primary-500 text-white' : 'hover:bg-gray-100']" @mousedown.prevent="pick(a)"
                    @mouseenter="active = i">
                    <b class="w-9 shrink-0">{{ a.code }}</b>
                    <span class="min-w-0 flex-1 truncate">{{ detail(a) }}</span>
                    <span v-if="a.country" class="shrink-0 text-caption-s opacity-70">{{ a.country }}</span>
                </button>
            </li>
            <li v-if="!results.length" class="px-3 py-3 text-body-xs text-gray-500">
                {{ emptyText }}
            </li>
        </ul>
    </div>
</template>