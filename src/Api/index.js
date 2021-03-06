import os from 'os';
import path from 'path';
import express from 'express';

import ScrapeTweet from '../TweetScraper';

const router = express.Router();

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

    const doTimeline = req.query.timeline || isTrue(req.query.replies || false) || isTrue(req.query.parents || false);
    const timelineMode = req.query.timeline && req.query.timeline == 'full' ? 'full' : doTimeline;

    const scrape = new ScrapeTweet({ options: {
        launch: os.platform() == 'freebsd' ? {
            executablePath: '/usr/local/bin/chrome',
            dumpio: true,
        } : {
            dumpio: true,
        },
        pages: 99,
        timeline: timelineMode,
        replies: timelineMode == 'full' || isTrue(req.query.replies || false),
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
        scrape.close();
    }).catch(err => {
        res.end();
        scrape.close()
    });
});


export default router;
