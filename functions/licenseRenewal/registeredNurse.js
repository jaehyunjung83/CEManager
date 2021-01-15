const generalHelpers = require('./generalHelpers');
const fs = require('fs');
const { db } = require('../admin');
const licenseType = "Registered Nurse (RN)";

exports.attemptLogin = async (page, username, password) => {
    try {
        console.log("attemptLogin()");
        await page.goto('https://www.breeze.ca.gov/', { waitUntil: 'networkidle0' });
        let continueButton = await generalHelpers.getElementFromXpath(page, '//*[@id="main-content"]/div/main/article/div/div/div/div[2]/a');
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

        const signInBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table/tbody/tr[1]/td[3]/div[3]/table/tbody/tr[4]/td[3]/input');
        await signInBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        let invalidLoginInfo = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/div[3]/ul/li/text()');
        if (invalidLoginInfo) {
            throw new Error("Invalid login info");
        }
        return { success: true }
    }
    catch (e) {
        console.log(`attemptLogin() failed`);
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }
}

exports.startRenewal = async (page) => {
    try {
        console.log("startRenewal()");
        const startBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table/tbody/tr/td[1]/table[1]/tbody/tr[2]/td/table/tbody/tr/td[4]/input');
        if (!startBtn) { throw new Error("License not up for renewal yet"); }

        await startBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}


exports.handleIntroduction = async (page) => {
    try {
        console.log("handleIntroduction()");
        const selector = '#contentBox';
        const formPage = "introduction";

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage);
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr/td/div/div/input[1]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleInformationPrivacyAct = async (page) => {
    try {
        console.log("handleInformationPrivacyAct()");
        const formPage = "informationPrivacyAct";

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage);
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr/td/div/div/input[1]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

//Asks if user is changing their name. Defaults to no, as yes makes the user ineligible for renewal.
// What website says when answering YES to changing name: 
// Your answers indicate that you are not eligible to renew due to one of the following reasons:
// 1. If you have a change of name, your name change must be completed prior to your renewal.
// 2. If you are eligible for a Military exemption you must submit a renewal form by mail/fax stating that you are Military exempt along with a copy of your current orders.
exports.handleTransactionSuitabilityQuestions = async (page) => {
    try {
        console.log("transactionSuitabilityQuestions()");
        const formPage = "transactionSuitabilityQuestions";

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage);
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        const noBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div[1]/div[3]/div[2]/div/div/div/div/div[1]/div[3]/form/table/tbody/tr/td[2]/div/input[2]');
        await noBtn.click();

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div[1]/div[3]/div[2]/div/div/div/div/div[1]/div[3]/form/div/div/input[2]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

// Yes/No questions on this page:
// Since you last renewed your license, have you had a license disciplined by a government agency or other disciplinary body; or have you been convicted of any crime in any state, the USA and its territories, military court or other country? http://www.rn.ca.gov/enforcement/convictions.shtml
// Have you served or are you currently serving in the military?
// Would you be interested in serving as an Expert Practice Consultant for the Board of Registered Nursing? For information regarding the requirements for becoming an Expert Practice Consultant, please visit: http://www.rn.ca.gov/enforcement/expwit.shtml
// Would you be interested in serving as a Nurse Support Group Facilitator for the Board of Registered Nursing? For information regarding the requirements for becoming a Nurse Support Group Facilitator, please visit: rn.ca.gov/intervention
// Would you be interested in serving as an Intervention Evaluation Committee Member for the Board of Registered Nursing? For information regarding the requirements for becoming an Intervention Evaluation Committee Member, please visit: rn.ca.gov/intervention
// Would you be interested in serving as a Continuing Education Course Content Evaluator?
exports.handleApplicationQuestions = async (page) => {
    try {
        console.log("applicationQuestions()");
        const formPage = "applicationQuestions";

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage);
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        await page.select('#form > table > tbody > tr:nth-child(1) > td:nth-child(2) > select', 'N')
        await page.select('#form > table > tbody > tr:nth-child(2) > td:nth-child(2) > select', 'N')
        await page.select('#form > table > tbody > tr:nth-child(3) > td:nth-child(2) > select', 'N')
        await page.select('#form > table > tbody > tr:nth-child(4) > td:nth-child(2) > select', 'N')
        await page.select('#form > table > tbody > tr:nth-child(5) > td:nth-child(2) > select', 'N')
        await page.select('#form > table > tbody > tr:nth-child(6) > td:nth-child(2) > select', 'N')

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[7]/td/div/div/input[2]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleNameAndPersonalOrganizationDetails = async (page) => {
    try {
        console.log("handleNameAndPersonalOrganizationDetails()");
        const formPage = "NameAndPersonalOrganizationDetails";

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage);
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[8]/td/div/div/input[2]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleContactDetails = async (page, changingAddress = false, uid) => {
    try {
        console.log("handleContactDetails()");
        const formPage = "contactDetails";
        const excludeArr = ["ContactDetailForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        if (changingAddress) {
            // >  {
            //     >    altPhone: '',
            //     >    phoneNum: '408-513-5662',
            //     >    country: 'United States',
            //     >    city: 'GARDENA',
            //     >    line2: '',
            //     >    extension: '',
            //     >    line1: '2821 W 152nd St',
            //     >    line3: '',
            //     >    county: 'LOS ANGELES',
            //     >    zip: '90249-4023',
            //     >    state: 'CA',
            //     >    email: 'MICHAEL.HWANG.MH@GMAIL.COM'
            //     >  }
            const changeAddressLink = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[1]/td[1]/span/a');
            await changeAddressLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            let addressReq = await db.collection("users").doc(uid).collection("renewalData").doc("renewalData").get();
            const contactDetails = addressReq.data().contactDetails;
            console.log(contactDetails);

            await page.evaluate((contactDetails) => {
                let el = document.querySelector('#addressLine1');
                el.value = contactDetails.line1;
            }, contactDetails);
            await page.evaluate((contactDetails) => {
                let el = document.querySelector('#addressLine2');
                el.value = contactDetails.line2;
            }, contactDetails);
            await page.evaluate((contactDetails) => {
                let el = document.querySelector('#addressLine3');
                el.value = contactDetails.line3;
            }, contactDetails);
            await page.evaluate((contactDetails) => {
                let el = document.querySelector("#addrCity")
                el.value = contactDetails.city;
            }, contactDetails);
            await page.select('#stateCode', `${contactDetails.state}`);

            const countyOption = (await page.$x(
                `//*[@id = "county"]/option[text() = "${contactDetails.county}"]`
            ))[0];
            const countyValue = await (await countyOption.getProperty('value')).jsonValue();
            await page.select('#county', countyValue);

            const countryOption = (await page.$x(
                `//*[@id = "countryCode"]/option[text() = "${contactDetails.country}"]`
            ))[0];
            const countryValue = await (await countryOption.getProperty('value')).jsonValue();
            await page.select('#countryCode', countryValue);

            await page.evaluate((contactDetails) => {
                let el = document.querySelector("#phoneNbr");
                el.value = contactDetails.phoneNum;
            }, contactDetails);
            await page.evaluate((contactDetails) => {
                let el = document.querySelector("#phoneExtension");
                el.value = contactDetails.extension;
            }, contactDetails);
            await page.evaluate((contactDetails) => {
                let el = document.querySelector("#emailAddr")
                el.value = contactDetails.email;
            }, contactDetails);
            await page.evaluate((contactDetails) => {
                let el = document.querySelector("#addrSpecific1")
                el.value = contactDetails.altPhone;
            }, contactDetails);

            const doneBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/div/div/input[1]');
            await doneBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            const similarAddrPopup = await generalHelpers.getElementFromXpath(page, '/html/body/div[3]/div/div/div/text()');
            if(similarAddrPopup) {
                const keepOriginalBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div[3]/div/div/div/div/table/tbody/tr[2]/td[5]/input');
                await page.waitForTimeout(2000);
                await keepOriginalBtn.click();
                await page.waitForTimeout(2500);
            }
            // Second done button
            const doneBtn2 = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/div/div/input[1]');
            await doneBtn2.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }

        // const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[3]/tbody/tr[2]/td/div/div/input[2]');
        // await nextBtn.click();
        // await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}
