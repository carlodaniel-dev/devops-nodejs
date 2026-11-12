import { Sequelize } from 'sequelize'

const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'devops',
    DB_USER = 'postgres',
    DB_PASSWORD = ''
} = process.env

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    dialect: 'postgres',
    host: DB_HOST,
    port: Number(DB_PORT),
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
})

export default sequelize
