export const THRESHOLD_LIMITS = {
  OCCUPANCY: {
    WARNING: 40,
    CRITICAL: 50,
  },
  CONFIDENCE: {
    ANOMALY_MIN: 0.7,
  },
};

export const PRIORITY_LEVELS = {
  NORMAL: 1,
  URGENT: 2,
};

export const USER_ROLES = {
  SECURITY_TEAM: "security_team",
  ORGANIZER_TEAM: "organizer_team",
};

export const ALERT_TYPES = {
  OCCUPANCY: "occupancy_alert",
  ANOMALY: "anomaly_alert",
  SOS: "sos_alert",
};

export const COLLECTIONS = {
  USERS: "users",
  OCCUPANCY_STATUS: "occupancy_status",
  ANOMALY_ALERTS: "anomaly_alerts",
  ALERTS: "alerts",
  SOS_REQUESTS: "sos_requests",
  PERSON_SEARCHES: "person_searches",
};

export const TOPICS = {
  ANOMALY_STREAM: "",
  OCCUPANCY_STREAM: "",
};
