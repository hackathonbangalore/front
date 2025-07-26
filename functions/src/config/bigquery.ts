import { BigQuery } from "@google-cloud/bigquery";

export const PROJECT_ID = "clear-veld-467107-f0";
export const DATASET_ID = "ingestdata";

export const bigquery = new BigQuery({
  projectId: PROJECT_ID, // ← Add this line!
});

export const TABLES = {
  OCCUPANCY_ANALYTICS: "occupancy_analytics",
  ANOMALY_DETECTION: "anomaly_detection",
};
