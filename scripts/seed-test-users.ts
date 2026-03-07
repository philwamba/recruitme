import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/security/password'

const prisma = new PrismaClient()

const ALLOW_TEST_SEED = process.env.ALLOW_TEST_SEED === 'true'
const SHOW_SECRETS = process.env.SHOW_SECRETS === 'true' || process.argv.includes('--show-secrets')

const TEST_USERS = [
    {
        email: 'admin@recruitme.co.ke',
        password: 'AdminPass123!',
        role: 'ADMIN' as const,
        firstName: 'Admin',
        lastName: 'User',
    },
    {
        email: 'employer@recruitme.co.ke',
        password: 'EmployerPass123!',
        role: 'EMPLOYER' as const,
        firstName: 'Employer',
        lastName: 'User',
    },
    {
        email: 'applicant@recruitme.co.ke',
        password: 'ApplicantPass123!',
        role: 'APPLICANT' as const,
        firstName: 'Applicant',
        lastName: 'User',
    },
]

async function main() {
    if (!ALLOW_TEST_SEED) {
        console.error('ERROR: Refusing to seed test users without explicit opt-in.')
        console.error('Set ALLOW_TEST_SEED=true to run this script.')
        process.exit(1)
    }

    console.log('Seeding test users...\n')

    for (const testUser of TEST_USERS) {
        const passwordHash = await hashPassword(testUser.password)

        await prisma.$transaction(async tx => {
            const user = await tx.user.upsert({
                where: { email: testUser.email },
                update: {
                    passwordHash,
                    role: testUser.role,
                    emailVerified: new Date(),
                },
                create: {
                    email: testUser.email,
                    passwordHash,
                    role: testUser.role,
                    emailVerified: new Date(),
                },
            })

            if (testUser.role === 'APPLICANT') {
                await tx.applicantProfile.upsert({
                    where: { userId: user.id },
                    update: {
                        firstName: testUser.firstName,
                        lastName: testUser.lastName,
                    },
                    create: {
                        userId: user.id,
                        firstName: testUser.firstName,
                        lastName: testUser.lastName,
                        skills: ['JavaScript', 'TypeScript', 'React'],
                    },
                })
            }
        })

        console.log(`Created ${testUser.role}: ${testUser.email}`)
    }

    console.log('\n--- Test Users Created ---')
    console.log('Admin:     admin@recruitme.co.ke')
    console.log('Employer:  employer@recruitme.co.ke')
    console.log('Applicant: applicant@recruitme.co.ke')

    if (SHOW_SECRETS) {
        console.log('\n--- Credentials (SHOW_SECRETS enabled) ---')
        for (const user of TEST_USERS) {
            console.log(`${user.role}: ${user.email} / ${user.password}`)
        }
    } else {
        console.log('\nTo show passwords, run with --show-secrets or SHOW_SECRETS=true')
    }
    console.log('------------------------------\n')
}

main()
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
