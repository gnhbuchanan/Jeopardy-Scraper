/* eslint-disable complexity */
/* eslint-disable max-statements */
const puppeteer = require('puppeteer');
const {installMouseHelper} = require('./install-mouse-helper');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await installMouseHelper(page);

  page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36')

  await page.goto('http://www.j-archive.com/showgame.php?game_id=3050');
  await page.waitForSelector('.round')

  console.log('this is JEOPARDY!')
  console.log('\n')

  let game = {Single: null, Double: null, final: {}};
  let roundId = 'Single';

  const rounds = await page.$$('.round')

  for (const round of rounds){

    const categories = await round.$$('.category')
    let categoryArray = []
    let clueArray = []

    for (const category of categories){
        const topic = await category.$eval('.category_name', el => el.innerText)
       categoryArray.push(topic)
    }

    const clues = await round.$$('.clue')

    for (const clue of clues){
        try {
            const clueText = await clue.$eval('.clue_text', el => el.innerText)
            const div = await clue.$('div')
            await div.hover()

            await page.waitForSelector('.correct_response')
            const correctResponse = await clue.$eval('.correct_response', el => el.innerText)

            let clueObject = {clue: clueText, answer: correctResponse }

            clueArray.push(clueObject)
        }
        catch (e){
            console.log(e)
        }
    }

    //at this point we have category array and clue array in order
    let allCategoriesObject = {};

    for (let i = 0; i < categoryArray.length; i++){

        //for each category assign the values clues and answers
        let individualCategory = {}

        for (let j = 0 + i; j < clueArray.length; j = j + 6){
         
            let value;

            if (roundId === 'Single'){
                value = Math.floor(j / 6 + 1) * 200;
            }
            if (roundId === 'Double'){
                value = Math.floor(j / 6 + 1) * 400;
            }

            individualCategory[value] = clueArray[j]

        }
 
        allCategoriesObject[categoryArray[i]] = individualCategory
    }

    game[roundId] = allCategoriesObject
    roundId = 'Double';
  }

  //ADD FINAL JEOPARDY BELOW

  const final = await page.$('.final_round')
  const finalCategory = await final.$eval('.category_name', el => el.innerText)
  const finalClue = await final.$eval('.clue_text', el => el.innerText)

  const finalDiv = await final.$('div')
  await finalDiv.hover()

  await page.waitForSelector('.correct_response')
  const finalResponse = await final.$eval('.correct_response', el => el.innerText)

  let finalObject = {clue: finalClue, answer: finalResponse }

  game.final[finalCategory] = finalObject

  console.log(JSON.stringify(game, null, 2))

  fs.writeFile('game.json', JSON.stringify(game, null, 2), function (err){
      if (err) throw err;
      console.log('Saved!')
  })

 await browser.close();
})();
