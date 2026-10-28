<script setup lang="ts">
const u = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const base = { name: 'Radisson Blu', location: 'La Kalsa, Palermo', rating: '8,2', left: 'We Have 8 Left At 12% Off' }
const hotels = [
    { ...base, image: u('1566073771259-6a8506099945'), price: '$140', discount: '16% Off' },
    { ...base, image: u('1582719508461-905c673771fd'), price: '$135', discount: '12% Off' },
    { ...base, image: u('1445019980597-93fa8acb246c'), price: '$110', discount: '12% Off' },
    { ...base, image: u('1520250497591-112f2f40a3f4'), price: '$145', discount: '12% Off' },
    { ...base, image: u('1584132967334-10e028bd69f7'), price: '$160', discount: '12% Off' },
]
</script>

<template>
    <div>
        <section class="page-container py-14">
            <h1 class="text-h4 font-bold">Hotel Favourites</h1>
            <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <HotelCard v-for="(h, i) in hotels" :key="i" :hotel="h" compact to="/fully-booked" />
            </div>
        </section>

    </div>
</template>