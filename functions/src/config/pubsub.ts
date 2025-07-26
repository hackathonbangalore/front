import { PubSub } from "@google-cloud/pubsub";

export const pubsub = new PubSub();

export const TOPICS = {
  OCCUPANCY_STREAM: "bigquery-occupancy-stream",
  ANOMALY_STREAM: "bigquery-anomaly-stream",
  OCCUPANCY_ALERTS: "occupancy-alerts",
  ANOMALY_ALERTS: "anomaly-alerts",
};
