import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as logger from "firebase-functions/logger";
import { getLatestAnomalyData } from "../services/analytics.service.js";
import {
  getAlerts,
  storeAlert,
  triggerAnomalyAlert,
  triggerOccupancyAlert,
} from "../services/alert.service.js";

import { TOPICS, THRESHOLD_LIMITS, COLLECTIONS } from "../utils/constants.js";
import {
  getPriorityByAnomalyType,
  generateAnomalyMessage,
} from "../utils/helpers.js";
import * as admin from "firebase-admin";

// Real-time Anomaly Processing (Auto-triggered when AI writes to BigQuery)
export const processAnomalyRealtime = onMessagePublished(
  TOPICS.ANOMALY_STREAM,
  async (event) => {
    try {
      logger.info(
        "Processing real-time anomaly data:",
        event.data.message.json
      );

      // Get latest anomaly data from BigQuery
      const rows = await getLatestAnomalyData();

      if (!rows || rows.length === 0) {
        logger.warn("No recent anomaly data found");
        return;
      }

      // Process each anomaly detection
      for (const row of rows) {
        const annotation = row.annotation;
        const anomaly_type = annotation.anomaly_type;
        const confidence_score = annotation.confidence_score || 0;
        const location_zone = annotation.location_zone || "Unknown";

        // Only process high-confidence detections
        if (confidence_score >= THRESHOLD_LIMITS.CONFIDENCE.ANOMALY_MIN) {
          const anomalyData = {
            timestamp: row.ingestion_time,
            anomaly_type: anomaly_type,
            confidence_score: confidence_score,
            location: {
              lat: annotation.location_lat || 0,
              lng: annotation.location_lng || 0,
            },
            location_zone: location_zone,
            camera_id: annotation.camera_id,
            priority: getPriorityByAnomalyType(anomaly_type),
            status: "active",
            message: generateAnomalyMessage(anomaly_type, location_zone),
            acknowledged: false,
            last_updated: admin.firestore.FieldValue.serverTimestamp(),
          };

          // Store in Firestore for real-time updates
          await storeAlert(COLLECTIONS.ANOMALY_ALERTS, anomalyData);

          // Send notification
          await triggerAnomalyAlert(anomalyData);

          logger.info(
            `Anomaly alert triggered: ${anomaly_type} in ${location_zone} (confidence: ${confidence_score})`
          );
        } else {
          logger.info(
            `Low confidence anomaly ignored: ${anomaly_type} (confidence: ${confidence_score})`
          );
        }
      }

      logger.info("Anomaly processing completed");
    } catch (error) {
      logger.error("Error processing real-time anomaly data:", error);
    }
  }
);
