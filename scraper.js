const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
fs.unlink("playersInfo.csv", (err) => {});

var num;
var url = "https://www.futbin.com/players";

async function getHTML(pageNumber, justGetNum){
    try{  
        //const browser = await puppeteer.launch({headless: true});
        //const page = await browser.newPage();
        //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        //await page.goto(url+"?page="+pageNumber, { waitUntil: 'domcontentloaded' });

        let htmlContent = await axios.get(url, {headers:{"User-Agent": 'PostmanRuntime/7.32.1', },});
        htmlContent = htmlContent.data;
        //let htmlContent = await page.evaluate(() => document.body.innerHTML);
        var html = cheerio.load(htmlContent);
        num = html("ul.pagination.pg-blue.justify-content-end li");

        num = (num.find("a").eq(-2).text());
        if (justGetNum){
            //await browser.close();
            return;
        }
        var players1 = html("tr.player_tr_1");
        var players2 = html("tr.player_tr_2");
        let players = players1.add(players2);

        players.each(function(){
            name = html(this).find("a.player_name_players_table.get-tp").text();
            price = html(this).find("span.font-weight-bold").text();
            version = html(this).find("td.mobile-hide-table-col div:first").text()
            addToCsv(name, convertToInteger(price),version, "playersInfo.csv")
        });
        //await browser.close();
    }
    catch(error){
        //await browser.close();
        console.error(error);
    }
}

function addToCsv(value1, value2,value3, csvFileName) {
    // Prepare the CSV data
    const csvData = `${value1},${value2},${value3}\n`;
  
    // Append the data to the CSV file
    fs.appendFile(csvFileName, csvData, 'utf8', (err) => {
      if (err) {
        console.error('Error appending to CSV file:', err);
      } else {
        //console.log('Values added to CSV file successfully.');
      }
    });
}

function convertToInteger(input) {
    input = input.trim()

    const suffixes = {
      K: 1000,
      M: 1000000,
    };
  
    let lastChar = input.charAt(input.length - 1).toUpperCase(); // Get the last character in uppercase

    if (!(lastChar in suffixes)) {
      return input;
    }
  
    const numberPart = input.slice(0, -1); // Remove the last character
    const multiplier = suffixes[lastChar];
  
    // Convert the number to an integer using the multiplier
    const result = parseFloat(numberPart) * multiplier;
  
    // Round to the nearest integer
    return Math.round(result);
}

async function populateCsv(){
  await getHTML(1, true);
  for (let i = 0; i < num + 1; i++){
    await getHTML(i, false);
  }
}

populateCsv();


