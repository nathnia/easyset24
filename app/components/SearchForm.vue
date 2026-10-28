<script setup lang="ts">
const props = withDefaults(defineProps<{
    type?: 'hotel' | 'flight'
    place?: string
    vip?: string
}>(), { type: 'hotel' })

const configs = {
    hotel: {
        title: 'Where Is Your Next Dream Place?',
        subtitle: 'Find Exclusive Genius Rewards In Every Corner Of The World!',
        labels: ['Place', 'VIP', 'Passengers - Room Condition', 'Check In -Check Out'],
        icon: 'icon-park-outline:building-one',
        first: 'Gutenberg',
        secondOptions: ['Long Lasting', 'Loyalty Gifts'],
        second: 'Long Lasting',
        thirdOptions: ['One Room', 'Two Rooms', 'Three Rooms'],
        third: 'Two Rooms',
        button: 'Search',
        to: '/hotels/search',
    },
    flight: {
        title: 'Which Exciting Place Is Your Next Adventure Taking You?',
        subtitle: 'Discover Exclusive Genius Rewards Wherever Your Journey Takes You!',
        labels: ['From -To', 'Trip', 'Passengers - Flight Class', 'Departure -Return'],
        icon: 'icon-park-outline:airplane',
        first: 'Gutenberg - Istanbul',
        secondOptions: ['Two Way', 'One Way'],
        second: 'Two Way',
        thirdOptions: ['Economy', 'Premium Economy', 'Business', 'First'],
        third: 'Economy',
        button: 'Find Flights',
        to: '/flights/search',
    },
}
const c = configs[props.type]

const first = ref(props.place ?? c.first)
const second = ref(props.vip ?? c.second)
const third = ref(c.third)

function search() {
    if (c.to) navigateTo(c.to)
}

const field = 'flex h-[50px] items-center gap-3 border border-gray-300 bg-white px-3 text-body-s md:-ml-px md:first:ml-0'
const select = 'w-full appearance-none bg-transparent outline-none'
</script>

<template>
    <section class="page-container pt-4">
        <h1 class="text-h4 text-primary-500">{{ c.title }}</h1>
        <p class="mt-1 text-body-s text-primary-500">{{ c.subtitle }}</p>

        <form class="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:gap-0" @submit.prevent="search">
            <div class="md:flex-2">
                <label class="mb-1 block text-label-m">{{ c.labels[0] }}</label>
                <div :class="field">
                    <Icon :name="c.icon" size="22" class="shrink-0 text-gray-500" />
                    <input v-model="first" type="text" class="w-full outline-none" />
                </div>
            </div>

            <div class="md:flex-[1.4]">
                <label class="mb-1 block text-label-m">{{ c.labels[1] }}</label>
                <div :class="field">
                    <select v-model="second" :class="select">
                        <option v-for="o in c.secondOptions" :key="o">{{ o }}</option>
                    </select>
                    <Icon name="icon-park-outline:sort-two" size="20" class="shrink-0 text-primary-400" />
                </div>
            </div>

            <div class="md:flex-[2.6]">
                <label class="mb-1 block text-label-m">{{ c.labels[2] }}</label>
                <div :class="field">
                    <Icon name="icon-park-outline:user" size="22" class="shrink-0 text-primary-400" />
                    <span class="whitespace-nowrap">2 Adults - 3 Children</span>
                    <select v-model="third" :class="[select, 'ml-2']">
                        <option v-for="o in c.thirdOptions" :key="o">{{ o }}</option>
                    </select>
                    <Icon name="icon-park-outline:sort-two" size="20" class="shrink-0 text-primary-400" />
                </div>
            </div>

            <div class="md:flex-2">
                <label class="mb-1 block text-label-m">{{ c.labels[3] }}</label>
                <div :class="field">
                    <Icon name="icon-park-outline:calendar" size="22" class="shrink-0 text-primary-400" />
                    <span class="whitespace-nowrap">18 Dec 2023 - 23 Dec 2023</span>
                </div>
            </div>

            <button type="submit"
                class="h-12.5 bg-primary-500 px-10 text-button-xxl text-white hover:bg-primary-600 md:flex-[1.2]">
                {{ c.button }}
            </button>
        </form>
    </section>
</template>