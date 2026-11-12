import request from 'supertest'
import { app } from './app.js'
import User from './users/model.js'
import sequelize from './shared/database/database.js'

describe('Health endpoints', () => {
    afterEach(() => jest.restoreAllMocks())

    test('GET /health responds UP without touching the database', async () => {
        const spy = jest.spyOn(sequelize, 'authenticate')
        const response = await request(app).get('/health')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: 'UP' })
        expect(spy).not.toHaveBeenCalled()
    })

    test('GET /ready responds READY when the database is reachable', async () => {
        jest.spyOn(sequelize, 'authenticate').mockResolvedValue()
        const response = await request(app).get('/ready')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: 'READY' })
    })

    test('GET /ready responds 503 when the database is down', async () => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn())
        jest.spyOn(sequelize, 'authenticate').mockRejectedValue(new Error('down'))
        const response = await request(app).get('/ready')

        expect(response.status).toBe(503)
        expect(response.body).toEqual({ status: 'NOT_READY' })
    })
})

describe('Users API', () => {
    const data = { dni: '1234567890', name: 'Test' }

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn())
    })

    afterEach(() => jest.restoreAllMocks())

    test('Get users', async () => {
        jest.spyOn(User, 'findAll').mockResolvedValue([data])
        const response = await request(app).get('/api/users')

        expect(response.status).toBe(200)
        expect(response.body).toEqual([data])
    })

    test('Get users returns 500 on unexpected error', async () => {
        jest.spyOn(User, 'findAll').mockRejectedValue(new Error('boom'))
        const response = await request(app).get('/api/users')

        expect(response.status).toBe(500)
        expect(response.body).toEqual({ error: 'Internal Server Error' })
    })

    test('Get user', async () => {
        jest.spyOn(User, 'findByPk').mockResolvedValue({ ...data, id: 1 })
        const response = await request(app).get('/api/users/1')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ ...data, id: 1 })
    })

    test('Get user returns 404 when it does not exist', async () => {
        jest.spyOn(User, 'findByPk').mockResolvedValue(null)
        const response = await request(app).get('/api/users/99')

        expect(response.status).toBe(404)
        expect(response.body).toEqual({ error: 'User not found: 99' })
    })

    test('Get user returns 400 when the id is not numeric', async () => {
        const response = await request(app).get('/api/users/abc')

        expect(response.status).toBe(400)
        expect(response.body.errors).toHaveLength(1)
    })

    test('Get user returns 500 on unexpected error', async () => {
        jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('boom'))
        const response = await request(app).get('/api/users/1')

        expect(response.status).toBe(500)
    })

    test('Create user', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null)
        jest.spyOn(User, 'create').mockResolvedValue({ ...data, id: 1 })
        const response = await request(app).post('/api/users').send(data)

        expect(response.status).toBe(201)
        expect(response.body).toEqual({ ...data, id: 1 })
    })

    test('Create user returns 400 when the dni already exists', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue({ ...data, id: 1 })
        const response = await request(app).post('/api/users').send(data)

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: 'User already exists: 1234567890' })
    })

    test('Create user returns 400 when the body is invalid', async () => {
        const response = await request(app).post('/api/users').send({ name: 'Only name' })

        expect(response.status).toBe(400)
        expect(response.body.errors[0].path).toBe('body.dni')
    })

    test('Create user returns 500 on unexpected error', async () => {
        jest.spyOn(User, 'findOne').mockRejectedValue(new Error('boom'))
        const response = await request(app).post('/api/users').send(data)

        expect(response.status).toBe(500)
    })
})
