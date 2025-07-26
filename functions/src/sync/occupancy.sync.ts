import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  getLatestOccupancyData,
  getOccupancyAnalyticsData,
} from "../services/analytics.service.js";
import { storeOccupancyStatus } from "../services/occupancy.service.js";
import {
  calculateDensityLevel,
  isThresholdExceeded,
} from "../utils/helpers.js";
import { firestore } from "../config/firebase.js";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Sync occupancy status data: BigQuery → Firestore every minute
export const syncOccupancyStatus = onSchedule(
  "every 1 minutes",
  async (event) => {
    try {
      logger.info("Syncing occupancy status...");

      // Get data from BigQuery
      const data = await getLatestOccupancyData();

      if (data && data.annotation) {
        const annotation = data.annotation;
        const person_count = annotation.person_count || 0;
        const location_zone = annotation.location_zone;
        const camera_id = annotation.camera_id;

        // Calculate metrics
        const density_level = calculateDensityLevel(person_count);
        const warning_exceeded = isThresholdExceeded(person_count, "warning");
        const critical_exceeded = isThresholdExceeded(person_count, "critical");

        // Create occupancy status with all calculations
        const occupancyStatus = {
          timestamp: data.ingestion_time,
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

        // Store to Firestore
        await storeOccupancyStatus(location_zone, occupancyStatus);

        logger.info("Occupancy status synced successfully", {
          location_zone,
          person_count,
          density_level,
          warning_exceeded,
          critical_exceeded,
        });
      }
    } catch (error) {
      logger.error("Occupancy status sync failed:", error);
    }
  }
);

// Sync analytics data: BigQuery → Firestore every 5 minutes
export const syncOccupancyAnalytics = onSchedule(
  "every 5 minutes",
  async (event) => {
    try {
      logger.info("Syncing occupancy analytics...");

      // Get analytics data from BigQuery
      const analyticsData = await getOccupancyAnalyticsData({
        aggregation: "hourly",
      });

      if (analyticsData && analyticsData.length > 0) {
        // Store analytics to Firestore
        await firestore.collection("occupancy_analytics").doc("latest").set({
          data: analyticsData,
          last_updated: new Date(),
          record_count: analyticsData.length,
        });

        logger.info("Occupancy analytics synced successfully", {
          record_count: analyticsData.length,
        });
      }
    } catch (error) {
      logger.error("Occupancy analytics sync failed:", error);
    }
  }
);
