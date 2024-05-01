import { chromium } from "playwright"

const browser = await chromium.launch({
    headless: true
})

const page = await browser.newPage()

await page.goto('https://www.ivrea.com.ar/proximas.htm')

const releases = await page.$$eval('body > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > table:nth-child(3) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr', (rows) => {
    const releasesArray = []
    let currentDate = ''
    let currentReleases = []
    rows.forEach((row) => {
        const dateCell = row.querySelector('td[bgcolor="#384D5A"]')
        const releaseCell = row.querySelectorAll('td[background="img/fondo-tomo.gif"]')
        if (dateCell) {
            currentDate = dateCell.textContent.trim()
            currentReleases = []
        } else if (releaseCell.length > 0) {
            currentReleases = []
            releaseCell.forEach((releaseInfoCell) => {
                const titleElement = releaseInfoCell.querySelector('strong')
                const imageElement = releaseInfoCell.querySelector('.borde_fotos')
                if (!titleElement) return
                const title = titleElement.textContent.trim()
                if (!title) return
                if (!imageElement) return
                const imgSrc = imageElement ? imageElement.getAttribute('src') : null

                currentReleases.push({ title, imgSrc })
            })
        }
        if (currentDate && currentReleases.length > 0) {
            // Si tenemos una fecha y lanzamientos, los agregamos al array
            const findReleases = releasesArray.find((release) => release.date == currentDate)
            if (findReleases) {
                findReleases.releases = [...findReleases.releases, ...currentReleases]
            } else {
                releasesArray.push({ date: currentDate, releases: currentReleases })
            }

        }
    })
    return releasesArray
})



releases.forEach((release) => {
    console.log(release.date)
    release.releases.forEach((releaseInfo) => {
        console.log(releaseInfo.title, releaseInfo.imgSrc)
    })
})
await browser.close()