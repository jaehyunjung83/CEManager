const puppeteer = require('puppeteer');
const { db, admin } = require('../admin');

exports.configureBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
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

// Exclude array takes in the NAME of elements on the page.
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

exports.saveDropdownOptions = async (page, licenseType, formPage, question, selector) => {
    try {
        let options = await page.evaluate(async (selector) => {
            let dropdown = document.querySelector(selector);
            let options = [];
            for (const option of dropdown.childNodes) {
                if (option.nodeName == "OPTION") {
                    const value = option.getAttribute('value');
                    if (!value) continue;

                    console.log(`text: ${option.label}, value: ${value}`)
                    options.push({ text: option.label, value: value })
                }
            }
            return options;
        }, selector)

        let dataToStore = {
            pages: {
                [formPage]: {
                    dropDowns: {
                        [question]: {
                            selector: selector,
                            options: options,
                        }
                    }
                }
            }
        }

        await db.collection("renewalFormData").doc(licenseType).set(dataToStore, { merge: true });
    }
    catch (e) {
        this.dumpError(e);
        return false;
    }
    return true;
}

// Note: this was written for California. It checks that all requirements of user are complete.
// Other states may allow renewals without all requirements being met.
exports.checkLicenseRequirementsComplete = async (licenseData) => {
    try {
        const licenseType = licenseData.licenseType;
        const licenseState = licenseData.licenseState;
        let officialRequirementUpdateDate = licenseData.officialRequirementUpdateDate;
        if (officialRequirementUpdateDate["_seconds"]) {
            // Last updated turned into obj instead of Firestore Timestamp.
            officialRequirementUpdateDate = new admin.firestore.Timestamp(officialRequirementUpdateDate["_seconds"], 0)
        }

        const requirements = licenseData.requirements;

        let response = await db.collection("requirements").doc(licenseType).get();
        let allOfficialRequirements = response.data();
        if (!allOfficialRequirements) {
            throw new Error("Something went wrong grabbing state requirements");
        }

        let officialRequirements = allOfficialRequirements[licenseState];
        if (!officialRequirements) {
            throw new Error("State is not supported for renewals");
        }

        if (officialRequirements.lastUpdated.toMillis() !== officialRequirementUpdateDate.toMillis()) {
            console.log(`Official requirements last updated: ${officialRequirements.lastUpdated.toMillis()}`);
            console.log(`User requirements last updated: ${officialRequirementUpdateDate.toMillis()}`);
            throw new Error("License requirements not up to date.");
        }
        // License requirements up to date.

        for (const requirement of requirements) {
            if (requirement.complete) continue;
            if (requirement.hours) {
                let hoursNeeded = Number(requirement.hours);
                let hoursDone = 0;
                for (const id in requirement.linkedCEs) {
                    hoursDone += requirement.linkedCEs[id];
                }
                if (hoursDone < hoursNeeded) {
                    throw new Error("License requirements incomplete");
                }
            }
        }
        console.log("License up to date and meets all necessary requirements");
        return { success: true }
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }
}