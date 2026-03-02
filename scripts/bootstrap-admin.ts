import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/security/password'

const prisma = new PrismaClient()

async function main() {
  const rawEmail = process.env.BOOTSTRAP_ADMIN_EMAIL
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD

  // Normalize first, then validate
  const email = (rawEmail ?? '').trim().toLowerCase()

  if (!email || !password) {
    throw new Error('BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error(`User already exists for ${email}`)
  }

  const adminUser = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
      emailVerified: new Date(),
      passwordChangedAt: new Date(),
    },
  })

  console.info(`Created admin user ${adminUser.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
