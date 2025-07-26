import admin from "firebase-admin";
if (!admin.apps?.length) {
  admin.initializeApp();
}

export const firestore = admin.firestore();
export const messaging = admin.messaging();
export const auth = admin.auth();

export default admin;
