const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

module.exports = function (server, opts, done) {
	server.post('/', async (request, response) => {
		const consumer = await prisma.consumer.create({
			data: {
				name:		request.body.name,
				currency:	request.body.currency
			}
		})
		return response.code(201).send(consumer)
	})

	server.get('/:id', async (request, response) => {
		const id = request.params.id
		const consumer = await prisma.consumer.findUnique({ where: { id } })
		return response.code(200).send(consumer)
	})

	server.get('/', async (request, response) => {
		const { name, currency } = request.query
		const consumers = await prisma.consumer.findMany({
			where: {
				name:		name ?? undefined,
				currency:	currency ?? undefined
			}
		})
		return response.code(200).send(consumers)
	})

	server.patch('/:id', async (request, response) => {
		const id = request.params.id
		const { name, currency } = request.body
		const consumer = await prisma.consumer.update({
			where: { id },
			data: { name, currency }
		})
		return response.code(200).send(consumer)
	})

	server.delete('/:id', async (request, response) => {
		const id = request.params.id
		await prisma.consumer.delete({ where: { id } })
		return response.code(204).send()
	})

	done()
}