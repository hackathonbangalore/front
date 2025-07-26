import { firestore } from "../config/firebase.js";
import { COLLECTIONS } from "../utils/constants.js";

export const getUsersByRole = async (role: string) => {
  const snapshot = await firestore
    .collection(COLLECTIONS.USERS)
    .where("role", "==", role)
    .get();

  const users: any[] = [];
  snapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });

  return users;
};
