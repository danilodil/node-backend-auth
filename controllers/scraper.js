
/* eslint-disable no-plusplus, no-mixed-operators, object-shorthand, no-shadow, curly, prefer-const, no-else-return, no-console, no-await-in-loop, no-loop-func, guard-for-in, max-len, no-use-before-define, no-undef, no-inner-declarations,no-nested-ternary,
 no-param-reassign, guard-for-in ,no-prototype-builtins, no-return-assign, prefer-destructuring, no-restricted-syntax, no-constant-condition, dot-notation, quotes, func-names, consistent-return, indent, no-unneeded-ternary, nonblock-statement-body-position, no-floating-decimal, arrow-parens */

 const Boom = require('boom');
 const puppeteer = require('puppeteer');
 const ObjectsToCsv = require('objects-to-csv');
 const { parseAddress } = require('../lib/utils'); 
 const agencies = [];

 module.exports = {
   scrape: async (req, res, next) => {
     try {
       let browserParams = {
         args: ['--no-sandbox', '--disable-setuid-sandbox'],
       };
       browserParams = { headless: false };
       const browser = await puppeteer.launch(browserParams);
       let pages = await browser.pages();
       const page = pages[0];
 
       await loginStep();
 
       async function loginStep() {
         try {
           console.log('Starting Scraper');
           const credentials = { username: 'jon@xilo.io', password: 'Cojoanin93' };
           const loginUrl = 'https://barlist.com/account/login';
           await page.goto(loginUrl, { waitUntil: 'load' }); // wait until page load
           await page.waitForSelector('#Email');
           await page.evaluate(async (obj) => {
             const uEl = document.getElementById('Email');
             const pEl = document.getElementById('Password');
             const btn = document.querySelector('button[type="submit"].btn.btn-primary.btn-block');
             uEl.value = obj.username;
             pEl.value = obj.password;
             btn.click();
           }, credentials);
           await page.waitFor(5000);
           console.log('Logged In');
           await collectStep();
         } catch (error) {
           await exitFail(error, 'login');
         }
       }

       async function collectStep() {
        try {
          console.log('Starting scraping');
          const statesLength = Array.from(Array(51).keys());
          await page.waitFor(500);

            for (let k=1;k<statesLength.length;k++) {
                if (k !== 8 && k !== 31 && k !== 40 && k != 39) {
                    const stateId = (k+1);
                    console.log(stateId)
                    const url = `https://barlist.com/more/search?companyTypeId=2&stateid=${stateId}&countryid=1`;
                    await page.goto(url, { waitUntil: 'load' }); // wait until page load
                    await page.waitFor(500);
                    const errorEl = await page.$('i.far.fa-cogs.fa-10x');
                    if (errorEl != undefined) {
                        
                    } else {
        
                    const resultsText = await page.$('.results-parameters');
                    const numberOfResults = await page.evaluate(el => {
                        const num = el.innerText.match(/(\d+)/);
                        return num; 
                    }, resultsText);
        
                    const numberOfPages = (+Math.round(+numberOfResults[0] / 48));
                    const pageArray = numberOfPages > 1 ? Array.from(Array(numberOfPages).keys()) : [1];
        
                    for (let j=0;j<pageArray.length;j++) {
                        const pageNo = (j + 1);
                        // const pageNo = 1;
                        const pageUrl = `https://barlist.com/more/search?companyTypeId=2&stateId=${stateId}&countryId=1&page=${pageNo}`;
                        await page.goto(pageUrl, { waitUntil: 'load' }); // wait until page load
            
                        const links = await page.$$('a.results-list-card-header');
            
                        await page.waitFor(1000);
            
                        const urlLinks = [];
            
                        for (const link of links) {
                            const linkUrl = await page.evaluate(el => el.href, link);
                            // link.click();
                            urlLinks.push(linkUrl);
            
                            // await pageQuote.evaluate(() => goBack());
            
                            // await page.waitFor(1000);
            
                        }
            
                        for (const link of urlLinks) {
                            await page.goto(link, { waitUntil: 'load' }); // wait until page load
                            await page.waitForSelector('h2');
                            const agency = {Name: '', Address: '', Phone: '', Email: '', Website: '', agents: '', ['Additional Info']: '',  carriers: '', Owner: '', Role: '', Memberships: ''};
            
                            // Agency Name
                            const name = await page.$('h2');
                            const nameLabel = await page.evaluate(el => el.innerText, name);
                            agency.Name = nameLabel;
            
                            // Agency Address NEED TO PARSE ADDRESS 
                            const address = await page.$('address');
                            if (address) {
                                let addressLabel = await page.evaluate(el => el.innerHTML, address);
                                if (addressLabel) {
                                    addressLabel = addressLabel.replace('<b>Address:</b>', '');
                                    addressLabel = addressLabel.replace(/<br>/g, '');
                                    addressLabel = addressLabel.replace(/\r/g, '');
                                    addressLabel = addressLabel.replace(/\n/g, '');
                                    addressLabel = addressLabel.replace(/\s+/g, ' ').trim();
                                    agency.Address = addressLabel.replace(/  /g, '');
                                    const parsedAddress = parseAddress(agency.address);
                                    if (parsedAddress) {
                                        function returnWithSpace(value) {
                                        return (value && value !== '') ? ` ${value}` : '';
                                        }
                                        agency['Street Address'] = `${parsedAddress.number}${returnWithSpace(parsedAddress.prefix)}${parsedAddress.street}${returnWithSpace(parsedAddress.type)}`;
                                        agency['Street Number'] = parsedAddress.number;
                                        agency['Street Name'] = `${parsedAddress.street}${returnWithSpace(parsedAddress.type)}`;
                                        agency['City'] = parsedAddress.city;
                                        agency['State'] = parsedAddress.state;
                                        agency['Zip Code'] = parsedAddress.zip;
                                    }
                                }
                            }
            
                            const bTags = await page.$$('b');
                            
                            if (bTags) {
                                for (let i = 0; i < bTags.length; i++) {
                                    const bLabel = await page.evaluate(el => el.innerText, bTags[i]);
                                    if (bLabel) {
                                        if (bLabel.includes('Phone')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, bTags[i]);
                                            if (next) {
                                                const phoneLabel = await page.evaluate(el => el.innerText, next);
                                                agency.Phone = phoneLabel;
                                            }
                                        } else if (bLabel.includes('Email')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, bTags[i]);
                                            if (next) {
                                                const emailLabel = await page.evaluate(el => el.innerText, next);
                                                agency.Email = emailLabel;
                                            }
                                        } else if (bLabel.includes('Website')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, bTags[i]);
                                            if (next) {
                                                const websiteLabel = await page.evaluate(el => el.innerText, next);
                                                agency.Website = websiteLabel;
                                            }
                                        }
                                    }
                                }
                            }
            
                            const rows = await page.$$('.row');
            
                            function isOwner(agentString) {
                                if (agentString) {
                                    agentString = agentString.toLowerCase();
                                    return (agentString.includes('pres') || agentString.includes('owner') ||
                                            agentString.includes('ceo'));
                                } else {
                                    return false;
                                }
                            }
                            
                            if (rows) {
                                for (let i = 0; i < rows.length; i++) {
                                    const rowHTML = await page.evaluate(el => el.innerHTML, rows[i]);
                                    if (rowHTML) {
                                        if (rowHTML.includes('<h4>Personnel</h4>')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, rows[i]);
                                            if (next) {
                                                const agentHTML = await page.evaluate(el => el.innerHTML, next);
                                                if (agentHTML) {
                                                    const matches  = agentHTML.matchAll('<li>(.*)</li>');
                                                    const agentList = [];
                                                    for (match of matches) {
                                                        agentList.push(match[1]);
                                                    }
                                                    for (agent of agentList) {
                                                        if (isOwner(agent)) {
                                                            const agentRole = agent.split(', ');
                                                            if (agentRole) {
                                                                agency['Owner'] = agentRole[0];
                                                                agency['Role'] = agentRole[1];
                                                            }
                                                        }
                                                    }
                                                    let agentArray = agentList.join('\n');
                                                    agency.Agents = agentArray;
                                                }
                                            }
                                        }
                                        if (rowHTML.includes('<h4>Insurance Carriers</h4>')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, rows[i]);
                                            if (next) {
                                                const carrierHTML = await page.evaluate(el => el.innerHTML, next);
                                                if (carrierHTML) {
                                                    const matches  = carrierHTML.matchAll('<li>(.*)</li>');
                                                    const carrierList = [];
                                                    for (match of matches) {
                                                        carrierList.push(match[1]);
                                                    }
                                                    let carrierArray = carrierList.join('\n');
                                                    agency.Carriers = carrierArray;
                                                }
                                            }
                                        }
                                        if (rowHTML.includes('<h4>Additional Information</h4>')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, rows[i]);
                                            if (next) {
                                                const additionalInfoHTML = await page.evaluate(el => el.innerHTML, next);
                                                if (additionalInfoHTML) {
                                                    const matches  = additionalInfoHTML.matchAll('<span>(.*)</span>');
                                                    const additionalInfoList = [];
                                                    for (match of matches) {
                                                        additionalInfoList.push(match[1]);
                                                    }
                                                    let additionalInfoArray = additionalInfoList.join('\n');
                                                    agency['Additional Info'] = additionalInfoArray;
                                                }
                                            }
                                        }
                                        if (rowHTML.includes('<h4>Main Office</h4>')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, rows[i]);
                                            if (next) {
                                                const officeHTML = await page.evaluate(el => el.innerHTML, next);
                                                if (officeHTML) {
                                                    const matches  = officeHTML.matchAll('<li>(.*)</li>');
                                                    const officeList = [];
                                                    for (match of matches) {
                                                        officeList.push(match[1]);
                                                    }
                                                    let officeArray = officeList.join('\n');
                                                    agency['Main Office'] = officeArray;
                                                }
                                            }
                                        }
                                        if (rowHTML.includes('<h4>Other Office Locations</h4>')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, rows[i]);
                                            if (next) {
                                                const otherOfficeHTML = await page.evaluate(el => el.innerHTML, next);
                                                if (otherOfficeHTML) {
                                                    const matches  = otherOfficeHTML.matchAll('<li>(.*)</li>');
                                                    const otherOfficeList = [];
                                                    for (match of matches) {
                                                        otherOfficeList.push(match[1]);
                                                    }
                                                    let otherOfficeArray = otherOfficeList.join('\n');
                                                    agency['Other Office Locations'] = otherOfficeArray;
                                                }
                                            }
                                        }
                                        if (rowHTML.includes('<h4>Memberships</h4>')) {
                                            const next = await page.evaluateHandle(el => el.nextElementSibling, rows[i]);
                                            if (next) {
                                                const membershipHTML = await page.evaluate(el => el.innerHTML, next);
                                                if (membershipHTML) {
                                                    const matches  = membershipHTML.matchAll('alt="(.*)\"');
                                                    const membersList = [];
                                                    for (match of matches) {
                                                        membersList.push(match[1]);
                                                    }
                                                    let memberArray = membersList.join('\n');
                                                    agency.Memberships = memberArray;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            agencies.push(agency);
                        }
                    }
        
                }
            }
          }

          await page.waitFor(500);
          console.log('Scraped Info');

          (async () => {
            const csv = new ObjectsToCsv(agencies);
           
            // Save to file:
            await csv.toDisk('./agencies.csv');
          })();
          
           req.session.data = {
             title: 'Succeeded',
             agencies: agencies
           };
           browser.close();
           return next();
        } catch (error) {
          await exitFail(error, 'login');
        }
      }
 
       async function exitFail(error, step) {
        try {
            console.log(`Error during ${step} step:`, error);
            console.log('Logged In')
            req.session.data = {
              title: 'Failed',
              agencies: agencies
            };
            browser.close();
            return next();
        } catch (error2) {
            console.log(`Error during error step:`, error2, error);
            browser.close();
            return next();
        }
       }
 
       async function exitSuccess(step, save) {
         try {
           req.session.data = {
             title: `Successfully finished ${step} step`,
           };
           browser.close();
           return next();
         } catch (error) {
           await exitFail(error, 'exitSuccess');
         }
       }
     } catch (error) {
       console.log('Scraper Error:', error);
       return next(Boom.badRequest('Failed to Scrape Site'));
     }
   },
 };
 