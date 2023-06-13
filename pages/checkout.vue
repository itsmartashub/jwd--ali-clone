<template>
	<MainLayout>
		<div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
			<div class="md:flex gap-4 justify-between mx-auto w-full">
				<div class="md:w-[65%]">
					<div class="bg-white rounded-lg p-4">
						<div class="text-xl font-semibold mb-2">
							Shipping Address
						</div>

						<!-- <div v-if="false"> -->
						<div v-if="currentAddress && currentAddress.data">
							<NuxtLink
								to="/address"
								class="flex items-center pb-2 text-blue-500 hover:text-red-400">
								<Icon name="mdi:plus" size="18" class="mr-2" />
								Update Address
							</NuxtLink>

							<div class="pt-2 border-t">
								<div class="underline pb-1">
									Delivery Address
								</div>
								<ul class="text-xs">
									<li class="flex items-center gap-2">
										<div>Contact name:</div>
										<div class="font-bold">
											{{ currentAddress.data.name }}
										</div>
									</li>
									<li class="flex items-center gap-2">
										<div>Address:</div>
										<div class="font-bold">
											{{ currentAddress.data.address }}
										</div>
									</li>
									<li class="flex items-center gap-2">
										<div>Zip Code:</div>
										<div class="font-bold">
											{{ currentAddress.data.zipcode }}
										</div>
									</li>
									<li class="flex items-center gap-2">
										<div>City:</div>
										<div class="font-bold">
											{{ currentAddress.data.city }}
										</div>
									</li>
									<li class="flex items-center gap-2">
										<div>Country:</div>
										<div class="font-bold">
											{{ currentAddress.data.country }}
										</div>
									</li>
								</ul>
							</div>
						</div>

						<NuxtLink
							v-else
							to="/address"
							class="flex items-center text-blue-500 hover:text-red-400">
							<Icon name="mdi:plus" size="18" class="mr-2" />
							Add New Address
						</NuxtLink>
					</div>

					<div id="Items" class="bg-white rounded-lg p-4 mt-4">
						<!-- <div v-for="product in products"> -->
						<div v-for="product in userStore.checkout">
							<CheckoutItem :product="product" />
						</div>
					</div>
				</div>

				<div class="md:hidden block my-4" />

				<div class="md:w-[35%]">
					<div id="PlaceOrder" class="bg-white rounded-lg p-4">
						<div class="text-2xl font-extrabold mb-2">Summary</div>

						<div class="flex items-center justify-between my-4">
							<div class="">Total Shipping</div>
							<div class="">Free</div>
						</div>

						<div class="border-t" />

						<div class="flex items-center justify-between my-4">
							<div class="font-semibold">Total</div>
							<div class="text-2xl font-semibold">
								$
								<span class="font-extrabold">{{
									total / 100
								}}</span>
							</div>
						</div>

						<form @submit.prevent="pay()">
							<div
								class="border border-gray-500 p-2 rounded-sm"
								id="card-element" />

							<p
								id="card-error"
								role="alert"
								class="text-red-700 text-center font-semibold" />

							<button
								:disabled="isProcessing"
								type="submit"
								class="mt-4 bg-gradient-to-r from-[#FE630C] to-[#FF3200] w-full text-white text-[21px] font-semibold p-1.5 rounded-full"
								:class="
									isProcessing ? 'opacity-70' : 'opacity-100'
								">
								<Icon
									v-if="isProcessing"
									name="eos-icons:loading" />
								<div v-else>Place order</div>
							</button>
						</form>
					</div>

					<div class="bg-white rounded-lg p-4 mt-4">
						<div class="text-lg font-semibold mb-2 mt-2">
							AliExpress
						</div>
						<p class="my-2">
							AliExpress keeps your information and payment safe
						</p>
					</div>
				</div>
			</div>
		</div>
	</MainLayout>
</template>

<script setup>
import MainLayout from '~/layouts/MainLayout.vue'
import { useUserStore } from '~/stores/user'
const userStore = useUserStore()
const user = useSupabaseUser()
const route = useRoute()

// definePageMeta({ middleware: ['auth'] })
definePageMeta({ middleware: 'auth' })
/* 
	ELEM RECE JOHN DA MOZEMO DA REFACTORISEMO OVAJ WATHCEFFECTS I STAVIM OGA U MIDDLEWARE WTF, ALI JA NE RAZUMEM. ON JE KAO TO ZAB DA URADI< ALI KAO RADI I OVAKO 

	if (route.fullPath == '/checkout' && !user.value) {
			return navigateTo('/auth')
		}
		
	i u auth.vue isto njegov watchEffects...
*/

let stripe = null
let elements = null
let card = null
let form = null
let total = ref(0)
let clientSecret = null
let currentAddress = ref(null)
let isProcessing = ref(false)
let successMessage = ref('')
let errorMessage = ref('')

onBeforeMount(async () => {
	// znaci ako je checkout lista prazna, naviguj nazad u shoppingcart, jer nema potrebe da ide na checkout kad nema itema
	if (userStore.checkout.length < 1) {
		return navigateTo('/shoppingcart')
	}

	total.value = 0.0

	// ako je korisnik ulogovan, dohvati mu trenutnu adresu iz backenda
	if (user.value) {
		currentAddress.value = await useFetch(
			`/api/prisma/get-address-by-user/${user.value.id}`
		)
		setTimeout(() => (userStore.isLoading = false), 200)
	}
})

