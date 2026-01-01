
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'test@test.pl'
    console.log(`Checking user: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email },
        include: { organization: true }
    })

    if (!user) {
        console.log('User not found!')
        return
    }

    console.log(`User found. Org ID: ${user.organizationId}`)

    if (!user.organizationId) {
        console.log('Organization missing. Attempting to link to default organization...')

        // Check if an org exists or create one
        let org = await prisma.organization.findFirst({
            where: { name: 'Ekovoltis Client' }
        })

        // Fallback to ANY organization if specific one not found
        if (!org) {
            org = await prisma.organization.findFirst()
        }

        if (!org) {
            console.log('Creating new organization...')
            org = await prisma.organization.create({
                data: {
                    name: 'Ekovoltis Client',
                    type: 'CLIENT',
                    nip: '1234567890'
                }
            })
        }

        // Link user
        await prisma.user.update({
            where: { id: user.id },
            data: { organizationId: org.id }
        })
        console.log(`User linked to organization: ${org.name} (${org.id})`)
    } else {
        console.log('User already has an organization.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
