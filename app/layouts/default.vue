<template>
    <div class="flex min-h-screen flex-col">
        <AppNavbar />
        <SupportBubble />
        <main class="flex-1">
            <slot />
        </main>
        <AppFooter />
    </div>
</template>