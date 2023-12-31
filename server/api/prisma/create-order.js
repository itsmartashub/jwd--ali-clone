import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	// posto ce ovo biti POST, terbace nam body
	const body = await readBody(event)

	const order = await prisma.orders.create({
		data: {
			userId: body.userId,
			stripeId: body.stripeId,
			name: body.name,
			address: body.address,
			zipcode: body.zipcode,
			city: body.city,
			country: body.country,
		},
	})

	// console.log(event)

	// u zavisnosti od toga koliko ovaj nas order ima itema, takodje moramo da apdejtujemo i nas OrderItem table. Joinujemo order i order items zajedno
	body.products.forEach(async (prod) => {
		let prismaRes = await prisma.orderItem.create({
			data: {
				orderId: order.id,
				productId: Number(prod.id),
			},
		})
		// console.log(prismaRes)
	})

	return order
})
