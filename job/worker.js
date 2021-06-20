
const { Article, Publishcation } = require('../models')
const scholarlyExtended = require('../helpers/scholar')
const stringSimilarity = require('string-similarity')

const gsCrawlQueue = require('./queue')

gsCrawlQueue.process(1, async (job, done) => {
    try {
        const { user } = job.data

        const gsId = new URL(user.gsUrl)?.searchParams?.get('user')
    
        if (!gsId) {
            done(new Error('Missing google scholar user id'))
        }

        const pubs = await Publishcation.findAll()
        const pubNames = pubs.map(e => e.dataValues.name)
    
        const { results } = await scholarlyExtended.profile(`${gsId}&cstart=0&pagesize=1000`)
    
        for (const articleData of results) {
    
            const raw = {
                uid: user.id,
                title: articleData.title,
                authors: articleData.authors.map(a => a.name).reduce((x, y) => x + ', ' + y),
                year: articleData.year,
                citedCount: articleData.citedCount || 0,
                citedUrl: articleData.citedUrl || '',
                publisher: articleData.venue
            }
            const titleExist = await Article.findOne({
                where: { title: articleData.title }
            })

            if (titleExist) {
                continue
            }

            const matches = stringSimilarity.findBestMatch(raw.publisher || '', pubNames)
            if (matches.bestMatch.rating >= 0.7) {
                raw.publishcationId = pubs[matches.bestMatchIndex].dataValues.id
            }
            
            await Article.create(raw)
        }

        done()
    } catch (err) {
        console.error(err.stack)
        done(new Error(err.stack))
    }
})