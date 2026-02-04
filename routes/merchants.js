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

		const counterparty = await fetch('https://api-staging.muralpay.com/api/counterparties',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + process.env.MURAL_API_KEY,
				accept: 'application/json',
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				counterparty: {
					type: 'business',
					name: merchant.name,
					email: 'user@example.com',
					physicalAddress: {
						address1: '1234 Apple St',
						address2: 'Unit A',
						country: 'US',
						subDivision: 'CO',
						city: 'Denver',
						postalCode: '80204'
					}
				}
			})
		})

		let payoutMethodBody = ''
		if (merchant.currency == 'USDC')
		{
			payoutMethodBody = JSON.stringify({
				payoutMethod: {
					type: 'usd',
					details: {
						type: 'usdDomestic',
						symbol: 'USD',
						accountType: 'CHECKING',
						transferType: 'ACH',
						bankAccountNumber: request.body.routingNumber,
						bankRoutingNumber: request.body.routingNumber,
						bankName: request.body.bankName,
					}
				}
			})
		}
		else if (merchant.currency == 'COP')
		{
			payoutMethodBody = JSON.stringify({
				payoutMethod: {
					type: 'cop',
					details: {
						type: 'copDomestic',
						symbol: 'COP',
						phoneNumber: request.body.phoneNumber,
						accountType: 'CHECKING',
						documentType: 'NATIONAL_ID',
						bankAccountNumber: request.body.routingNumber,
						bankRoutingNumber: request.body.routingNumber,
						transferType: 'ACH',
						bankName: request.body.bankName,
					}
				}
			})
		}

		const payoutMethod = await fetch('https://api-staging.muralpay.com/api/counterparties/' + counterparty.id + '/payout-methods',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + process.env.MURAL_API_KEY,
				accept: 'application/json',
				'content-type': 'application/json'
			},
			body: payoutMethodBody
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