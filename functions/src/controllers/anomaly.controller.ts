import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";
import { getAlerts } from "../services/alert.service.js";
import { COLLECTIONS } from "../utils/constants.js";

// API: Get Anomaly Alerts
export const getAnomalyAlerts = createFunction(async (req: any, res: any) => {
  try {
    const { status = "active", limit = 50 } = req.query;

    const alerts = await getAlerts(
      COLLECTIONS.ANOMALY_ALERTS,
      status,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    logger.error("Error fetching anomaly alerts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch anomaly alerts",
    });
  }
}, "get");
