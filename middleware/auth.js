export default defineNuxtRouteMiddleware((from, to) => {
	// korinsnik koji je ulogovan dohvatamo iz supabase
	const user = useSupabaseUser()

	// ako korisnik nije ulogovan i ako je trenutna strannica /checkout, zelimo da ga navigiramo na /auth
	if (!user.value && to.fullPath == '/checkout') {
		return navigateTo('/auth')
	}
})

// dodajemo ovaj middleware u pages/checkout.vue
