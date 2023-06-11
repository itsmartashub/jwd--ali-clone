import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	let orders = await prisma.orders.findMany({
		where: { userId: Number(event.context.params.userId) },
		orderBy: { id: 'desc' }, // zelimo da poslednjeg dohvatimo prvo
		/*
        i posto je ovo Orders, a tu Order nosi sa sobom i OrderItems, takodje dohvatamo i taj relationship, a to radimo sa include. Ovako ih joinujemo sve zajedno, jer u OrderItem imamo relationship sa Product pa includujemo product. Dakle, Order, OrderItem i Products su povezani  */
		include: {
			orderItem: {
				include: {
					product: true,
				},
			},
		},
	})
})
