import express from 'express'
import sequelize from './shared/database/database.js'
import { usersRouter } from './users/router.js'

const app = express()

app.disable('x-powered-by')
app.use(express.json())

// Liveness: el proceso responde (no toca la base de datos).
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' })
})

// Readiness: el pod solo recibe tráfico si la base de datos responde.
app.get('/ready', async (req, res) => {
    try {
        await sequelize.authenticate()
        res.status(200).json({ status: 'READY' })
    } catch (error) {
        console.error('readiness check failed', { message: error.message })
        res.status(503).json({ status: 'NOT_READY' })
    }
})

app.use('/api/users', usersRouter)

export { app }
