const { Article, Publishcation, User, Junk } = require('../models')
const gsCrawlQueue = require('./queue');
const scholarlyExtended = require('../helpers/scholar')
const stringSimilarity = require('string-similarity')

const {
  GOOGLE_SCHOLAR_URL,
  GOOGLE_SCHOLAR_PROFILE_URL,
  GOOGLE_SCHOLAR_URL_PREFIX
} = require('../consts.js');


const WINDOW_SIZE = 100;

async function doProfileJob(jobData) {
  const { start, user, yearWindow } = jobData;
  console.log('YearWindow', yearWindow);
  try {
    const gsUserId = new URL(user.gsUrl)?.searchParams?.get('user');

    if (!gsUserId) {
      throw new Error('Missing Google Scholar User id');
    }
    let n = await scholarlyExtended.profile(`${gsUserId}&cstart=${start}&pagesize=${WINDOW_SIZE}`, user, yearWindow);
    if (n === WINDOW_SIZE) {
      gsCrawlQueue.add({
        type: 0,
        start: start + WINDOW_SIZE,
        user,
        yearWindow
      });
    }
    return;
  }
  catch(err) {
    try {
      let userInstance = await User.findByPk(user.id);
      userInstance.crawlStatus = err.message;
      await userInstance.save();
    }
    catch(e) {
      console.log("--+--+--", e);
    }
    return new Error(err.stack)
  }
}
async function doCitationJob(jobData) {
  let gsUser, gsCitation;
  const {citationLink, user} = jobData;
  let title;
  try {
    const uri = new URL(GOOGLE_SCHOLAR_URL_PREFIX + citationLink);
    gsUser = uri?.searchParams?.get('user');
    gsCitation = uri?.searchParams?.get('citation_for_view');
    console.log('doCitationJob', citationLink, user.fullName);    
    let citationDataHtml = await scholarlyExtended.promiseRequest({
      url: encodeURI(GOOGLE_SCHOLAR_URL_PREFIX + citationLink),
      jar: true,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      }
    });
    let articleData = scholarlyExtended.parseCitationHtml(citationLink, citationDataHtml)
    let pubDate = new Date(Date.parse(articleData.publication_date || '1948/01/01'));
    title = articleData.title;
    const raw = {
      uid: user.id,
      title: articleData.title,
      authors: articleData.authors.join(', '),
      year: pubDate.getFullYear(),
      citedCount: +articleData.total_citations || 0,
      citedUrl: articleData.citedUrl || '',
      venue: articleData.journal || articleData.conference || articleData.book || articleData.source,
      publisher: articleData.publisher,
      publicationDate: pubDate.toISOString().slice(0, 10)
    }
    /* 
    const isExisting = await Article.findOne({
      where: { citedUrl: articleData.citedUrl }
    })
    const isExisting = await Article.findOne({
      where: { 
        uid: user.id, 
        title: articleData.title, 
        venue: articleData.journal || articleData.conference || articleData.book || articleData.source
      }
    })
    if (!isExisting) {
    */
      //const matches = stringSimilarity.findBestMatch(raw.publisher || '', pubNames)
      //if (matches.bestMatch.rating >= 0.7) {
      //  raw.publishcationId = pubs[matches.bestMatchIndex].dataValues.id
      //}
      console.log('title: ', raw.title);
      try {
        await Article.create(raw);
      }
      catch(e) {
        console.log(e.message);
      }
    //}
    return;
  }
  catch(err) {
    console.log("TITLE:", title);
    try {
      let junk = await Junk.findByPk(gsCitation);
      if (!junk) {
        await Junk.create({
          citation: gsCitation,
          fullName: user.fullName,
          uid: user.id,
          user: gsUser,
          title: title,
          error: err.message
        });
      }
      else {
        junk.error = err.message
        await junk.save();
      }
    }
    catch(e) {
      console.log('_+_+_+_+_', e);
    }
    return new Error(err.stack);
  }
}
gsCrawlQueue.process(1, async (job, done) => {
  let ret = null;
  switch( job.data.type ) {
  case 0:
    ret = await doProfileJob(job.data);
    break;
  case 1:
    ret = await doCitationJob(job.data);
    break;
  default:
    done(new Error('Unknown job type'));
    return;
  }
  console.log("--- " + !ret?'OK':ret);
  await (
    () => (
      new Promise(res => 
        setTimeout(() => {
          console.log("---> NEXT");
          done(ret);
          res();
        }, 1000)
      )
    )
  )();
});
