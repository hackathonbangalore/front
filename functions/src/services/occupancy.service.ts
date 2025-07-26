import { firestore } from "../config/firebase.js";
import { COLLECTIONS } from "../utils/constants.js";

export const storeOccupancyStatus = async (
  location_zone: string,
  data: any
) => {
  return await firestore
    .collection(COLLECTIONS.OCCUPANCY_STATUS)
    .doc(location_zone)
    .set(data, { merge: true });
};

export const fetchOccupancyData = async (location_zone?: string) => {
  if (location_zone) {
    const doc = await firestore
      .collection(COLLECTIONS.OCCUPANCY_STATUS)
      .doc(location_zone)
      .get();
    return doc.exists ? doc.data() : null;
  }

  const snapshot = await firestore
    .collection(COLLECTIONS.OCCUPANCY_STATUS)
    .get();

  const results: any[] = [];
  snapshot.forEach((doc) => {
    results.push({ zone_id: doc.id, ...doc.data() });
  });

  return results;
};
