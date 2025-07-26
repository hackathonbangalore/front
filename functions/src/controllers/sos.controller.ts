import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";
import {
  triggerSOSAlert,
  storeAlert,
  getAlerts,
} from "../services/alert.service.js";
import { COLLECTIONS } from "../utils/constants.js";
import * as admin from "firebase-admin";

// API: Create SOS Request
export const createSOSRequest = createFunction(async (req: any, res: any) => {
  try {
    const { message, user_id, position, priority = 1 } = req.body;

    if (!message || !user_id || !position) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: message, user_id, position",
      });
    }

    const sosRequest = {
      message: message,
      user_id: user_id,
      position: position, // {lat, lng}
      priority: priority,
      status: "active",
      response_status: "pending",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      created_at: new Date().toISOString(),
    };

    // Store in Firestore
    const docRef = await storeAlert(COLLECTIONS.SOS_REQUESTS, sosRequest);

    // Trigger immediate SOS alert
    await triggerSOSAlert({
      ...sosRequest,
      sos_id: docRef.id,
    });

    res.status(200).json({
      success: true,
      data: {
        sos_id: docRef.id,
        status: "created",
        message: "SOS request created and dispatch initiated",
      },
    });
  } catch (error) {
    logger.error("Error creating SOS request:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create SOS request",
    });
  }
}, "post");

// API: Get SOS Requests
export const getSOSRequests = createFunction(async (req: any, res: any) => {
  try {
    const { status = "active", limit = 50 } = req.query;

    const requests = await getAlerts(
      COLLECTIONS.SOS_REQUESTS,
      status,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    logger.error("Error fetching SOS requests:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch SOS requests",
    });
  }
}, "get");
