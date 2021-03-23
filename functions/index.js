const functions = require('firebase-functions');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const { storage, db } = require('./admin');
const stripe = require('stripe')('sk_test_5CC56jQrRIwH2yGJKTdu1N3d00cVX8JOJU');

const nurseRenewal = require('./licenseRenewal/registeredNurse');
const generalHelpers = require('./licenseRenewal/generalHelpers');

exports.createThumbnail = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onRequest(async (req, res) => {
    console.log(req.body);
    const bucket = storage.bucket(); // Default bucket.
    const fileName = req.body.fileName;
    const filePath = `userImages/${req.body.userID}/${fileName}`
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
      contentType: 'application/json',
    };
    bucket.file(filePath).download({
      destination: tempFilePath
    }).then(async () => {
      await spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
      console.log('Thumbnail created at', tempFilePath);
      const thumbFileName = `thumb_${fileName}`;
      const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
      await bucket.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata,
        public: true
      })
        .then((snapshot) => {
          // const thumbURL = snapshot.ref.getDownloadURL()
          //   .then(() => {
          console.log("Upload successful.");
          //   })
          //   .catch(error => {
          //     console.log("Error getting thumbnail URL. Error: " + error.toString());
          //   })
        })
        .catch(error => {
          console.log("Error uploading thumbnail. Error: " + error.toString());
        });

      fs.unlinkSync(tempFilePath);

      let myObj = {
        filePath: filePath,
        thumbnailURL: `https://storage.googleapis.com/cetracker-2de23.appspot.com/${thumbFilePath}`,
        bucket: `gs://cetracker-2de23.appspot.com/${thumbFilePath}`,
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(myObj));
    });
  });

exports.renewLicense = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onRequest(async (req, res) => {
    let username = req.body.userData.username;
    let password = req.body.userData.password;
    let uid = req.body.userData.uid;
    let licenseID = req.body.userData.licenseID;
    let changingAddress = req.body.changingAddress;
    let renewingInactive = req.body.renewingInactive;
    let applicationQuestionData = req.body.applicationQuestionData;
    let convictionData = req.body.convictionData;
    let disciplineData = req.body.disciplineData;
    let workLocation = req.body.workLocation;
    let healingArtSurveyData = req.body.healingArtSurveyData;
    healingArtSurveyData.retirement = "";

    // let username = "mhwang127";
    // let password = "Bravery3E#!";
    // // let username = "linda58421";
    // // let password = "Kibbles&bitz2";
    // const uid = "7QBkQYXbbZNzoScPS368wP27CmK2";
    // const licenseID = "6599279e-4e8a-4a85-9fc6-633340e5ebd4";
    // const changingAddress = false;
    // const renewingInactive = false;
    // const applicationQuestionData = {
    //   disciplinedOrConvicted: false,
    //   servedMilitary: false,
    //   expertPracticeFacilitator: false,
    //   nurseSupportGroupFacilitator: false,
    //   interventionEvaluationCommitteeMember: false,
    //   ceCourseContentEvaluator: false,
    // }
    // const convictionData = {
    //   // All strings
    //   status: false,
    //   convictions: [{
    //     location: "123", // "Please include city, county, state, and country"
    //     date: "12/23/2020", // mm/dd/yyyy
    //     courtCaseNum: "123",
    //     charges: "asdfs",
    //     additionalInfo: "asdfasd", // "Please include a brief description of the incident. Include: The name of the arresting agency; Date of arrest; Arresting agency case number"
    //   }],
    // }
    // const disciplineData = {
    //   status: false,
    //   disciplinaryActions: [{
    //     license: "asdfa",
    //     licenseNum: "asdfasf",
    //     stateIssued: "adfd",
    //     dateOfDiscipline: "12/20/2020",
    //     caseNum: "123",
    //     additionalInfo: "adsfasdfasdfasdf",
    //   }]
    // }
    // const workLocation = {
    //   status: true,
    //   locations: [{
    //     years: "12",
    //     selfEmployed: false,
    //     county: "a",
    //     zip: "123",
    //     healthOccupation: "as",
    //     workHours: "40",
    //     acuteCare: true,
    //     homeCare: false,
    //     longTermAcuteCare: true,
    //     skilledNursingFacility: false,
    //     accreditedEducationProgram: true,
    //     manufacturer: false,
    //     outpatient: true,
    //     clinic: false,
    //     other: "asdf",
    //     percentPatientCare: "1",
    //     percentResearch: "2",
    //     percentTeaching: "3",
    //     percentAdministration: "4",
    //     percentOther: "5",
    //   }]
    // };
    // const healingArtSurveyData = {
    //   status: false,

    //   persuingCredentials: true,
    //   nameOfCredential: "1",
    //   completionYear: "2",
    //   nameOfSchool: "3",
    //   addressOfSchool: "4",

    //   africanAmerican: true,
    //   nativeAmerican: true,
    //   white: true,
    //   latino: true,
    //   latinoType: "01", // dropdown
    //   asian: true,
    //   asianType: "01", // dropdown
    //   pacificIslander: true,
    //   pacificIslanderType: "01", // dropdown
    //   noneOfTheAbove: true,
    //   declineToState: true,
    //   fluentInOtherLanguages: true,
    //   language1: "01", // dropdown
    //   language2: "02", // dropdown
    //   language3: "03", // dropdown
    //   language4: "04", // dropdown
    //   retirement: "2YEARS",
    // }

    let allLicenseData = {};
    let licenseData = {};
    let allCEData = {};

    try {
      let response = await db.collection("users").doc(uid).collection("licenses").doc("licenseData").get();
      allLicenseData = response.data();
      if (!allLicenseData) {
        throw new Error("User license data does not exist");
      }

      if (!allLicenseData[licenseID]) {
        throw new Error("License ID does not exist.");
      }
      licenseData = allLicenseData[licenseID];

      if (!licenseData.requirements || !licenseData.requirements.length) {
        throw new Error("License requirements are invalid.")
      }

      let result = await generalHelpers.checkLicenseRequirementsComplete(licenseData);
      if (!result.success) { throw result; }

      response = await db.collection("users").doc(uid).collection("CEs").doc("CEData").get();
      allCEData = response.data();
    }
    catch (e) {
      generalHelpers.handleExit(e);
      if (e.returnToUser) {
        return res.send(e.returnToUser);
      }

      return res.send({ status: 500, message: 'Something went wrong' });
    }


    try {
      let page = await generalHelpers.configureBrowser();
      let result = await nurseRenewal.attemptLogin(page, username, password);
      if (!result.success) { throw result; }

      // result = await nurseRenewal.handleNavigationToPaymentForm(page);
      // if (!result.success) { throw result; }

      result = await nurseRenewal.startRenewal(page);
      if (!result.success) { throw result; }

      // PAGES TO GO THROUGH:
      // Introduction
      // Information Privacy Act
      // Transaction Suitability Questions
      // Application Questions
      // Name and Personal/Organization Details
      // Contact Details
      // CE Information
      // Questions
      // Conviction Questions
      // Discipline Questions
      // Follow-Up Renewal Instructions
      // Work Location
      // Healing Art Survey
      // File Attachments
      // Application Summary
      result = await nurseRenewal.handleIntroduction(page);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleInformationPrivacyAct(page);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleTransactionSuitabilityQuestions(page);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleApplicationQuestions(page, applicationQuestionData);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleNameAndPersonalOrganizationDetails(page);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleContactDetails(page, uid, changingAddress);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleCEInformation(page, licenseData, allCEData, renewingInactive);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleQuestions(page, renewingInactive);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleConvictionQuestions(page, convictionData);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleDisciplineQuestions(page, disciplineData);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleFollowUpRenewalInstructions(page, disciplineData);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleWorkLocation(page, workLocation);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleHealingArtSurvey(page, healingArtSurveyData);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleFileAttachments(page, licenseData, allCEData);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleApplicationSummary(page, uid);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleAttestation(page);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleFeeAndSummaryReport(page);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleCreditCardForm(page);
      if (!result.success) { throw result; }

      await page.waitForTimeout(300000000);
      // await page.pdf({ path: 'introduction.pdf', format: 'A4' });
      // await page.screenshot({ path: 'loginTest.png' });
    }
    catch (e) {
      generalHelpers.handleExit(e);
      if (e.returnToUser) {
        return res.send(e.returnToUser);
      }

      return res.send({ status: 500, message: 'Something went wrong' });
    }

    return res.send({ status: 200, message: 'Successfully renewed license.' });
  })

