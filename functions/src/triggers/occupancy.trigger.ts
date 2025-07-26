import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as logger from "firebase-functions/logger";
import { getLatestOccupancyData } from "../services/analytics.service.js";
import { triggerOccupancyAlert } from "../services/alert.service.js";
import { storeOccupancyStatus } from "../services/occupancy.service.js";
import { TOPICS, THRESHOLD_LIMITS } from "../utils/constants.js";
import {
  calculateDensityLevel,
  isThresholdExceeded,
} from "../utils/helpers.js";
import * as admin from "firebase-admin";

// Real-time Occupancy Processing (Auto-triggered when AI writes to BigQuery)
export const processOccupancyRealtime = onMessagePublished(
  TOPICS.OCCUPANCY_STREAM,
  async (event) => {
    try {
      logger.info(
        "Processing real-time occupancy data:",
        event.data.message.json
      );

      // Get latest occupancy data from BigQuery
      const latestData = await getLatestOccupancyData();

      if (!latestData) {
        logger.warn("No recent occupancy data found");
        return;
      }

      const annotation = latestData.annotation;
      const person_count = annotation.person_count || 0;
      const location_zone = annotation.location_zone;
      const camera_id = annotation.camera_id;

      // Calculate metrics
      const density_level = calculateDensityLevel(person_count);
      const warning_exceeded = isThresholdExceeded(person_count, "warning");
      const critical_exceeded = isThresholdExceeded(person_count, "critical");

      // Create real-time status for Firestore
      const occupancyStatus = {
        timestamp: latestData.ingestion_time,
        location_zone: location_zone,
        camera_id: camera_id,
        current_count: person_count,
        density_level: density_level,
        threshold_status: {
          warning_exceeded: warning_exceeded,
          critical_exceeded: critical_exceeded,
        },
        people_flow: {
          entering: annotation.people_entering || 0,
          exiting: annotation.people_exiting || 0,
          net_change:
            (annotation.people_entering || 0) -
            (annotation.people_exiting || 0),
        },
        alert_triggered: warning_exceeded,
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store in Firestore for real-time Angular updates
      await storeOccupancyStatus(location_zone, occupancyStatus);

      // Trigger alert if threshold exceeded
      if (warning_exceeded) {
        const alertData = {
          type: "occupancy_alert",
          priority: critical_exceeded ? 2 : 1,
          severity: critical_exceeded ? "critical" : "warning",
          location_zone: location_zone,
          person_count: person_count,
          density_level: density_level,
          camera_id: camera_id,
          timestamp: latestData.ingestion_time,
          message: `${
            critical_exceeded ? "CRITICAL" : "WARNING"
          } occupancy alert in ${location_zone}: ${person_count} people detected`,
        };

        await triggerOccupancyAlert(alertData);
        logger.info("Occupancy alert triggered:", alertData);
      }

      logger.info(
        `Occupancy processing completed for ${location_zone}: ${person_count} people`
      );
    } catch (error) {
      logger.error("Error processing real-time occupancy data:", error);
    }
  }
);
