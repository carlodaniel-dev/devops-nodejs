
import sequelize from '../shared/database/database.js'
import '../users/model.js'

const LOCK_ID = 727274
const MAX_ATTEMPTS = 30
const WAIT_MS = 2000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForDatabase = async () => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            await sequelize.authenticate()
            return
        } catch (error) {
            console.log(`database not ready (${attempt}/${MAX_ATTEMPTS}): ${error.message}`)
            await sleep(WAIT_MS)
        }
    }
    throw new Error('database not reachable')
}

try {
    await waitForDatabase()
    await sequelize.transaction(async (transaction) => {
        await sequelize.query('SELECT pg_advisory_xact_lock(:id)', {
            replacements: { id: LOCK_ID },
            transaction
        })
        await sequelize.sync({ transaction })
    })
    console.log('migration finished')
    await sequelize.close()
} catch (error) {
    console.error('migration failed', error)
    process.exit(1)
}
