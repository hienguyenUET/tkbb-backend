require('./setup')

const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require('cors')
const config = require('config')
const expressListEndpoints = require('express-list-endpoints')
const bullBoard = require('bull-board')
const path = require('path')
require('express-async-errors')

const router = require('./router')
const request = require('./middleware/request')

const port = config.get('port') || 3000

const app = express()

app.use(express.static('public'));

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(request)

app.use('/api', router)
app.use('/queues', bullBoard.router)

app.use((req, res, next) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.use((error, req, res, next) => {
    // handle express error
    // error throw from sync handle and next(err)
    
    const response = {
        message: error.message || error || 'server error',
        url: req.originalUrl,
        method: req.method,
    }

    if (typeof error === 'object') {
        Object.assign(response, error)
    }

    console.error(response)
    console.error(error)

    return res.error(response)
})

app.listen(port, () => {    
    console.log(` server is running at port ${port} on ${config.get('env')}`)

    console.log('eroc: list apis')
    expressListEndpoints(app).forEach((api) => {
        api.methods.forEach((m) => console.log(`    ${m.padEnd(6)} ${api.path}`))
    });
});
require('./job/worker');
