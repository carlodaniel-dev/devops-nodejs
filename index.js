import { app } from './app.js'
import sequelize from './shared/database/database.js'
import './users/model.js'

const PORT = Number(process.env.PORT) || 8000

if (process.env.DB_SYNC === 'true') {
    await sequelize.sync()
    console.log('db schema synced')
}

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// Apagado ordenado: Kubernetes envía SIGTERM antes de matar el pod.
const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`)
    server.close(async () => {
        await sequelize.close()
        process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
