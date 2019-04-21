#!/usr/bin/env node
const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

process.on('uncaughtException', (error) => {
    console.error('uncaughtException',  error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
    console.error('unhandledRejection', reason, p);
    process.exit(1);
});

app.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.json({ message: 'Please provide a URL...' });
    }

    try {
        const width = 1366;
        const height = 1100;
        const isMobile = false;

        const filename = `full_screenshot_${width}_${height}_${(new Date()).toJSON()}.png`;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        page.setViewport({ width, height, isMobile });

        await page.goto(url.split('#')[0], { waitUntil: 'networkidle2' });

        // Wait for 500ms
        await (() => {
            return new Promise(resolve => { setTimeout(resolve, 500); });
        })();

        page.waitFor(1500);

        if (url.indexOf('#') > -1) {
            page.goto(url);
        }

        await page.screenshot({ path: `/screenshots/${filename}`, fullPage: true });

        browser.close();
        console.log(JSON.stringify({ url, filename, width, height }));

        return res.sendFile(`/screenshots/${filename}`);
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.listen(port, () => console.log(`Puppeteer is listening on port ${port}!`));
