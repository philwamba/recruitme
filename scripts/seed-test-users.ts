import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/security/password'

const prisma = new PrismaClient()

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
    console.log('Seeding test users...\n')

    for (const testUser of TEST_USERS) {
        const passwordHash = await hashPassword(testUser.password)

        const user = await prisma.user.upsert({
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

        // Create applicant profile for applicants
        if (testUser.role === 'APPLICANT') {
            await prisma.applicantProfile.upsert({
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

        console.log(`Created ${testUser.role}: ${testUser.email}`)
    }

    console.log('\n--- Test User Credentials ---')
    console.log('Admin:     admin@recruitme.co.ke     / AdminPass123!')
    console.log('Employer:  employer@recruitme.co.ke  / EmployerPass123!')
    console.log('Applicant: applicant@recruitme.co.ke / ApplicantPass123!')
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
