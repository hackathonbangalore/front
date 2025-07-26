// src/controllers/dummy.controller.ts

import { createFunction } from "../utils/createFunction.js";
import {
  bigquery,
  PROJECT_ID,
  DATASET_ID,
  TABLES,
} from "../config/bigquery.js";
import { onSchedule } from "firebase-functions/v2/scheduler";

// Simple scheduled function - runs every minute automatically
export const generateDummyData = onSchedule(
  "every 1 minutes",
  async (event) => {
    try {
      const dummyData = [
        {
          ingestion_time: new Date().toISOString(),
          application: "occupancy-detector",
          instance: "prod-instance-01",
          node: "occupancy_detector",
          annotation: JSON.stringify({
            location_zone: ["zone_a", "zone_b", "zone_c"][
              Math.floor(Math.random() * 3)
            ],
            camera_id: ["CAM-01", "CAM-02", "CAM-03"][
              Math.floor(Math.random() * 3)
            ],
            person_count: Math.floor(Math.random() * 60) + 10,
            people_entering: Math.floor(Math.random() * 10),
            people_exiting: Math.floor(Math.random() * 8),
            confidence_score: 0.85 + Math.random() * 0.15,
          }),
        },
        {
          ingestion_time: new Date().toISOString(),
          application: "anomaly-detector",
          instance: "prod-instance-01",
          node: "anomaly_detector",
          annotation: JSON.stringify({
            anomaly_type: "overcrowding",
            location_zone: "zone_a",
            camera_id: "CAM-01",
            confidence_score: 0.87,
            severity: "high",
            message: "Unusual crowd density detected in zone A",
            person_count: 65,
            threshold_exceeded: true,
            detection_timestamp: new Date().toISOString(),
          }),
        },
      ];

      const table = bigquery
        .dataset(DATASET_ID)
        .table(TABLES.OCCUPANCY_ANALYTICS);
      await table.insert(dummyData);
    } catch (error) {
      console.error("Error generating dummy data:", error);
    }
  }
);

// Manual trigger for immediate data
export const insertOneDummyRecord = createFunction(
  async (req: any, res: any) => {
    try {
      const dummyData = [
        {
          ingestion_time: new Date().toISOString(),
          application: "occupancy-detector",
          instance: "prod-instance-01",
          node: "occupancy_detector",
          annotation: JSON.stringify({
            // ← Stringify the JSON
            location_zone: "zone_a",
            camera_id: "CAM-01",
            person_count: 45,
            people_entering: 5,
            people_exiting: 2,
            confidence_score: 0.9,
          }),
        },
      ];

      console.log("Data being inserted:", JSON.stringify(dummyData, null, 2)); // ← Add this line

      const table = bigquery
        .dataset(DATASET_ID)
        .table(TABLES.OCCUPANCY_ANALYTICS);
      await table.insert(dummyData);

      res.status(200).json({
        success: true,
        message: "One dummy record inserted!",
        data: dummyData[0],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);
