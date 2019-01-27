import path from 'path';
import express from 'express';

import ScrapeTweet from '../TweetScraper';

const router = express.Router();

const timeout = 300;

const twitter = 'https://twitter.com/';

router.get('/hello', (req, res) => {
    res.send('world!');
});

const isTrue = i => {
    return i == true || i == 1 || i == 'true' || i == 't' || i == 'T'
}

const isFalse = i => {
    return i == false || i == 0 || i == 'false' || i == 'f' || i == 'F'
}

router.get('/tweet/(:user/status/)?:tweet_id([0-9]+)', (req, res) => {

    const doTimeline = req.query.timeline || isTrue(req.query.replies || false);
    const timelineMode = req.query.timeline && req.query.timeline == 'full' ? 'full' : doTimeline;

    const scrape = new ScrapeTweet({ options: {
        launch: {
            // headless: false,
            executablePath: '/usr/local/bin/chrome',
        },
        pages: 99,
        timeline: timelineMode,
        replies: timelineMode == 'full' || (doTimeline && isTrue(req.query.replies || false) ? true : false),
        parents: timelineMode == 'full' || isTrue(req.query.parents || false),
        quote: true,
        loadWait: 1250,
        doScreenshot: req.query.screenshot && isFalse(req.query.screenshot) ? false : true,
        // debug: true
    }});

    const url = path.join(twitter, req.params.user || '_', 'status', req.params.tweet_id);

    scrape.getTweet(url).then(data => {
        if (timelineMode !== 'full') {
            delete data.screenshot;
        }
        res.json(data);
    }).catch(err => {
        res.end();
    });

});


export default router;
