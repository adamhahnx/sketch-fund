const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

module.exports = function (server, opts, done) {
	server.post('/', async (request, response) => {
		const merchant = await prisma.merchant.create({
			data: {
				name:		request.body.name,
				currency:	request.body.currency,
			}
		})

		return response.code(201).send(merchant)
	})

	server.get('/:id', async (request, response) => {
		const id = request.params.id
		const merchant = await prisma.merchant.findUnique({ where: { id } })
		return response.code(200).send(merchant)
	})

	server.get('/', async (request, response) => {
		const { name, currency } = request.query
		const merchants = await prisma.merchant.findMany({
			where: {
				name:		name ?? undefined,
				currency:	currency ?? undefined
			}
		})
		return response.code(200).send(merchants)
	})

	server.patch('/:id', async (request, response) => {
		const id = request.params.id
		const { name, currency } = request.body
		const merchant = await prisma.merchant.update({
			where: { id },
			data: { name, currency }
		})
		return response.code(200).send(merchant)
	})

	server.delete('/:id', async (request, response) => {
		const id = request.params.id
		await prisma.product.deleteMany({
			where: { merchantId: id }
		})
		await prisma.merchant.delete({ where: { id } })
		return response.code(204).send()
	})

	done()
}