exports.saveCardToStripe = functions.https.onRequest(async (req, res) => {
  try {
    console.log(req.body);
    const token = req.body.token;
    let stripeCustomerID = req.body.stripeCustomerID;
    const email = req.body.email;
    const uid = req.body.uid;
    let accountData = null;
    let card = null;

    const response = await db.collection("users").doc(`${uid}`).get()
    // console.log(someData.exists);
    accountData = response.data();

    if (!stripeCustomerID || !stripeCustomerID.length) {
      // Look up if stripe customer ID exists in Firestore. If not, create Stripe customer.
      if (!accountData || !accountData.stripeCustomerID) {
        console.log(`${email}: Creating new stripe customer`);
        const customer = await stripe.customers.create({
          email: email,
          description: `${uid}`,
        });
        await db.collection("users").doc(`${uid}`).set({ stripeCustomerID: customer.id }, { merge: true })
      }
      else {
        stripeCustomerID = accountData.stripeCustomerID;
      }
    }


    if (accountData && accountData.stripeCard && accountData.stripeCard.id) {
      console.log(`${email}: Updating card on account`);

      const cards = await stripe.customers.listSources(
        accountData.stripeCustomerID,
        { object: 'card' }
      );
      for (const cardObj of cards.data) {
        await stripe.customers.deleteSource(
          accountData.stripeCustomerID,
          cardObj.id,
        );
      }
      card = await stripe.customers.createSource(
        stripeCustomerID,
        { source: `${token}` }
      );
    }
    else {
      console.log(`${email}: Creating new card`);
      card = await stripe.customers.createSource(
        stripeCustomerID,
        { source: `${token}` }
      );
    }

    if (!card.id) throw new Error("Something went wrong.");

    await db.collection("users").doc(`${uid}`).set({ stripeCard: { id: card.id, last4: card.last4, exp_month: card.exp_month, exp_year: card.exp_year } }, { merge: true })
  }
  catch (e) {
    console.log(e);
    return res.status(500).send({ success: false, message: 'Something went wrong saving card.' });
  }

  return res.status(200).send({ success: true, message: 'Successfully saved card!' });
});
