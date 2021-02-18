const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
// export GOOGLE_APPLICATION_CREDENTIALS='/users/peter/documents/dev/ceSimplyAdminKey.json'

exports.db = admin.firestore();
exports.storage = admin.storage();
exports.admin = admin;