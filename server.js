// Description: This file contains the code to create a server that will scrape the ivrea website and return the releases.
const express = require('express');
const { chromium } = require('playwright');
const { getRealeases } = require('./index.mjs');
const app = express()
const PORT = process.env.PORT || 3000

app.get('/getAll', async (req, res) => {
    try {

        res.json(releases);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
