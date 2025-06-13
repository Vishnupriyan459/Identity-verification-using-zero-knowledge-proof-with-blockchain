import admin from "firebase-admin";

// Initialize Firebase Admin SDK using your service account key
const serviceAccount = require("./go.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// module.exports = admin;
// export default serviceAccount;
module.exports = admin;
