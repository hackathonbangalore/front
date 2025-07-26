import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";
import {
  storeOccupancyStatus,
  fetchOccupancyData,
} from "../services/occupancy.service.js";
import { getOccupancyAnalyticsData } from "../services/analytics.service.js";

// API: Get Current Occupancy Status
export const getOccupancyStatus = createFunction(async (req: any, res: any) => {
  try {
    const { location_zone } = req.query;

    const data = await fetchOccupancyData(location_zone);

    if (data) {
      return res.status(200).json({
        success: true,
        data: data,
      });
    }

    res.status(404).json({
      success: false,
      error: "No occupancy data found",
    });
  } catch (error) {
    logger.error("Error fetching occupancy status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch occupancy status",
    });
  }
}, "get");

// API: Get Occupancy Analytics
export const getOccupancyAnalytics = createFunction(
  async (req: any, res: any) => {
    try {
      const {
        start_time,
        end_time,
        location_zone,
        aggregation = "hourly",
      } = req.query;

      const filters = {
        start_time,
        end_time,
        location_zone,
        aggregation,
      };

      const rows = await getOccupancyAnalyticsData(filters);

      // Calculate summary statistics
      const summary = {
        total_zones: new Set(rows.map((row: any) => row.location_zone)).size,
        total_alerts: rows.reduce(
          (sum: number, row: any) => sum + (row.alert_count || 0),
          0
        ),
        peak_occupancy: Math.max(
          ...rows.map((row: any) => row.peak_count || 0)
        ),
        avg_occupancy:
          rows.reduce(
            (sum: number, row: any) => sum + (row.avg_count || 0),
            0
          ) / rows.length || 0,
      };

      res.status(200).json({
        success: true,
        data: {
          analytics: rows,
          summary: summary,
          query_params: filters,
        },
      });
    } catch (error) {
      logger.error("Error fetching occupancy analytics:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch occupancy analytics",
      });
    }
  },
  "get"
);
