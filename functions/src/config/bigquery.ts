import { BigQuery } from "@google-cloud/bigquery";

export const bigquery = new BigQuery();

export const DATASET_ID = "your-dataset";
export const PROJECT_ID = "your-project-id";

export const TABLES = {
  OCCUPANCY_ANALYTICS: "occupancy_analytics",
  ANOMALY_DETECTION: "anomaly_detection",
};
