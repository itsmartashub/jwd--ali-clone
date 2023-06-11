import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
	state: () => ({
		isMenuOverlay: false,
		isLoading: false,
		cart: [],
		checkout: [],
	}),
	persist: true, // ovo je pinia plugin persist state package koja ga aktivira

	// sad idemo ovo da importujemo u MainLayout.js
})
