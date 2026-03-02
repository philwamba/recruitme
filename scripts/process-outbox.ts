import { processPendingOutboxJobs } from '../src/lib/services/outbox'

async function main() {
    const results = await processPendingOutboxJobs()
    console.info(`Processed ${results.length} outbox job(s)`)
    for (const result of results) {
        console.info(`${result.id}: ${result.status}`)
    }
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})
