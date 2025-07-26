import {
  bigquery,
  DATASET_ID,
  PROJECT_ID,
  TABLES,
} from "../config/bigquery.js";

export const getLatestOccupancyData = async () => {
  const query = `
    SELECT 
      ingestion_time,
      application,
      instance,
      node,
      annotation
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLES.OCCUPANCY_ANALYTICS}\`
    WHERE ingestion_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 MINUTE)
      AND node = 'occupancy_detector'
    ORDER BY ingestion_time DESC
    LIMIT 1
  `;

  const [rows] = await bigquery.query(query);
  return rows[0] || null;
};

export const getOccupancyAnalyticsData = async (filters: {
  start_time?: string;
  end_time?: string;
  location_zone?: string;
  aggregation?: string;
}) => {
  const {
    start_time,
    end_time,
    location_zone,
    aggregation = "hourly",
  } = filters;

  const timeFilter =
    start_time && end_time
      ? `ingestion_time BETWEEN '${start_time}' AND '${end_time}'`
      : `ingestion_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)`;

  const timeGroup =
    aggregation === "daily"
      ? `DATE(ingestion_time)`
      : `DATETIME_TRUNC(ingestion_time, HOUR)`;

  let query = `
    SELECT 
      ${timeGroup} as time_period,
      JSON_EXTRACT_SCALAR(annotation, '$.location_zone') as location_zone,
      AVG(CAST(JSON_EXTRACT_SCALAR(annotation, '$.person_count') AS INT64)) as avg_count,
      MAX(CAST(JSON_EXTRACT_SCALAR(annotation, '$.person_count') AS INT64)) as peak_count,
      MIN(CAST(JSON_EXTRACT_SCALAR(annotation, '$.person_count') AS INT64)) as min_count,
      SUM(CASE WHEN CAST(JSON_EXTRACT_SCALAR(annotation, '$.person_count') AS INT64) >= 40 THEN 1 ELSE 0 END) as alert_count
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLES.OCCUPANCY_ANALYTICS}\`
    WHERE ${timeFilter} AND node = 'occupancy_detector'
  `;

  if (location_zone) {
    query += ` AND JSON_EXTRACT_SCALAR(annotation, '$.location_zone') = '${location_zone}'`;
  }

  query += ` GROUP BY time_period, location_zone ORDER BY time_period DESC`;

  const [rows] = await bigquery.query(query);
  return rows;
};

export const getLatestAnomalyData = async () => {
  const query = `
    SELECT 
      ingestion_time,
      annotation
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLES.ANOMALY_DETECTION}\`
    WHERE ingestion_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 MINUTE)
      AND node = 'anomaly_detector'
    ORDER BY ingestion_time DESC
    LIMIT 5
  `;

  const [rows] = await bigquery.query(query);
  return rows;
};
