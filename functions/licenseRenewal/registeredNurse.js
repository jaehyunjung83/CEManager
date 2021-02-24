const generalHelpers = require('./generalHelpers');
const path = require('path');
const os = require('os');
const { storage, db } = require('../admin');
const licenseType = "Registered Nurse (RN)";

exports.attemptLogin = async (page, username, password) => {
    try {
        console.log("attemptLogin()");
        await page.goto('https://www.breeze.ca.gov/', { waitUntil: 'networkidle0' });
        let continueButton = await generalHelpers.getElementFromXpath(page, '/html/body/div/div/main/article/div/div/div/div/a');
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
exports.handleApplicationQuestions = async (page, data) => {
    try {
        console.log("applicationQuestions()");
        const formPage = "applicationQuestions";

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage);
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        await page.select('#form > table > tbody > tr:nth-child(1) > td:nth-child(2) > select', `${data.disciplinedOrConvicted ? "Y" : "N"}`)
        await page.select('#form > table > tbody > tr:nth-child(2) > td:nth-child(2) > select', `${data.servedMilitary ? "Y" : "N"}`)
        await page.select('#form > table > tbody > tr:nth-child(3) > td:nth-child(2) > select', `${data.expertPracticeFacilitator ? "Y" : "N"}`)
        await page.select('#form > table > tbody > tr:nth-child(4) > td:nth-child(2) > select', `${data.nurseSupportGroupFacilitator ? "Y" : "N"}`)
        await page.select('#form > table > tbody > tr:nth-child(5) > td:nth-child(2) > select', `${data.interventionEvaluationCommitteeMember ? "Y" : "N"}`)
        await page.select('#form > table > tbody > tr:nth-child(6) > td:nth-child(2) > select', `${data.ceCourseContentEvaluator ? "Y" : "N"}`)

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

exports.handleContactDetails = async (page, uid, changingAddress = false) => {
    try {
        console.log("handleContactDetails()");
        const formPage = "contactDetails";
        const excludeArr = ["ContactDetailForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        if (changingAddress) {
            const changeAddressLink = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[1]/td[1]/span/a');
            await changeAddressLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            let addressReq = await db.collection("users").doc(uid).collection("renewalData").doc("renewalData").get();
            const contactDetails = addressReq.data().contactDetails;

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

            // County is optional
            // const countyOption = (await page.$x(
            //     `//*[@id = "county"]/option[text() = "${contactDetails.county}"]`
            // ))[0];
            // const countyValue = await (await countyOption.getProperty('value')).jsonValue();
            // await page.select('#county', countyValue);

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
            if (similarAddrPopup) {
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

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[3]/tbody/tr[2]/td/div/div/input[2]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleCEInformation = async (page, licenseData, allCEData, renewingInactive = false) => {
    try {
        console.log("handleCEInformation()");
        const formPage = "ceInformation";
        const excludeArr = ["RsdForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        if (renewingInactive) {
            // If renewing Inactive, enter 'Renewing Inactive' as course name and enter '30' as the Number of CE Hours.
            const addBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[1]');
            await addBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            await page.evaluate(() => {
                let courseName = document.getElementById('rsdDataValue0');
                courseName.value = "Renewing Inactive";
            });
            await page.evaluate(() => {
                let hours = document.getElementById('rsdDataValue4');
                hours.value = "30";
            });

            const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[1]');
            await nextBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            let cesAreCorrect = await checkCEsEntered(page, [], renewingInactive);
            if (!cesAreCorrect) throw new Error("CEs were not entered correctly.");
            console.log("CEs entered correctly");
        }
        else {
            // Renewing active, enter all CEs.
            let ceArr = []; // Used for keeping track of order of CE's added.

            for (const requirement of licenseData.requirements) {
                for (const ceID in requirement.linkedCEs) {
                    let ce = allCEData[ceID];
                    ce.hours = requirement.linkedCEs[ceID];
                    ceArr.push(ce);

                    const addBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[1]');
                    await addBtn.click();
                    await page.waitForNavigation({ waitUntil: 'networkidle0' });
                    // Enter all ce values
                    if (ce.name) {
                        await page.evaluate((name) => {
                            let input = document.getElementById('rsdDataValue0');
                            input.value = name;
                        }, ce.name);
                    }
                    if (ce.completionDate) {
                        await page.evaluate((completionDate) => {
                            let input = document.getElementById('rsdDataValue1');
                            input.value = completionDate;
                        }, ce.completionDate);
                    }
                    if (ce.providerName) {
                        await page.evaluate((providerName) => {
                            let input = document.getElementById('rsdDataValue2');
                            input.value = providerName;
                        }, ce.providerName);
                    }
                    if (ce.providerNum) {
                        await page.evaluate((providerNum) => {
                            let input = document.getElementById('rsdDataValue3');
                            input.value = providerNum;
                        }, ce.providerNum);
                    }
                    if (ce.hours) {
                        await page.evaluate((hours) => {
                            let input = document.getElementById('rsdDataValue4');
                            input.value = hours;
                        }, ce.hours);
                    }

                    const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[1]');
                    await nextBtn.click();
                    await page.waitForNavigation({ waitUntil: 'networkidle0' });
                }
            }

            let cesAreCorrect = await checkCEsEntered(page, ceArr, renewingInactive);
            if (!cesAreCorrect) throw new Error("CEs were not entered correctly.");
            console.log("CEs entered correctly");
        }

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[3]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

checkCEsEntered = async (page, ceArr = [], renewingInactive = false) => {
    try {
        const selector = "#contentBox > form > div > table > tbody";
        await page.evaluate(async (selector, ceArr, renewingInactive) => {
            let table = document.querySelector(selector)
            let rowIndex = 0;

            for (const child of table.childNodes) {
                if (!child.classList) continue;
                if (!child.classList.contains("itemRow") && !child.classList.contains("itemRowAlt")) continue;
                // Only rows remain
                // Current layout is one CE per row, with one field per column.
                // Columns have the class "itemCell" and go in the following order:
                // Course name, date of completion, provider name, provider number, number of hours
                if (renewingInactive) {
                    for (const index in child.childNodes) {
                        let column = child.childNodes[index];
                        if (column.classList && column.classList.contains("itemCell")) {
                            if (index == 1 && column.innerText !== "Renewing Inactive") {
                                throw new Error("Renewing, but CE name is not Renewing Inactive");
                            }
                            if (index == 9 && column.innerText !== "30") {
                                throw new Error("Renewing, but CE hours is not 30");
                            }
                        }
                    }
                }
                else {
                    for (const index in child.childNodes) {
                        let column = child.childNodes[index];
                        if (column.classList && column.classList.contains("itemCell")) {
                            if (ceArr[rowIndex].name && index == 1 && column.innerText !== ceArr[rowIndex].name) {
                                console.log(JSON.stringify(ceArr));
                                throw new Error(`${ceArr[rowIndex].id} - CE name does not match. innerText: ${column.innerText} CEName: ${ceArr[rowIndex].name}`);
                            }
                            if (ceArr[rowIndex].completionDate && index == 3 && column.innerText !== ceArr[rowIndex].completionDate) {
                                throw new Error(`${ceArr[rowIndex].id} - CE completionDate does not match. innerText: ${column.innerText} completionDate: ${ceArr[rowIndex].completionDate}`);
                            }
                            if (ceArr[rowIndex].providerName && index == 5 && column.innerText !== ceArr[rowIndex].providerName) {
                                throw new Error(`${ceArr[rowIndex].id} - CE providerName does not match. innerText: ${column.innerText} providerName: ${ceArr[rowIndex].providerName}`);
                            }
                            if (ceArr[rowIndex].providerNum && index == 7 && column.innerText !== ceArr[rowIndex].providerNum) {
                                throw new Error(`${ceArr[rowIndex].id} - CE providerNum does not match. innerText: ${column.innerText} providerNum: ${ceArr[rowIndex].providerNum} `);
                            }
                            if (ceArr[rowIndex].hours && index == 9 && column.innerText !== ceArr[rowIndex].hours.toString()) {
                                throw new Error(`${ceArr[rowIndex].id} CE hours do not match. innerText: ${column.innerText} hours: ${ceArr[rowIndex].hours.toString()}`);
                            }
                        }
                    }
                }
                rowIndex++;
            }
        }, selector, ceArr, renewingInactive);

        return true;
    }
    catch (e) {
        generalHelpers.dumpError(e);
        return false;
    }
}

exports.handleQuestions = async (page, renewingInactive = false) => {
    try {
        console.log("handleQuestions()");
        const formPage = "questions";
        const excludeArr = ["RsdForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        if (renewingInactive) {
            const inactiveChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[2]/td[3]/table/tbody/tr/td[3]/input');
            await inactiveChoice.click();
        }
        else {
            const activeChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[2]/td[3]/table/tbody/tr/td[1]/input');
            await activeChoice.click();
        }

        const fingerprintCompliant = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[5]/td[3]/table/tbody/tr/td[1]/input');
        await fingerprintCompliant.click();

        const CEcompliant = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[7]/td[3]/table/tbody/tr/td[1]/input');
        await CEcompliant.click();

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[2]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleConvictionQuestions = async (page, convictionData) => {
    try {
        console.log("handleConvictionQuestions()");
        const formPage = "convictionQuestions";
        const excludeArr = ["RsdForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        if (!convictionData.status) {
            // Has not been convicted of any crime since last renewal.
            const addBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[1]');
            await addBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            const noOption = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[2]/td[3]/table/tbody/tr/td[3]/input');
            await noOption.click();

            const enterConvictionBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[1]');
            await enterConvictionBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }
        else {
            // Has been convicted, must enter conviction details.
            for (const conviction of convictionData.convictions) {
                const addBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[1]');
                await addBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });

                const yesOption = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[2]/td[3]/table/tbody/tr/td[1]/input');
                await yesOption.click();

                await page.waitForTimeout(400);

                await page.evaluate((conviction) => {
                    let location = document.getElementById('rsdDataValue1');
                    location.value = conviction.location;
                }, conviction);

                await page.evaluate((conviction) => {
                    let date = document.getElementById('rsdDataValue2');
                    date.value = conviction.date;
                }, conviction);

                await page.evaluate((conviction) => {
                    let courtCaseNum = document.getElementById('rsdDataValue3');
                    courtCaseNum.value = conviction.courtCaseNum;
                }, conviction);

                await page.evaluate((conviction) => {
                    let charges = document.getElementById('rsdDataValue4');
                    charges.value = conviction.charges;
                }, conviction);

                await page.evaluate((conviction) => {
                    let additionalInfo = document.getElementById('rsdDataValue5');
                    additionalInfo.value = conviction.additionalInfo;
                }, conviction);

                const enterConvictionBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[1]');
                await enterConvictionBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
            }
        }

        let convictionDetailsCorrect = await checkConvictionDetails(page, convictionData);
        if (!convictionDetailsCorrect) throw new Error("Conviction details were not entered correctly.");

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[3]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

checkConvictionDetails = async (page, convictionData) => {
    try {
        const selector = "#contentBox > form > div > table > tbody";
        await page.evaluate(async (selector, convictionData) => {
            let table = document.querySelector(selector)
            let rowIndex = 0;

            for (const child of table.childNodes) {
                if (!child.classList) continue;
                if (!child.classList.contains("itemRow") && !child.classList.contains("itemRowAlt")) continue;
                // Only rows remain
                // Current layout is one conviction per row, with one field per column.
                // Columns have the class "itemCell" and go in the following order:
                // Status, location, date, course case #, charges, additional info.
                for (const index in child.childNodes) {
                    let column = child.childNodes[index];
                    if (column.classList && column.classList.contains("itemCell")) {
                        if (index == 1 && column.innerText !== (convictionData.status ? ("Yes") : ("No"))) {
                            throw new Error(`${JSON.stringify(convictionData)} - status does not match. ${column.innerText}`);
                        }
                        if (!convictionData.status) {
                            return true;
                        }
                        if (convictionData.convictions[rowIndex].location && index == 3 && column.innerText !== convictionData.convictions[rowIndex].location) {
                            throw new Error(`${JSON.stringify(convictionData.convictions[rowIndex])} - location does not match`);
                        }
                        if (convictionData.convictions[rowIndex].date && index == 5 && column.innerText !== convictionData.convictions[rowIndex].date) {
                            throw new Error(`${JSON.stringify(convictionData.convictions[rowIndex])} - date does not match`);
                        }
                        if (convictionData.convictions[rowIndex].courseCaseNum && index == 7 && column.innerText !== convictionData.convictions[rowIndex].courseCaseNum) {
                            throw new Error(`${JSON.stringify(convictionData.convictions[rowIndex])} - courtCaseNum does not match`);
                        }
                        if (convictionData.convictions[rowIndex].charges && index == 9 && column.innerText !== convictionData.convictions[rowIndex].charges) {
                            throw new Error(`${JSON.stringify(convictionData.convictions[rowIndex])} - charges does not match`);
                        }
                        if (convictionData.convictions[rowIndex].additionalInfo && index == 11 && column.innerText !== convictionData.convictions[rowIndex].additionalInfo) {
                            throw new Error(`${JSON.stringify(convictionData.convictions[rowIndex])} - additionalInfo does not match`);
                        }
                    }
                }
                rowIndex++;
            }
        }, selector, convictionData);

        return true;
    }
    catch (e) {
        generalHelpers.dumpError(e);
        return false;
    }
}

exports.handleDisciplineQuestions = async (page, disciplineData) => {
    try {
        console.log("handleDisciplineQuestions()");
        const formPage = "disciplineQuestions";
        const excludeArr = ["RsdForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        if (!disciplineData.status) {
            // Has not been convicted of any crime since last renewal.
            const addBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[1]');
            await addBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            const noOption = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[2]/td[3]/table/tbody/tr/td[3]/input');
            await noOption.click();

            const enterConvictionBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[1]');
            await enterConvictionBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }
        else {
            // Has been convicted, must enter conviction details.
            for (const action of disciplineData.disciplinaryActions) {
                const addBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[1]');
                await addBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });

                const yesOption = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[2]/td[3]/table/tbody/tr/td[1]/input');
                await yesOption.click();

                await page.waitForTimeout(400);

                await page.evaluate((action) => {
                    let license = document.getElementById('rsdDataValue1');
                    license.value = action.license;
                }, action);

                await page.evaluate((action) => {
                    let licenseNum = document.getElementById('rsdDataValue2');
                    licenseNum.value = action.licenseNum;
                }, action);

                await page.evaluate((action) => {
                    let stateIssued = document.getElementById('rsdDataValue3');
                    stateIssued.value = action.stateIssued;
                }, action);

                await page.evaluate((action) => {
                    let dateOfDiscipline = document.getElementById('rsdDataValue4');
                    dateOfDiscipline.value = action.dateOfDiscipline;
                }, action);

                await page.evaluate((action) => {
                    let caseNum = document.getElementById('rsdDataValue5');
                    caseNum.value = action.caseNum;
                }, action);

                await page.evaluate((action) => {
                    let additionalInfo = document.getElementById('rsdDataValue6');
                    additionalInfo.value = action.additionalInfo;
                }, action);

                const enterConvictionBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[1]');
                await enterConvictionBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
            }
        }

        let disciplinaryActionsCorrect = await checkDisciplinaryActions(page, disciplineData);
        if (!disciplinaryActionsCorrect) throw new Error("Disciplinary actions were not entered correctly.");

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[3]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

checkDisciplinaryActions = async (page, disciplineData) => {
    try {
        const selector = "#contentBox > form > div > table > tbody";
        await page.evaluate(async (selector, disciplineData) => {
            let table = document.querySelector(selector)
            let rowIndex = 0;

            for (const child of table.childNodes) {
                if (!child.classList) continue;
                if (!child.classList.contains("itemRow") && !child.classList.contains("itemRowAlt")) continue;
                // Only rows remain
                // Current layout is one conviction per row, with one field per column.
                // Columns have the class "itemCell" and go in the following order:
                // Status, location, date, course case #, charges, additional info.
                for (const index in child.childNodes) {
                    let column = child.childNodes[index];
                    if (column.classList && column.classList.contains("itemCell")) {
                        if (index == 1 && column.innerText !== (disciplineData.status ? ("Yes") : ("No"))) {
                            throw new Error(`${JSON.stringify(disciplineData)} - status does not match. ${column.innerText}`);
                        }
                        if (!disciplineData.status) {
                            return true;
                        }
                        if (disciplineData.disciplinaryActions[rowIndex].license && index == 3 && column.innerText !== disciplineData.disciplinaryActions[rowIndex].license) {
                            throw new Error(`${JSON.stringify(disciplineData.disciplinaryActions[rowIndex])} - license does not match`);
                        }
                        if (disciplineData.disciplinaryActions[rowIndex].licenseNum && index == 5 && column.innerText !== disciplineData.disciplinaryActions[rowIndex].licenseNum) {
                            throw new Error(`${JSON.stringify(disciplineData.disciplinaryActions[rowIndex])} - licenseNum does not match`);
                        }
                        if (disciplineData.disciplinaryActions[rowIndex].stateIssued && index == 7 && column.innerText !== disciplineData.disciplinaryActions[rowIndex].stateIssued) {
                            throw new Error(`${JSON.stringify(disciplineData.disciplinaryActions[rowIndex])} - stateIssued does not match`);
                        }
                        if (disciplineData.disciplinaryActions[rowIndex].dateOfDiscipline && index == 9 && column.innerText !== disciplineData.disciplinaryActions[rowIndex].dateOfDiscipline) {
                            throw new Error(`${JSON.stringify(disciplineData.disciplinaryActions[rowIndex])} - dateOfDiscipline does not match`);
                        }
                        if (disciplineData.disciplinaryActions[rowIndex].caseNum && index == 11 && column.innerText !== disciplineData.disciplinaryActions[rowIndex].caseNum) {
                            throw new Error(`${JSON.stringify(disciplineData.disciplinaryActions[rowIndex])} - caseNum does not match`);
                        }
                        if (disciplineData.disciplinaryActions[rowIndex].additionalInfo && index == 13 && column.innerText !== disciplineData.disciplinaryActions[rowIndex].additionalInfo) {
                            throw new Error(`${JSON.stringify(disciplineData.disciplinaryActions[rowIndex])} - additionalInfo does not match`);
                        }
                    }
                }
                rowIndex++;
            }
        }, selector, disciplineData);

        return true;
    }
    catch (e) {
        generalHelpers.dumpError(e);
        return false;
    }
}

exports.handleFollowUpRenewalInstructions = async (page) => {
    try {
        console.log("handleFollowUpRenewalInstructions()");
        const formPage = "followUpRenewalInstructions";
        const excludeArr = ["RsdForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[3]/td[3]/table/tbody/tr/td[1]/input');
        await yesChoice.click();

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[2]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleWorkLocation = async (page, workLocation) => {
    try {
        console.log("handleWorkLocation()");
        const formPage = "workLocation";
        const excludeArr = ["RsdForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        if (workLocation.status) {
            for (const location of workLocation.locations) {
                const addBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[1]');
                await addBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });

                await page.evaluate((location) => {
                    let years = document.getElementById('rsdDataValue0');
                    years.value = location.years;
                }, location);

                if (location.selfEmployed) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[5]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[5]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                await page.evaluate((location) => {
                    let county = document.getElementById('rsdDataValue2');
                    county.value = location.county;
                }, location);

                await page.evaluate((location) => {
                    let zip = document.getElementById('rsdDataValue3');
                    zip.value = location.zip;
                }, location);

                await page.evaluate((location) => {
                    let healthOccupation = document.getElementById('rsdDataValue4');
                    healthOccupation.value = location.healthOccupation;
                }, location);

                await page.select('#rsdDataValue5', `${location.workHours}`);

                if (location.acuteCare) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[15]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[15]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                if (location.homeCare) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[17]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[17]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                if (location.longTermAcuteCare) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[19]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[19]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                if (location.skilledNursingFacility) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[21]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[21]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                if (location.accreditedEducationProgram) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[23]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[23]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                if (location.manufacturer) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[25]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[25]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                if (location.outpatient) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[27]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[27]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                if (location.clinic) {
                    const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[29]/td[3]/table/tbody/tr/td[1]/input');
                    await yesChoice.click();
                }
                else {
                    const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[29]/td[3]/table/tbody/tr/td[3]/input');
                    await noChoice.click();
                }

                await page.evaluate((location) => {
                    let other = document.getElementById('rsdDataValue14');
                    other.value = location.other;
                }, location);

                await page.evaluate((location) => {
                    let percentPatientCare = document.getElementById('rsdDataValue15');
                    percentPatientCare.value = location.percentPatientCare;
                }, location);

                await page.evaluate((location) => {
                    let percentResearch = document.getElementById('rsdDataValue16');
                    percentResearch.value = location.percentResearch;
                }, location);

                await page.evaluate((location) => {
                    let percentTeaching = document.getElementById('rsdDataValue17');
                    percentTeaching.value = location.percentTeaching;
                }, location);

                await page.evaluate((location) => {
                    let percentAdministration = document.getElementById('rsdDataValue18');
                    percentAdministration.value = location.percentAdministration;
                }, location);

                await page.evaluate((location) => {
                    let percentOther = document.getElementById('rsdDataValue19');
                    percentOther.value = location.percentOther;
                }, location);

                const enterWorkLocationBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[1]');
                await enterWorkLocationBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
            }
        }

        let workLocationsCorrect = await checkWorkLocations(page, workLocation);
        if (!workLocationsCorrect) throw new Error("Work locations were not entered correctly.");

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table/tbody/tr[2]/td/div/div/input[3]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

checkWorkLocations = async (page, workLocation) => {
    try {
        if (!workLocation.status) return true;

        const selector = "#contentBox > form > div > table > tbody";
        await page.evaluate(async (selector, workLocation) => {
            let table = document.querySelector(selector)
            let rowIndex = 0;

            for (const child of table.childNodes) {
                if (!child.classList) continue;
                if (!child.classList.contains("itemRow") && !child.classList.contains("itemRowAlt")) continue;
                // Only rows remain
                // Current layout is one conviction per row, with one field per column.
                for (const index in child.childNodes) {
                    let column = child.childNodes[index];
                    if (column.classList && column.classList.contains("itemCell")) {
                        if (workLocation.locations[rowIndex].years && index == 1 && column.innerText !== workLocation.locations[rowIndex].years) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - years does not match`);
                        }
                        if (index == 3 && (column.innerText !== (workLocation.locations[rowIndex].selfEmployed ? "Yes" : "No"))) {
                            throw new Error(`${index}: ${column.innerText} - selfEmployed does not match`);
                        }
                        if (workLocation.locations[rowIndex].county && index == 5 && column.innerText !== workLocation.locations[rowIndex].county) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - county does not match`);
                        }
                        if (workLocation.locations[rowIndex].zip && index == 7 && column.innerText !== workLocation.locations[rowIndex].zip) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - zip does not match`);
                        }
                        if (workLocation.locations[rowIndex].healthOccupation && index == 9 && column.innerText !== workLocation.locations[rowIndex].healthOccupation) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - healthOccupation does not match`);
                        }
                        if (workLocation.locations[rowIndex].workHours && index == 11 && column.innerText !== workLocation.locations[rowIndex].workHours) {
                            if (workLocation.locations[rowIndex].workHours = "40" && column.innerText !== "40+") {
                                // Special case, where the text does not match the option and must be checked differently. 
                                // page.select goes by value, and the form displays the text which is 40+ instead of 40.
                                throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - workHours does not match`);
                            }
                        }
                        if (index == 13 && (column.innerText !== (workLocation.locations[rowIndex].acuteCare ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - acuteCare does not match`);
                        }
                        if (index == 15 && (column.innerText !== (workLocation.locations[rowIndex].homeCare ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - homeCare does not match`);
                        }
                        if (index == 17 && (column.innerText !== (workLocation.locations[rowIndex].longTermAcuteCare ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - longTermAcuteCare does not match`);
                        }
                        if (index == 19 && (column.innerText !== (workLocation.locations[rowIndex].skilledNursingFacility ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - skilledNursingFacility does not match`);
                        }
                        if (index == 21 && (column.innerText !== (workLocation.locations[rowIndex].accreditedEducationProgram ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - accreditedEducationProgram does not match`);
                        }
                        if (index == 23 && (column.innerText !== (workLocation.locations[rowIndex].manufacturer ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - manufacturer does not match`);
                        }
                        if (index == 25 && (column.innerText !== (workLocation.locations[rowIndex].outpatient ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - outpatient does not match`);
                        }
                        if (index == 27 && (column.innerText !== (workLocation.locations[rowIndex].clinic ? "Yes" : "No"))) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - clinic does not match`);
                        }
                        if (workLocation.locations[rowIndex].other && index == 29 && column.innerText !== workLocation.locations[rowIndex].other) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - other does not match`);
                        }
                        if (workLocation.locations[rowIndex].percentPatientCare && index == 31 && column.innerText !== workLocation.locations[rowIndex].percentPatientCare) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - percentPatientCare does not match`);
                        }
                        if (workLocation.locations[rowIndex].percentResearch && index == 33 && column.innerText !== workLocation.locations[rowIndex].percentResearch) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - percentResearch does not match`);
                        }
                        if (workLocation.locations[rowIndex].percentTeaching && index == 35 && column.innerText !== workLocation.locations[rowIndex].percentTeaching) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - percentTeaching does not match`);
                        }
                        if (workLocation.locations[rowIndex].percentAdministration && index == 37 && column.innerText !== workLocation.locations[rowIndex].percentAdministration) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - percentAdministration does not match`);
                        }
                        if (workLocation.locations[rowIndex].percentOther && index == 39 && column.innerText !== workLocation.locations[rowIndex].percentOther) {
                            throw new Error(`${JSON.stringify(workLocation.locations[rowIndex])} - percentOther does not match`);
                        }
                    }
                }
                rowIndex++;
            }
        }, selector, workLocation);

        return true;
    }
    catch (e) {
        generalHelpers.dumpError(e);
        return false;
    }
}

exports.handleHealingArtSurvey = async (page, healingArtSurveyData) => {
    try {
        console.log("handleHealingArtSurvey()");
        const formPage = "healingArtSurvey";
        const excludeArr = ["RsdForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        // await generalHelpers.saveDropdownOptions(page, licenseType, formPage, 'latinoType', '#rsdDataValue9');
        // await generalHelpers.saveDropdownOptions(page, licenseType, formPage, 'asianType', '#rsdDataValue11')
        // await generalHelpers.saveDropdownOptions(page, licenseType, formPage, 'pacificIslanderType', '#rsdDataValue13')
        // await generalHelpers.saveDropdownOptions(page, licenseType, formPage, 'language', '#rsdDataValue17')
        // await generalHelpers.saveDropdownOptions(page, licenseType, formPage, 'planToRetire', '#rsdDataValue21')

        if (healingArtSurveyData.status) {
            if (healingArtSurveyData.persuingCredentials) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[3]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[3]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            if (healingArtSurveyData.nameOfCredential) {
                await page.evaluate((healingArtSurveyData) => {
                    let nameOfCredential = document.getElementById('rsdDataValue1');
                    nameOfCredential.value = healingArtSurveyData.nameOfCredential;
                }, healingArtSurveyData);
            }

            if (healingArtSurveyData.nameOfSchool) {
                await page.evaluate((healingArtSurveyData) => {
                    let nameOfSchool = document.getElementById('rsdDataValue2');
                    nameOfSchool.value = healingArtSurveyData.nameOfSchool;
                }, healingArtSurveyData);
            }

            if (healingArtSurveyData.completionYear) {
                await page.evaluate((healingArtSurveyData) => {
                    let completionYear = document.getElementById('rsdDataValue3');
                    completionYear.value = healingArtSurveyData.completionYear;
                }, healingArtSurveyData);
            }

            if (healingArtSurveyData.addressOfSchool) {
                await page.evaluate((healingArtSurveyData) => {
                    let addressOfSchool = document.getElementById('rsdDataValue4');
                    addressOfSchool.value = healingArtSurveyData.addressOfSchool;
                }, healingArtSurveyData);
            }

            if (healingArtSurveyData.africanAmerican) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[9]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[9]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            if (healingArtSurveyData.nativeAmerican) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[10]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[10]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            if (healingArtSurveyData.white) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[11]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[11]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            if (healingArtSurveyData.latino) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[12]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[12]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            await page.select('#rsdDataValue9', `${healingArtSurveyData.latinoType}`);

            if (healingArtSurveyData.asian) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[14]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[14]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            await page.select('#rsdDataValue11', `${healingArtSurveyData.asianType}`);

            if (healingArtSurveyData.pacificIslander) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[16]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[16]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            await page.select('#rsdDataValue13', `${healingArtSurveyData.pacificIslanderType}`);

            if (healingArtSurveyData.noneOfTheAbove) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[18]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[18]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            if (healingArtSurveyData.declineToState) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[19]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[19]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            if (healingArtSurveyData.fluentInOtherLanguages) {
                const yesChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[21]/td[3]/table/tbody/tr/td[1]/input');
                await yesChoice.click();
            }
            else {
                const noChoice = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr[21]/td[3]/table/tbody/tr/td[3]/input');
                await noChoice.click();
            }

            if (healingArtSurveyData.language1) {
                await page.select('#rsdDataValue17', `${healingArtSurveyData.language1}`);
            }
            if (healingArtSurveyData.language2) {
                await page.select('#rsdDataValue18', `${healingArtSurveyData.language2}`);
            }
            if (healingArtSurveyData.language3) {
                await page.select('#rsdDataValue19', `${healingArtSurveyData.language3}`);
            }
            if (healingArtSurveyData.language4) {
                await page.select('#rsdDataValue20', `${healingArtSurveyData.language4}`);
            }

            if (healingArtSurveyData.retirement) {
                await page.select('#rsdDataValue21', `${healingArtSurveyData.retirement}`);
            }
        }

        const nextBtn = await generalHelpers.getElementFromXpath(page, '/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr[2]/td/div/div/input[2]');
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleFileAttachments = async (page, licenseData, allCEData) => {
    try {
        console.log("handleFileAttachments()");
        const formPage = "fileAttachments";
        const excludeArr = ["FileAttachmentsForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        let downloadedImagePaths = await downloadImages(licenseData, allCEData);
        console.log(JSON.stringify(downloadedImagePaths));

        if (downloadedImagePaths.length) {
            for (const filePath of downloadedImagePaths) {
                let uploadElement = await page.$("input[type=file]");
                uploadElement.uploadFile(filePath);

                const attachBtn = await page.$("input[name=upload]"); // getElement from xpath didn't work since it changes after a file is uploaded.
                await attachBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });


            }
        }

        const nextBtn = await page.$("input[name=next]");
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

downloadImages = async (licenseData, allCEData) => {
    const requirements = licenseData.requirements;
    const bucket = storage.bucket();
    let downloadedImagePaths = [];

    for (const requirement of requirements) {
        if (requirement.hours) {
            for (const linkedCE in requirement.linkedCEs) {
                if (allCEData[linkedCE].filePath) {
                    const filePath = allCEData[linkedCE].filePath;
                    console.log(filePath);
                    const tempFilePath = path.join(os.tmpdir(), linkedCE) + ".jpeg";
                    try {
                        await bucket.file(filePath).download({
                            destination: tempFilePath
                        })
                        downloadedImagePaths.push(tempFilePath);
                    }
                    catch (e) {
                        generalHelpers.dumpError(e);
                    }
                }
            }
        }
    }
    return downloadedImagePaths;
}

exports.handleApplicationSummary = async (page, uid) => {
    try {
        console.log("handleApplicationSummary()");
        const formPage = "applicationSummary";
        const excludeArr = ["BaseForm"];

        let hasChanged = await generalHelpers.checkPageChanged(page, licenseType, formPage, { exclude: excludeArr });
        if (hasChanged) throw new Error("Renewal process out of date, please try again later");

        let now = new Date();
        year = now.getUTCFullYear();
        const fileName = `renewalSummary${year}`;
        const tempPDFPath = path.join(os.tmpdir(), fileName) + ".pdf";
        const tempSSPath = path.join(os.tmpdir(), fileName) + ".png";
        const bucket = storage.bucket();
        const filePath = `renewalFiles/${uid}/${fileName}`


        await page.pdf({ path: tempPDFPath, format: 'A4' });
        await page.screenshot({ path: tempSSPath, fullPage: true });

        await bucket.upload(tempPDFPath, { destination: filePath + ".pdf" })
        await bucket.upload(tempSSPath, { destination: filePath + ".png" })

        // const nextBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[16]/tbody/tr[2]/td/div/div/input[2]");
        // await nextBtn.click();
        // await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleAttestation = async (page, uid) => {
    try {
        console.log("handleAttestation()");
        // const formPage = "applicationSummary";
        // const excludeArr = ["BaseForm"];

        const yesBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr/td/div[2]/input[1]");
        yesBtn.click();

        const nextBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[2]/tbody/tr/td/div/div/input[3]");
        await nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleFeeAndSummaryReport = async (page) => {
    try {
        console.log("handleFeeAndSummaryReport()");
        const tempSSPath = path.join(os.tmpdir(), fileName) + ".png";
        const bucket = storage.bucket();
        let now = new Date();
        year = now.getUTCFullYear();
        const fileName = `feeSummary${year}`;
        const filePath = `renewalFiles/${uid}/${fileName}`

        await page.screenshot({ path: tempSSPath, fullPage: true });
        await bucket.upload(tempSSPath, { destination: filePath + ".png" })

        // const yesBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[3]/form/table[1]/tbody/tr/td/div[2]/input[1]");
        // yesBtn.click();

        const payNowBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table/tbody/tr[8]/td/div/div/input[1]");
        await payNowBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const visaBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table[2]/tbody/tr[2]/td[2]/table/tbody/tr[1]/td[1]/input");
        visaBtn.click();

        const nextBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table[3]/tbody/tr[2]/td/div/div/input[1]");
        nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const confirmPaymentBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form[1]/table/tbody/tr[9]/td/div/div/input[1]");
        confirmPaymentBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleCreditCardForm = async (page) => {
    try {
        const CREDIT_CARD_DATA = {
            number: "5268760046849068",
            expiration: "0225",
            cvv: "300",
            firstName: "Peter",
            lastName: "Hwang",
            addr1: "2390 Crenshaw Boulevard",
            addr2: "Ste E #342",
            city: "Torrance",
            state: "CA",
            zip: "90501",
        }
        console.log("handleCreditCardForm()");

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_account_data');
            el.value = CREDIT_CARD_DATA.number;
        }, CREDIT_CARD_DATA);

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_exp_date');
            el.value = CREDIT_CARD_DATA.expiration;
        }, CREDIT_CARD_DATA);

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_cvv2cvc2');
            el.value = CREDIT_CARD_DATA.cvv;
        }, CREDIT_CARD_DATA);

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_first_name');
            el.value = CREDIT_CARD_DATA.firstName;
        }, CREDIT_CARD_DATA);

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_last_name');
            el.value = CREDIT_CARD_DATA.lastName;
        }, CREDIT_CARD_DATA);

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_last_name');
            el.value = CREDIT_CARD_DATA.lastName;
        }, CREDIT_CARD_DATA);

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_avs_address');
            el.value = CREDIT_CARD_DATA.addr1;
        }, CREDIT_CARD_DATA);     
        
        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_address2');
            el.value = CREDIT_CARD_DATA.addr2;
        }, CREDIT_CARD_DATA); 
        
        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_city');
            el.value = CREDIT_CARD_DATA.city;
        }, CREDIT_CARD_DATA); 

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_state');
            el.value = CREDIT_CARD_DATA.state;
        }, CREDIT_CARD_DATA); 

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_state');
            el.value = CREDIT_CARD_DATA.state;
        }, CREDIT_CARD_DATA); 

        await page.evaluate((CREDIT_CARD_DATA) => {
            let el = document.querySelector('#ssl_avs_zip');
            el.value = CREDIT_CARD_DATA.zip;
        }, CREDIT_CARD_DATA); 

        const processBtn = await generalHelpers.getElementFromXpath(page, "/html/body/form[1]/table/tbody/tr[2]/td/table/tbody/tr[4]/td/input[2]");
        processBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}

exports.handleNavigationToPaymentForm = async (page) => {
    try {
        console.log("handleNavigationToPaymentForm()");

        await page.evaluate(() => {
            let el = document.querySelector('#payment')
            el.click();
        }); 
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // const makePaymentsBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table/tbody/tr/td[2]/table/tbody/tr[1]/td/table/tbody/tr/td[4]/input");
        // makePaymentsBtn.click();
        // await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const visaBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table[2]/tbody/tr[2]/td[2]/table/tbody/tr[1]/td[1]/input");
        visaBtn.click();

        const nextBtn = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form/table[3]/tbody/tr[2]/td/div/div/input[1]");
        nextBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const nextBtn2 = await generalHelpers.getElementFromXpath(page, "/html/body/div/div[3]/div[2]/div/div/div/div/div/div[2]/form[1]/table/tbody/tr[9]/td/div/div/input[1]");
        nextBtn2.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    catch (e) {
        return { success: false, error: e, returnToUser: { status: 400, message: e.message } };
    }

    return { success: true };
}