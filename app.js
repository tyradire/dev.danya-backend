require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middlewares/ErrorMiddleware')
const path = require('path')

const PORT = process.env.PORT || 3000

const app = express();

const urls = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://danya-frontend.ru',
    'http://dev.danya-frontend.ru',
    'https://danya-frontend.ru',
    'https://dev.danya-frontend.ru',
]

app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: urls
}))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }
}))
app.use('/api', router)


app.use(errorHandler)

const launch = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT)
    } catch (e) {
        console.log(e)
    }
}

launch()