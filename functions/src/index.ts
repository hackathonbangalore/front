import "./config/firebase.js";

import { ping } from "./controllers/ping.controller.js";
export { ping };

import {
  getOccupancyStatus,
  getOccupancyAnalytics,
} from "./controllers/occupancy.controller.js";
export { getOccupancyStatus, getOccupancyAnalytics };

// Auto-sync functions (run automatically)
import {
  syncOccupancyStatus,
  syncOccupancyAnalytics,
} from "./sync/occupancy.sync.js";
export { syncOccupancyStatus, syncOccupancyAnalytics };

import { processOccupancyRealtime } from "./triggers/occupancy.trigger.js";
export { processOccupancyRealtime };

import { getAnomalyAlerts } from "./controllers/anomaly.controller.js";
export { getAnomalyAlerts };

import { processAnomalyRealtime } from "./triggers/anomaly.trigger.js";
export { processAnomalyRealtime };

import { getSituationalSummary } from "./controllers/situational.controller.js";
export { getSituationalSummary };

import {
  createSOSRequest,
  getSOSRequests,
} from "./controllers/sos.controller.js";
export { createSOSRequest, getSOSRequests };

import {
  searchPerson,
  getPersonSearchResults,
} from "./controllers/person.controller.js";
export { searchPerson, getPersonSearchResults };
