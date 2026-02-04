const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

module.exports = function (server, opts, done) {
	server.post('/', async (request, response) => {
		const consumer = await prisma.consumer.findUnique({
			where: { id: request.body.consumerId },
			select: { id: true },
		})
		if (!consumer)
			return response.code(400).send({ message: 'Invalid consumerId.' })

		const merchant = await prisma.merchant.findUnique({
			where: { id: request.body.merchantId },
			select: { id: true },
		})
		if (!merchant)
			return response.code(400).send({ message: 'Invalid merchantId.' })

		const products = await prisma.product.findMany({
			where: {
				id: { in: request.body.productIds },
				merchantId: request.body.merchantId
			},
			select: { id: true },
		})
		if (products.length !== request.body.productIds.length)
			return response.code(400).send({ message: 'Invalid productIds.' })

		if (!request.body.productCounts.every(productCount => productCount > 0))
			return response.code(400).send({ message: 'Invalid productCounts.' })

		const order = await prisma.order.create({
			data: {
				consumerId: request.body.consumerId,
				merchantId: request.body.merchantId,
				productIds: request.body.productIds,
				productCounts: request.body.productCounts
			}
		})

		return response.code(201).send(order)
	})

	server.get('/:id', async (request, response) => {
		const id = request.params.id
		const order = await prisma.order.findUnique({ where: { id } })
		return response.code(200).send(order)
	})

	server.get('/', async (request, response) => {
		const { consumerId, merchantId } = request.query
		const orders = await prisma.order.findMany({
			where: {
				consumerId: consumerId ?? undefined,
				merchantId: merchantId ?? undefined
			}
		})
		return response.code(200).send(orders)
	})

	done()
}