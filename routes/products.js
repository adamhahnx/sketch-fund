const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

module.exports = function (server, opts, done) {
	server.post('/', async (request, response) => {
		if (request.body.price <= 0)
			return response.code(400).send({ message: 'Invalid price.' })

		const merchant = await prisma.merchant.findUnique({
			where: { id: request.body.merchantId },
			select: { id: true },
		})
		if (!merchant)
			return response.code(400).send({ message: 'Invalid merchantId.' })

		const product = await prisma.product.create({
			data: {
				name:		request.body.name,
				price:		request.body.price,
				merchantId:	request.body.merchantId
			}
		})
		return response.code(201).send(product)
	})

	server.get('/:id', async (request, response) => {
		const id = request.params.id
		const product = await prisma.product.findUnique({ where: { id } })
		return response.code(200).send(product)
	})

	server.get('/', async (request, response) => {
		const { name, price, merchantId } = request.query
		const products = await prisma.product.findMany({
			where: {
				name:		name ?? undefined,
				price:		price ?? undefined,
				merchantId:	merchantId ?? undefined
			}
		})
		return response.code(200).send(products)
	})

	server.patch('/:id', async (request, response) => {
		const id = request.params.id
		const { name, price } = request.body
		const product = await prisma.product.update({
			where: { id },
			data: { name, price }
		})
		return response.code(200).send(product)
	})

	server.delete('/:id', async (request, response) => {
		const id = request.params.id
		await prisma.product.delete({ where: { id } })
		return response.code(204).send()
	})

	done()
}