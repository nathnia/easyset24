<script setup lang="ts">
const columns = [
    { title: 'About Us', links: ['Our Story', 'Work With Us', 'Press & Media', 'Privacy & Security'] },
    { title: 'We Offer', links: ['Trip Sponsorship', 'Last Minutes Flights', 'Best Deals', 'AI-Driven Search'] },
    { title: 'Headquarters', links: ['England', 'France', 'Canada', 'Iceland'] },
    { title: 'Travel Blogs', links: ['Bali Travel Guide', 'Sri Travel Guide', 'Peru Travel Guide', 'Swiss Travel Guide'] },
    { title: 'Activities', links: ['Tour Leading', 'Cruising & Sailing', 'Camping', 'Kayaking'] },
    { title: 'Service', links: ['Report Error', 'Ask Online', 'Travel Insurance'] },
]
const payments = ['logos:visa', 'logos:amex', 'logos:mastercard', 'logos:paypal']
const socials = ['linkedin', 'telegram', 'twitter', 'facebook', 'instagram']
const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=https://easyset24.example/app'
</script>

<template>
    <footer class="bg-background">
        <!-- App promo -->
        <div class="border-b border-gray-200">
            <div class="page-container flex flex-col justify-between gap-6 py-10 md:flex-row">
                <div>
                    <h2 class="text-h6 text-primary-500">Go Further With The EasySet24 App</h2>
                    <p class="mt-2 max-w-md text-body-xs">
                        Enjoy Savings On Chosen Hotels And Flights When You Book Through The EasySet24 Website.
                        Additionally, Earn One Key Cash For Every Booking Made Through The App.
                    </p>
                    <p class="mt-2 text-body-xs text-gray-500">Secured By Europe GTP</p>
                </div>

                <div class="flex flex-col gap-4">
                    <!-- App Store -->
                    <div class="flex items-center gap-4">
                        <a href="#"
                            class="flex h-10 w-30 items-center justify-center gap-2 rounded-md bg-black text-white">
                            <Icon name="simple-icons:apple" size="20" />
                            <span class="leading-none">
                                <span class="block text-[8px]">Download on the</span>
                                <span class="block text-label-m">App Store</span>
                            </span>
                        </a>
                        <img :src="qr" alt="App Store QR" class="h-10 w-10" />
                    </div>
                    <!-- Google Play -->
                    <div class="flex items-center gap-4">
                        <a href="#"
                            class="flex h-10 w-30 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white">
                            <Icon name="logos:google-play-icon" size="20" />
                            <span class="leading-none">
                                <span class="block text-[8px] text-gray-500">GET IT ON</span>
                                <span class="block text-label-m">Google Play</span>
                            </span>
                        </a>
                        <img :src="qr" alt="Google Play QR" class="h-10 w-10" />
                    </div>
                </div>
            </div>
        </div>

        <div class="page-container py-10">
            <!-- Link columns -->
            <div class="grid grid-cols-2 gap-8 md:flex md:justify-between">
                <div v-for="col in columns" :key="col.title">
                    <h3 class="text-label-m">{{ col.title }}</h3>
                    <ul class="mt-4 space-y-4">
                        <li v-for="l in col.links" :key="l">
                            <NuxtLink to="#" class="text-body-s text-gray-500 hover:text-primary-500">{{ l }}</NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Payments, socials, newsletter -->
            <div class="mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div class="flex gap-3">
                    <div v-for="p in payments" :key="p"
                        class="flex h-10 w-18 items-center justify-center rounded-md border border-gray-300 bg-white">
                        <Icon :name="p" size="30" />
                    </div>
                </div>

                <div class="flex gap-6 text-primary-500">
                    <a v-for="s in socials" :key="s" href="#" :aria-label="s">
                        <Icon :name="`simple-icons:${s}`" size="20" />
                    </a>
                </div>

                <form>
                    <label for="newsletter" class="mb-1 block text-caption-s">Email</label>
                    <div class="flex">
                        <div
                            class="flex w-full items-center gap-3 rounded-l-sm border border-gray-300 bg-white px-3 sm:w-72">
                            <Icon name="icon-park-outline:mail" size="18" class="text-gray-400" />
                            <input id="newsletter" type="email" placeholder="Enter Your Email"
                                class="w-full py-2.5 text-body-xs outline-none placeholder:text-gray-400" />
                        </div>
                        <button
                            class="rounded-r-sm bg-primary-500 px-5 text-button-l text-white hover:bg-primary-600">Subscribe</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Bottom bar -->
        <div class="bg-gray-300">
            <div
                class="page-container flex flex-col gap-3 py-4 text-body-xs md:flex-row md:items-center md:justify-between">
                <span class="flex items-center gap-2">
                    <Icon name="icon-park-outline:copyright" size="14" class="text-primary-500" /> Copyright EasySet24
                </span>
                <span class="flex items-center gap-2">
                    <Icon name="icon-park-outline:mail" size="14" class="text-primary-500" /> Easyset24@Gmail.Com
                </span>
                <span class="text-label-m">"EasySet24: Seamless Journeys, Unrivalled Travel Wisdom!"</span>
                <span class="flex items-center gap-2">
                    <Icon name="icon-park-outline:local-two" size="14" class="text-primary-500" /> 123 Oxford
                    Street,London
                </span>
                <span class="flex items-center gap-2">
                    <Icon name="icon-park-outline:phone-telephone" size="14" class="text-primary-500" /> +44 20 7123
                    4567
                </span>
            </div>
        </div>
    </footer>
</template>