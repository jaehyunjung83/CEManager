const puppeteer = require('puppeteer');
const { db } = require('../admin');

exports.configureBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        // args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage();
    return page;
}

exports.dumpError = (err) => {
    if (typeof err === 'object') {
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log(`dumpError(): argument is not an object. ${err}`);
    }
}

exports.handleExit = (err) => {
    console.log(`Exiting...`);
    if (err.error) {
        this.dumpError(err.error);
    }
    else {
        this.dumpError(err);
    }
}

// Should only be used if only one element is expected. Returns first element matching xpath.
exports.getElementFromXpath = async (page, xpath) => {
    try {
        let element = (await page.$x(xpath))[0];
        if (element) return element;

        // Using waitForFunction since waitForXpath failed to find certain buttons and would always time out.
        await page.waitForFunction('typeof (await page.$x(xpath))[0]) == "object"');
        return (await page.$x(xpath))[0];
    }
    catch (e) {
        return false;
    }
}

exports.checkPageChanged = async (page, licenseType, formPage, optionals = { exclude: [] }) => {
    try {
        let baselineData = await db.collection("renewalFormData").doc(licenseType).get();
        baselineData = baselineData.data();

        if (!baselineData) { throw new Error("Baseline data of page does not exist"); }
        if (!baselineData.pages) { throw new Error(`No pages exist for this license type: ${licenseType}`) };
        if (!baselineData.pages[formPage]) {
            // New page that doesn't exist in db
            const selector = "#contentBox";
            const currentPageText = await this.getPageText(page, selector, optionals);
            await this.saveNewPageText(licenseType, formPage, currentPageText);
            throw new Error(`Page does not exist for ${licenseType}:${formPage}`)
        };

        const selector = baselineData.pages[formPage].selector;
        const baselineText = baselineData.pages[formPage].baselineText;
        const currentPageText = await this.getPageText(page, selector, optionals);

        if (currentPageText === baselineText) {
            return false;
        }
        else {
            await this.saveNewPageText(licenseType, formPage, currentPageText);
            return true;
        }
    } catch (error) {
        this.dumpError(error);
        return true;
    }
}

exports.getPageText = async (page, selector, optionals) => {
    const currentPage = await page.$$eval(selector, (els, optionals) => {
        let checkExcludeHelper = (el, optionals) => {
            let innerHTML = "";
            if (optionals.exclude.length) {
                for (const child of el.childNodes) {
                    try {
                        if (optionals.exclude.includes(child.getAttribute("name"))) {
                            continue;
                        }
                        else {
                            innerHTML += `\n${child.innerHTML}`;
                        }
                    }
                    catch { null }
                }
            }
            else {
                innerHTML = el.innerHTML;
            }
            return innerHTML;
        }
        return els.map(el => checkExcludeHelper(el, optionals));
    }, optionals);

    let currentPageText = currentPage.join();
    currentPageText = currentPageText.replace(/\s+/g, ' ');
    return currentPageText;
}

exports.saveNewPageText = async (licenseType, formPage, currentPageText, selector = "#contentBox") => {
    await db.collection("renewalFormData").doc(licenseType).set({
        pages: {
            [formPage]: {
                baselineText: currentPageText,
                selector: selector,
            }
        }
    }, { merge: true });
    return;
}

// exports.saveNewPageText = async (licenseType, formPage, currentPageText) => {
//     await db.collection("renewalFormData").doc(licenseType).set({
//         pages: {
//             [formPage]: {
//                 newBaselineText: currentPageText,
//                 updatedOn: new Date().toISOString(),
//             }
//         }
//     }, { merge: true });
//     return;
// }

exports.saveDropdownOptions = async (formPage, selector) => {
    let dataToStore = {
        pages: {
            [formPage]: {
                dropDowns: {
                    [selector]: {
                        selector: selector,
                        options: [
                            {
                                text: "",
                                value="",
                            }
                        ],
                    }
                }
            }
        }
    }
}