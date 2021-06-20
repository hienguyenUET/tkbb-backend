const Queue = require('bull')
const { setQueues, BullAdapter } = require('bull-board')
const { host, port, password } = require('config').get('redis')

const gsCrawlQueue = new Queue('crawlGS', {
    redis: {
        host,
        port,
        password
    }
})

setQueues([
    new BullAdapter(gsCrawlQueue, { readOnly: false })
])

module.exports = gsCrawlQueue