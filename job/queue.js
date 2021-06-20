const Queue = require('bull')
const { setQueues, BullAdapter } = require('bull-board')

const gsCrawlQueue = new Queue('crawlGS', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: 'ytivohs'
    }
})

setQueues([
    new BullAdapter(gsCrawlQueue, { readOnly: false })
])

module.exports = gsCrawlQueue