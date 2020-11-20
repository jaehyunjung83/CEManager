const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.createThumbnail = functions.https.onRequest(async (req, res) => {
  console.log(req.body);
  const bucket = admin.storage().bucket(); // Default bucket.
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
