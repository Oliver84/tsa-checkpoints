const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.scrape = functions.https.onRequest(async () => {
  const axios = require("axios")
  const cheerio = require("cheerio")

  async function fetchHTML(url) {
    const { data } = await axios.get(url)
    return cheerio.load(data)
  }

  const site = await fetchHTML("https://www.tsa.gov/coronavirus/passenger-throughput");

  db.collection('checkpoints').doc().set({
    date: new Date(site('tbody tr:nth-child(2) td:nth-child(1)').text()),
    '2019': site('tbody tr:nth-child(2) td:nth-child(2)').text(),
    '2020': site('tbody tr:nth-child(2) td:nth-child(3)').text(),
  })
});
