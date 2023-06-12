<template>
	<MainLayout>
		<main id="IndexPage" class="mt-4 max-w-[1200px] mx-auto px-2">
			<section
				class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
				<div
					v-if="products"
					v-for="product in products.data"
					:key="product">
					<ProductComponent :product="product" />
				</div>
				<!-- <div v-if="products" v-for="product in products" :key="product">
					{{ product }}
					<ProductComponent :product="product" />
				</div> -->
			</section>
		</main>
	</MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import { useUserStore } from '~/stores/user'
const userStore = useUserStore()

let products = ref(null)

onBeforeMount(async () => {
	products.value = await useFetch('/api/prisma/get-all-products')
	setTimeout(() => (userStore.isLoading = false), 1000)
})

/*
// FOR TEST PURPOSE ONLY

const products = [
	{
		id: 1,
		title: 'Title 1',
		description: 'This is a description',
		url: 'https://picsum.photos/id/7/800/800',
		price: 9999, // ovo nije 99.99 jer Stripe ne podrzava tacku, pa cemo zapravo da delimo sa 100!!!
	},
	{
		id: 2,
		title: 'Title 2',
		description: 'This is a description',
		url: 'https://picsum.photos/id/67/800/800',
		price: 9999,
	},
	{
		id: 3,
		title: 'Title 3',
		description: 'This is a description',
		url: 'https://picsum.photos/id/13/800/800',
		price: 9999,
	},
	{
		id: 4,
		title: 'Title 2',
		description: 'This is a description',
		url: 'https://picsum.photos/id/32/800/800',
		price: 9999,
	},
	{
		id: 5,
		title: 'Title 2',
		description: 'This is a description',
		url: 'https://picsum.photos/id/61/800/800',
		price: 9999,
	},
	{
		id: 6,
		title: 'Title 2',
		description: 'This is a description',
		url: 'https://picsum.photos/id/89/800/800',
		price: 9999,
	},
	{
		id: 7,
		title: 'Title 2',
		description: 'This is a description',
		url: 'https://picsum.photos/id/1/800/800',
		price: 9999,
	},
	{
		id: 8,
		title: 'Title 2',
		description: 'This is a description',
		url: 'https://picsum.photos/id/42/800/800',
		price: 9999,
	},
	{
		id: 9,
		title: 'Title 2',
		description: 'This is a description',
		url: 'https://picsum.photos/id/34/800/800',
		price: 9999,
	},
] */
</script>
