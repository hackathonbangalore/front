import { firestore } from "../config/firebase.js";
import { COLLECTIONS, ALERT_TYPES } from "../utils/constants.js";
import * as admin from "firebase-admin";
import {
  sendToOrganizers,
  sendToSecurityTeam,
} from "../services/notification.service.js";

export const storeAlert = async (collection: string, data: any) => {
  return await firestore.collection(collection).add({
    ...data,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const getAlerts = async (
  collection: string,
  status?: string,
  limit: number = 50
) => {
  let query = firestore
    .collection(collection)
    .orderBy("timestamp", "desc")
    .limit(limit);

  if (status && status !== "all") {
    query = query.where("status", "==", status) as any;
  }

  const snapshot = await query.get();
  const results: any[] = [];

  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  return results;
};

export const triggerOccupancyAlert = async (alertData: any) => {
  try {
    // Store alert in Firestore
    const alertDoc = {
      ...alertData,
      alert_id: `occupancy_${Date.now()}`,
      status: "active",
      acknowledged: false,
      type: ALERT_TYPES.OCCUPANCY,
    };

    await storeAlert(COLLECTIONS.ALERTS, alertDoc);

    await sendToSecurityTeam({
      title: `${alertData.severity.toUpperCase()} Occupancy Alert`,
      body: `${alertData.person_count} people detected in ${alertData.location_zone}`,
      data: {
        type: ALERT_TYPES.OCCUPANCY,
        location_zone: alertData.location_zone,
        person_count: alertData.person_count.toString(),
        priority: alertData.priority.toString(),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const triggerAnomalyAlert = async (anomalyData: any) => {
  try {
    await sendToSecurityTeam({
      title: `${anomalyData.anomaly_type.toUpperCase()} Detected`,
      body: anomalyData.message,
      data: {
        type: ALERT_TYPES.ANOMALY,
        anomaly_type: anomalyData.anomaly_type,
        confidence: anomalyData.confidence_score.toString(),
        priority: anomalyData.priority.toString(),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const triggerSOSAlert = async (sosData: any) => {
  try {
    await sendToOrganizers({
      title: "EMERGENCY - SOS Request",
      body: `${sosData.message} - User ID: ${sosData.user_id}`,
      data: {
        type: ALERT_TYPES.SOS,
        sos_id: sosData.sos_id,
        priority: sosData.priority.toString(),
        position: JSON.stringify(sosData.position),
      },
    });
  } catch (error) {
    throw error;
  }
};
