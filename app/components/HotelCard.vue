<script setup lang="ts">
withDefaults(defineProps<{
    hotel: {
        name: string
        image: string
        location: string
        tagline?: string
        room?: string
        ratingLabel?: string
        reviews?: string
        rating: string
        discount: string
        price: string
        left: string
        vip?: boolean
    }
    compact?: boolean
    to?: string
}>(), { compact: false, to: '#' })
</script>

<template>
    <article
        class="group relative flex flex-col gap-4 rounded-md border border-gray-300 bg-white p-3 shadow-sm transition duration-300 hover:shadow-lg sm:flex-row sm:gap-6"
        :class="compact ? 'sm:min-h-0 sm:gap-4 sm:p-2' : 'sm:min-h-75'">
        <div v-if="hotel.vip" class="pointer-events-none absolute -right-2 -top-2 z-20 h-32 w-32 overflow-hidden">
            <span
                class="absolute -right-9.5 top-6.5 w-42.5 rotate-45 bg-linear-to-b from-vip-light to-vip-dark py-1 text-center text-label-m text-white shadow-[0_3px_6px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]"
                style="clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%)">
                VIP Gifts
            </span>
        </div>

        <div class="relative h-70 w-full shrink-0 overflow-hidden rounded-sm bg-gray-300 sm:h-auto"
            :class="compact ? 'sm:h-58 sm:min-h-0 sm:w-44' : 'sm:min-h-69 sm:w-57.5'">
            <img :src="hotel.image" :alt="hotel.name"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <FavButton class="absolute left-3 top-3 z-10" :size="compact ? 'sm' : 'lg'" />
            <div class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-3"
                :class="compact ? 'h-9' : 'h-11'">
                <div class="flex gap-0.5 text-white/80">
                    <Icon v-for="n in 4" :key="n" name="icon-park-outline:sun-one" :size="compact ? 14 : 20" />
                </div>
                <div class="flex items-center gap-1.5 text-white/90">
                    <span class="rounded-[5px] border-2 border-white/80 px-1.5 font-bold leading-snug"
                        :class="compact ? 'text-[11px]' : 'text-[14px]'">{{ hotel.rating }}</span>
                    <Icon v-if="compact" name="icon-park-outline:thumbs-up" size="16" />
                </div>
            </div>
        </div>

        <!-- Info -->
        <div class="flex flex-1 flex-col justify-between gap-5 py-3 pr-3"
            :class="compact ? 'md:flex-col md:py-2 md:pr-2' : 'md:flex-row'">
            <div class="flex flex-col justify-between gap-4">
                <div>
                    <h3 :class="compact ? 'text-h6 font-bold' : 'text-h4'">{{ hotel.name }}</h3>
                    <ul class="text-body-s text-gray-500" :class="compact ? 'mt-1 space-y-0' : 'mt-4 space-y-3'">
                        <li class="flex items-center gap-2">
                            <Icon name="icon-park-outline:local-pin" :size="compact ? 14 : 20" />{{ hotel.location }}
                        </li>
                        <template v-if="!compact">
                            <li class="flex items-center gap-2">
                                <Icon name="icon-park-outline:cup" size="20" />Breakfast Included
                            </li>
                            <li class="flex items-center gap-4">
                                <span class="flex items-center gap-2">
                                    <Icon name="icon-park-outline:user" size="20" />1 Adult, 2 Children
                                </span>
                                <span class="flex items-center gap-2">
                                    <Icon name="icon-park-outline:time" size="20" />4 Nights
                                </span>
                            </li>
                        </template>
                    </ul>
                </div>
                <div v-if="!compact">
                    <p class="text-body-s text-gray-400">{{ hotel.tagline }}</p>
                    <p class="text-body-s">{{ hotel.room }}</p>
                    <p class="mt-2 flex items-center gap-1 text-h6">
                        {{ hotel.ratingLabel }}
                        <span class="text-body-xs font-normal text-gray-500">, {{ hotel.reviews }}</span>
                        <Icon name="icon-park-outline:down" size="18" />
                    </p>
                </div>
            </div>

            <!-- Price -->
            <div class="flex flex-col justify-end gap-1" :class="compact ? 'md:w-auto' : 'md:w-67.5 md:text-right'">
                <p class="flex items-baseline" :class="compact ? 'gap-2' : 'gap-6 md:justify-end'">
                    <span class="text-error-light" :class="compact ? 'order-2 text-body-xxs' : 'text-body-s'">{{
                        hotel.discount }}</span>
                    <span class="text-success-dark" :class="compact ? 'text-h6 font-bold text-black!' : 'text-h3'">{{
                        hotel.price }}</span>
                </p>
                <p class="text-body-s" :class="compact ? 'text-black' : 'text-gray-500'">Includes taxes and charges</p>
                <p class="flex items-center gap-1.5 text-body-xs text-success-dark"
                    :class="compact ? '' : 'md:justify-end'">
                    <Icon name="icon-park-outline:leaf" size="16" />Trip Sustainable Level, 5
                </p>
                <p class="flex items-center gap-1.5 text-body-xs text-error-light"
                    :class="compact ? '' : 'md:justify-end'">
                    <Icon name="icon-park-outline:attention" size="16" />{{ hotel.left }}
                </p>
                <NuxtLink :to="to"
                    class="mt-2 flex items-center gap-1 font-bold text-primary-500 after:absolute after:inset-0 hover:underline"
                    :class="compact ? 'text-label-m' : 'text-button-xl md:justify-end'">
                    See Availability
                    <Icon name="icon-park-outline:right" :size="compact ? 14 : 18" />
                </NuxtLink>
            </div>
        </div>
    </article>
</template>