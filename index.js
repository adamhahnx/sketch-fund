const fastify = require('fastify')
const fileSystem = require('fs')

const server = fastify({ logger: true })

server.addHook('onRequest', async (request, response) => {
	if (request.headers['key'] !== process.env.key ||
		request.headers['key'] === null ||
		!process.env.key)
		response.code(401).send({ error: 'Invalid key.' })
})

fileSystem.readdirSync('./routes/').forEach((routeName) => {
	server.register(
		require('./routes/' + routeName),
		{ prefix: '/' + routeName.slice(0, -3) }
	)
})

server.listen({ port: 3000, host: '0.0.0.0' })