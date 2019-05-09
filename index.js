console.log('-----------------------------------------------------')
console.log('#')
console.log('# Broken Link Scanner')
console.log('# https://www.protos.red/broken-link-scanner')
console.log('#')
console.log('# Scans a list of URLs and detects broken links on them.')
console.log('# Generates a CSV report with broken link count for each web page URL. ')
console.log('#')
console.log('# Author: Protos RED - https://www.protos.red/')
console.log('# Email: admin@protos.red')
console.log('#')
console.log('-----------------------------------------------------')
console.log(' ')

const batch = require('batchflow');
const fs = require('fs');
const Listr = require('listr');
const inquirer = require('inquirer');
const { Observable } = require('rxjs');
const csv = require('./lib/csv');
const scrape = require('./lib/scrape');
const {shuffle} = require('./lib/util');

async function URL(url, onlyExternal) {
  return await scrape.getWebContent(url);
}

function runScan(urls, onlyExternal) {
  const outputFile = 'broken-processed_' + (new Date()).toISOString().split('T').shift() + '.csv';
  const tasks = new Listr([
    {
      title: 'Scrape all links from pages',
      task: (ctx) => {
        ctx.results = [];
        return new Observable(async function(observer) {
          let i = 1;
          for(let url of urls) {
            let result = await scrape.getWebContent(url);
            observer.next(`[${i}/${urls.length}]: ${url}`)
            ctx.results.push(result? (
              (onlyExternal? result.getUniqueExternalLinkURLs() : result.getUniqueLinkURLs()).slice(0,500)
            ) : null); 
            i++;
          }
          observer.complete();
        });
      }
    },
    {
      title: 'Check links if they are broken',
      task: function (ctx) {
        return new Observable(async function(observer) {
          let data = urls.map(url => {
            return {
              pageURL: url,
              linksChecked: 0,
              brokenCount: 0,
              brokenURLs: []
            }
          });

          const flatLinks = [];
          let totalCount = 0;
          let flatI = 0;
          for(let batch of ctx.results) {
            if(batch) {
              totalCount += batch.length;
              for(let url of batch) {
                flatLinks.push({
                  index: flatI,
                  url: url
                })
              }
            }
            flatI++;
          }

          shuffle(flatLinks)

          let processed = 0;
          batch(flatLinks).parallel(150).each(async (i, row, done) => {
            let active = await scrape.isActiveURL(row.url);
            processed += 1;
            observer.next(`[${processed}/${flatLinks.length}]: ${row.url.split('\n').join('')}`)
            data[row.index].linksChecked++;
            if(!active) {
              data[row.index].brokenCount++;
              data[row.index].brokenURLs.push(row.url);
            }
            done();
          }).end(() => {
            ctx.data = data;
            data = data.map(row => {
              return Object.assign({}, row, {
                brokenURLs: row.brokenURLs.join(';')
              })
            })
            observer.complete();
          })
        });
      }
    },
    {
      title: 'Write report to file: ' + outputFile,
      task: (ctx) => {
        return csv.write(process.cwd() + '/' + outputFile, ctx.data);
      }
    }
  ]);
  tasks.run().catch(err => {
      console.error(err);
  });
}

inquirer.prompt({
    type: 'list',
    name: 'filename',
    message: 'Select CSV file containing page URLs to check for broken links:',
    choices: fs.readdirSync(process.cwd()).filter(path => path.includes('.csv'))
  }).then(async function (pathAnswers) {
    const rows = await csv.read(process.cwd() + '/' + pathAnswers.filename)
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'column',
      message: 'Which column contains urls?',
      choices: Object.keys(rows[0])
    }, {
      type: 'confirm',
      name: 'external',
      message: 'Would you like to check only external links?',
      default: true
    }])

    runScan(rows.map(row => row[answer.column]), answer.external);
  })

