import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
	// posto je ovo POST, treba nam body da ga procitamo
	const body = await readBody(event)

	// console.log(process.env.STRIPE_SK_KEY)

	const stripe = new Stripe(process.env.STRIPE_SK_KEY)

	return await stripe.paymentIntents.create({
		amount: Number(body.amount),
		currency: 'usd',
		automatic_payment_methods: {
			enabled: true,
		},
	})
})
