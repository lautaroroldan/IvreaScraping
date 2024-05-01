// Description: This file contains the code to create a server that will scrape the ivrea website and return the releases.
const express = require('express');
const { chromium } = require('playwright');
const app = express()
const PORT = process.env.PORT || 3000

app.get('/getAll', async (req, res) => {
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.ivrea.com.ar/proximas.htm');

        const releases = await page.$$eval('body > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > table:nth-child(3) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr', (rows) => {

            const releasesArray = []
            let currentDate = ''
            let currentReleases = []
            let currentReeditions = []
            rows.forEach((row) => {
                const titleCell = row.querySelector('td[bgcolor="#384D5A"]')
                const releaseCell = row.querySelectorAll('td[background="img/fondo-tomo.gif"]')
                if (titleCell) {
                    currentDate = titleCell.textContent.trim()
                    currentReleases = []
                    currentReeditions = []
                } else if (releaseCell.length > 0) {
                    currentReleases = []
                    currentReeditions = []
                    releaseCell.forEach((releaseInfoCell) => {
                        const titleElement = releaseInfoCell.querySelector('strong')
                        const imageElement = releaseInfoCell.querySelector('.borde_fotos')
                        const reeditionElement = releaseInfoCell.querySelector('.pie')
                        if (!titleElement) return
                        const title = titleElement.textContent.trim()
                        if (!imageElement) return
                        const imgSrc = imageElement ? imageElement.getAttribute('src') : null
                        if (!title) return
                        if (reeditionElement) {
                            currentReeditions.push({ title, imgSrc })
                        } else if (currentReleases) {
                            currentReleases.push({ title, imgSrc })
                        }

                    })
                }
                if (currentDate && (currentReleases && currentReleases.length > 0) || (currentReeditions && currentReeditions.length > 0)) {
                    // Si tenemos una fecha y lanzamientos, los agregamos al array
                    const findReleases = releasesArray.find((release) => release.date == currentDate)
                    if (findReleases != null) {
                        findReleases.releases = [...findReleases.releases, ...currentReleases]
                        findReleases.reeditions = [...findReleases.reeditions, ...currentReeditions]
                    } else {
                        const newReleases = { date: currentDate, releases: currentReleases, reeditions: currentReeditions }
                        releasesArray.push(newReleases)
                    }
                    currentReleases = []
                    currentReeditions = []
                }

            })
            return { releasesArray }
        })

        await browser.close();

        res.json(releases);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
