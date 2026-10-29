<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

useHead({ title: '404' })

const goHome = () => clearError({ redirect: '/' })
</script>

<template>
    <NuxtLayout name="checkout">
        <main>
            <section class="relative flex w-full flex-col items-center justify-center overflow-hidden bg-gray-700"
                style="min-height:443px;">
                <img src="https://picsum.photos/id/1018/1920/900" alt=""
                    class="absolute inset-0 h-full w-full object-cover" />
                <div class="absolute inset-0" style="background:rgba(0,0,0,0.3);" />

                <div class="relative flex flex-col items-center py-16 text-center">
                    <div aria-hidden="true"
                        style="font-size:140px;font-weight:700;line-height:1;color:rgba(255,255,255,0.4);">
                        404
                    </div>

                    <p class="mt-16 text-h5 font-semibold" style="color:rgba(255,255,255,0.9);">
                        The Page Was Not Found ,Sorry!
                    </p>

                    <button type="button" @click="goHome"
                        class="mt-9 inline-flex h-12 items-center gap-3 rounded-xs bg-primary-500 px-5 text-body-s font-semibold text-white transition-colors hover:bg-primary-600">
                        <Icon name="icon-park-outline:return" size="18" />
                        Return To Home Page
                    </button>
                </div>
            </section>
        </main>
    </NuxtLayout>
</template>