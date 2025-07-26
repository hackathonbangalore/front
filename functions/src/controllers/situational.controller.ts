import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";
import { firestore } from "../config/firebase.js";
import { COLLECTIONS } from "../utils/constants.js";
import * as admin from "firebase-admin";

// API: Get Situational Summary
export const getSituationalSummary = createFunction(
  async (req: any, res: any) => {
    try {
      // Get current occupancy status
      const occupancySnapshot = await firestore
        .collection(COLLECTIONS.OCCUPANCY_STATUS)
        .get();

      // Get active alerts
      const alertsSnapshot = await firestore
        .collection(COLLECTIONS.ANOMALY_ALERTS)
        .where("status", "==", "active")
        .get();

      // Get active SOS requests
      const sosSnapshot = await firestore
        .collection(COLLECTIONS.SOS_REQUESTS)
        .where("status", "==", "active")
        .get();

      const occupancyData: any[] = [];
      occupancySnapshot.forEach((doc) => {
        occupancyData.push({ zone: doc.id, ...doc.data() });
      });

      const activeAlerts: any[] = [];
      alertsSnapshot.forEach((doc) => {
        activeAlerts.push({ id: doc.id, ...doc.data() });
      });

      const activeSOS: any[] = [];
      sosSnapshot.forEach((doc) => {
        activeSOS.push({ id: doc.id, ...doc.data() });
      });

      const summary = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        overall_status: calculateOverallStatus(
          occupancyData,
          activeAlerts,
          activeSOS
        ),
        occupancy: {
          total_zones: occupancyData.length,
          high_density_zones: occupancyData.filter(
            (zone) =>
              zone.density_level === "high" || zone.density_level === "critical"
          ).length,
          total_people: occupancyData.reduce(
            (sum, zone) => sum + (zone.current_count || 0),
            0
          ),
        },
        alerts: {
          total_active: activeAlerts.length,
          critical_alerts: activeAlerts.filter((alert) => alert.priority === 2)
            .length,
          by_type: groupAlertsByType(activeAlerts),
        },
        emergency: {
          active_sos: activeSOS.length,
          pending_response: activeSOS.filter(
            (sos) => sos.response_status === "pending"
          ).length,
        },
      };

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error("Error generating situational summary:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate situational summary",
      });
    }
  },
  "get"
);

// Helper functions
function calculateOverallStatus(
  occupancy: any[],
  alerts: any[],
  sos: any[]
): string {
  if (sos.length > 0) return "emergency";
  if (alerts.filter((a) => a.priority === 2).length > 0) return "critical";
  if (alerts.length > 0) return "warning";
  if (occupancy.filter((z) => z.density_level === "critical").length > 0)
    return "high_occupancy";
  return "normal";
}

function groupAlertsByType(alerts: any[]): { [key: string]: number } {
  const grouped: { [key: string]: number } = {};
  alerts.forEach((alert) => {
    const type = alert.anomaly_type || "unknown";
    grouped[type] = (grouped[type] || 0) + 1;
  });
  return grouped;
}
