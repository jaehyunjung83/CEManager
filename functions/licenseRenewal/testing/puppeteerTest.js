const puppeteer = require('puppeteer');

const initialTest = async () => {
    let username = "lskdjfslfjs";
    let password = "password";
// username:  mhwang127  password:  Bravery3E#
    try {
        let page = await configureBrowser();
        await attemptLogin(page, username, password);

        await page.screenshot({ path: 'loginTest.png' });
        await browser.close();
    }
    catch (e) {
        handleExit(e);
    }
    return;
};

const configureBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage();
    return page;
}

const handleExit = (reason) => {
    console.log(`Exiting... ${reason}`);
    dumpError(reason);
    process.exit(1);
}

const attemptLogin = async (page, username, password) => {
    try {
        await page.goto('https://www.breeze.ca.gov/', { waitUntil: 'networkidle0' });
        let continueButton = await getElementFromFullXpath(page, '//*[@id="main-content"]/div/main/article/div/div/div/div[2]/a');
        await continueButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        await page.evaluate((username) => {
            let el = document.getElementById('userid');
            el.value = username;
        }, username);
        await page.evaluate((password) => {
            let el = document.getElementById('password');
            el.value = password;
        }, password);

        const signInBtn = await getElementFromFullXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table/tbody/tr[1]/td[3]/div[3]/table/tbody/tr[4]/td[3]/input');
        await signInBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        let invalidLoginInfo = await getElementFromFullXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/div[3]/ul/li/text()');
        if (invalidLoginInfo) {
            throw new Error("Invalid login info");
        }
    }
    catch (e) {
        console.log(`attemptLogin() failed`);
        handleExit(e);
    }
}

function dumpError(err) {
    if (typeof err === 'object') {
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log('dumpError(): argument is not an object');
    }
}

// Should only be used if only one element is expected. Returns first element matching xpath.
const getElementFromFullXpath = async (page, xpath) => {
    try {
        await page.waitForXPath(xpath);
        const elementsWithXpath = await page.$x(xpath);
        return elementsWithXpath[0];
    }
    catch (e) {
        handleExit(e);
    }
}

initialTest();