watchEffect(() => {
	// ako smo na checkout stranici i ako user nije ulogovan, vrati ga na auth stranicu
	if (route.fullPath == '/checkout' && !user.value) {
		return navigateTo('/auth')
	}
})

onMounted(async () => {
	isProcessing.value = true

	userStore.checkout.forEach((item) => {
		total.value += item.price
	})
})

watch(
	() => total.value,
	() => {
		if (total.value > 0) {
			stripeInit()
		}
	}
)

const stripeInit = async () => {
	const runtimeConfig = useRuntimeConfig()
	// stripe = Stripe(`${runtimeConfig.stripePk}`)
	stripe = Stripe(runtimeConfig.public.stripePk)

	// idemo da napravimo ovaj endpoint u nasem serveru. MOram da vidim zasto ovde koristimo $fetch a ne useFetch
	let res = await $fetch('/api/stripe/paymentintent', {
		method: 'POST',
		body: {
			amount: total.value,
		},
	})

	// ovo ce biti result of payment intent-a
	clientSecret = res.client_secret

	elements = stripe.elements()
	// elements = stripe.elements({ clientSecret })

	var style = {
		base: {
			fontSize: '18px',
		},
		invalid: {
			fontFamily: 'Arial, sans-serif',
			color: '#EE4B2B',
			iconColor: '#EE4B2B',
		},
	}
	card = elements.create('card', {
		hidePostalCode: true,
		style: style,
	})

	// Stripe injects an iframe into the DOM
	card.mount('#card-element')
	card.on('change', function (event) {
		// Disable the Pay button if there are no card details in the Element
		document.querySelector('button').disabled = event.empty
		document.querySelector('#card-error').textContent = event.error
			? event.error.message
			: ''
	})

	isProcessing.value = false
}

const pay = async () => {
	// AKO NEMA ADRESE
	if (currentAddress.value && currentAddress.value.data == '') {
		showError('Please add shipping address')
		return // exit
	}

	// AKO IMA ADRESE

	isProcessing.value = true
	// ovaj clientSecret smo dobili iz naseg paymentintent-a
	let result = await stripe.confirmCardPayment(clientSecret, {
		payment_method: { card: card },
	})

	if (result.error) {
		// ERROR PART
		console.log('ERROR PART')

		showError(result.error.message)
		isProcessing.value = false
	} else {
		// SUCCESSFUL PART
		console.log('SUCCESSFUL PAYMENT')

		await createOrder(result.paymentIntent.id)

		if (successMessage.value == 'Item created successfully') {
			console.log('ORDER IS COMPLETE')
			userStore.cart = [] // clear the cart
			userStore.checkout = [] // clear the checkout
			setTimeout(() => {
				return navigateTo('/success') // navigiramo do /success page
			}, 500)
		}

		/* BITNO !!!!!!
		u nekim instancama korpa se cleared out PRE nego sto se payment odradi, pa treba da vratimo iz api naseg response koji kaze: "The order is uncomplete" i mozes da nastavis sa clearing the cart.
		On je ovo resio tako sto je userStore.cart = []  i userStore.checkout = [] prebacio dole u setTimeout, ali tako nikako ne treba raditi, pogotovo ne u productionu, to je ostavio nama da uradimo. AL ja nzm kako iako je kao obj. 
		To sve jer recimo bude bagova tipa dodamo 3 itema u cart, i odradi se payment i sve super, al kad odemo u Orders (history) prikazan je samo 1 fazon.
		
		DAKLE, NEKI ITEMI SE CLEARED PRE NEGO STO JE REQUEST POSLAT STRIPE-u I SUPABASE API-u DA SE SACUVAJU PODACI!!! DA BISMO TO RESILI, IDEMO U API, I KADA JE SVE COMPLETED, THEN BACK TO THE RESPONSE FROM UR API SO U KNOW IT IS SAVED, SUCCESSFULLY, AND THEN CONTINOUE THE PROCESS */
		// userStore.cart = [] // clear the cart
		// userStore.checkout = [] // clear the checkout
		// setTimeout(() => {
		// 	return navigateTo('/success') // navigiramo do /success page
		// }, 500)
	}
}

const createOrder = async (stripeId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await useFetch('/api/prisma/create-order', {
				method: 'POST',
				body: {
					userId: user.value.id,
					stripeId: stripeId,
					name: currentAddress.value.data.name,
					address: currentAddress.value.data.address,
					zipcode: currentAddress.value.data.zipcode,
					city: currentAddress.value.data.city,
					country: currentAddress.value.data.country,
					products: userStore.checkout,
				},
			})

			console.log(response)
			successMessage.value = 'Item created successfully'

			// resolve(true) // ovo je da bismo izbegli infinite load, zato moramo resolve na kraju uvek
			resolve(response)
		} catch (error) {
			errorMessage.value = 'An error occurred while creating the item'

			console.error('Error creating item:', error)
			reject(error)
		}
	})
}

const showError = (errorMsgText) => {
	let errorMsg = document.querySelector('#card-error')

	errorMsg.textContent = errorMsgText
	setTimeout(() => (errorMsg.textContent = ''), 4000)
}

/*
// TEST PRODUCTS, PRE PRAVLJENJA BACKENDA

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
