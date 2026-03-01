import { PrismaClient, UserRole } from '@prisma/client'
import { getPermissionsForRole } from '../src/lib/security/permissions'

const prisma = new PrismaClient()

async function main() {
  for (const role of Object.values(UserRole)) {
    const permissions = getPermissionsForRole(role)

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role,
            permission,
          },
        },
        update: {},
        create: {
          role,
          permission,
        },
      })
    }
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
