import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const body = await readBody(event)

	const res = await prisma.addresses.create({
		data: {
			userId: body.userId,
			name: body.name,
			address: body.address,
			zipcode: body.zipCode, // u frontu smo odabraliu markupu ovo jbg stavili da bude zipCode umesto zipcode
			city: body.city,
			country: body.country,
		},
	})

	return res
})
