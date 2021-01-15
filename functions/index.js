const functions = require('firebase-functions');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const {storage} = require('./admin')

const puppeteer = require('puppeteer');
const nurseRenewal = require('./licenseRenewal/registeredNurse');
const generalHelpers = require('./licenseRenewal/generalHelpers');

exports.createThumbnail = functions.https.onRequest(async (req, res) => {
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
        const thumbURL = snapshot.ref.getDownloadURL()
          .then(() => {
            console.log("Upload successful. Download URL? : " + thumbURL);
          })
          .catch(error => {
            console.log("Error getting thumbnail URL. Error: " + error.toString());
          })
      })
      .catch(error => {
        console.log("Error uploading thumbnail. Error: " + error.toString());
      });

    fs.unlinkSync(tempFilePath);

    let myObj = {
      thumbnailURL: `https://storage.googleapis.com/cetracker-2de23.appspot.com/${thumbFilePath}`,
      bucket: `gs://cetracker-2de23.appspot.com/${thumbFilePath}`,
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(myObj));
  });
});

exports.puppeteerTest = functions
  .runWith({ timeoutSeconds: 450, memory: '1GB' })
  .https.onRequest(async (req, res) => {
    let username = "mhwang127";
    let password = "Bravery3E#";
    const uid = "7QBkQYXbbZNzoScPS368wP27CmK2";
    // let username = "linda58421";
    // let password = "Kibbles&bitz2";

    try {
      let page = await generalHelpers.configureBrowser();
      let result = await nurseRenewal.attemptLogin(page, username, password);
      if (!result.success) { throw result; }

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

      result = await nurseRenewal.handleApplicationQuestions(page);
      if (!result.success) { throw result; }

      result = await nurseRenewal.handleNameAndPersonalOrganizationDetails(page);
      if (!result.success) { throw result; }

      const changingAddress = true;
      result = await nurseRenewal.handleContactDetails(page, changingAddress, uid);
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

    return res.send({ status: 200, message: 'Successfully ran puppeteer' });
  })