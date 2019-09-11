/* eslint-disable max-statements */
const puppeteer = require('puppeteer');
const {installMouseHelper} = require('./install-mouse-helper');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await installMouseHelper(page);

  page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36')

  await page.goto('http://www.j-archive.com/showgame.php?game_id=3050');
  await page.waitForSelector('.round')

  console.log('up and running baby')
  console.log('\n')

  let game = {};

  const rounds = await page.$$('.round')

  for (const round of rounds){

    const categories = await round.$$('.category')

    for (const category of categories){
        const topic = await category.$eval('.category_name', el => el.innerText)
        game[topic] = {
                       one: {clue: null, answer: null},
                       two: {clue: null, answer: null},
                       three: {clue: null, answer: null},
                       four: {clue: null, answer: null},
                       five: {clue: null, answer: null}
                      }
    }

    const clues = await round.$$('.clue')

    for (const clue of clues){
        try {
            const clueText = await clue.$eval('.clue_text', el => el.innerText)
            const div = await clue.$('div')
            await div.hover()
    
          
            await page.waitForSelector('.correct_response')
            const correctResponse = await clue.$eval('.correct_response', el => el.innerText)
            
            const clueValue = await clue.$eval('.clue_value', el => el.innerText)

            let clueObject = {value: clueValue, clue: clueText, answer: correctResponse }

            console.log(clueObject)
            
        }
        catch (e){
            console.log(e)
        }

    }

  }

 await browser.close();
})();
