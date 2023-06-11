<template>
	<div class="fixed z-[-1] bg-[#f2f2f2] w-full h-[100vh]" />

	<NuxtPage />

	<MenuOverlay
		:class="[
			{
				'max-h-[100vh] transition-all duration-200 ease-in visible':
					userStore.isMenuOverlay,
			},
			{
				'max-h-0 transition-all duration-200 ease-out invisible':
					!userStore.isMenuOverlay,
			},
		]" />
</template>

<script setup>
import { useUserStore } from '~/stores/user'
const userStore = useUserStore()

const route = useRoute()

// na odredjenim velicinama ekrana zelimo da automatski zatvorimo ovaj overlay, on nam nece biti potreban na nekim velicinama ekrana, na desktopu recimo. Ovo je vise za mobile/tablet, tu ce biti hamburger menu, tj MenuOverlay
let windowWidth = ref(process.client ? window.innerWidth : '')

onMounted(() => {
	userStore.isLoading = false

	window.addEventListener('resize', function () {
		windowWidth.value = window.innerWidth
	})
})

watch(
	() => windowWidth.value,
	() => {
		if (windowWidth.value >= 767) {
			userStore.isMenuOverlay = false
		}
	}
)

// kad god se path promeni, zelimo da isLoading bude true
watch(
	() => route.fullPath,
	() => {
		userStore.isLoading = true
	}
)
</script>
