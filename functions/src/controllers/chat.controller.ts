// controllers/chat.controller.ts
import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { getFirestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "../utils/constants.js";
import { z } from "zod";

// Initialize Firestore
const db = getFirestore();

// Define Firestore Tools

// Initialize Genkit AI with tools
const ai = genkit({
  plugins: [googleAI({ apiKey: "" })],
  model: googleAI.model("gemini-2.0-flash"),
});

const getOccupancyTool = ai.defineTool(
  {
    name: "getOccupancyStatus",
    description:
      "Get current occupancy status and visitor information from the security system",
    inputSchema: z.object({}),
    outputSchema: z.object({
      totalVisitors: z.number(),
      peakCapacity: z.number(),
      leadingZone: z.string(),
      timestamp: z.string(),
      success: z.boolean(),
    }),
  },
  async () => {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.OCCUPANCY_STATUS)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return {
          totalVisitors: 0,
          peakCapacity: 0,
          leadingZone: "No data available",
          timestamp: new Date().toISOString(), // ✅ Convert to string
          success: false,
        };
      }

      const data = snapshot.docs[0].data();
      return {
        totalVisitors: data.total_visitors || 0,
        peakCapacity: data.peak_capacity || 0,
        leadingZone: data.leading_zone || "Unknown",
        timestamp:
          data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(), // ✅ Convert Firestore timestamp to string
        success: true,
      };
    } catch (error) {
      logger.error("Error in getOccupancyTool:", error);
      return {
        totalVisitors: 0,
        peakCapacity: 0,
        leadingZone: "Error retrieving data",
        timestamp: new Date().toISOString(), // ✅ Convert to string
        success: false,
      };
    }
  }
);

const getAlertsTool = ai.defineTool(
  {
    name: "getActiveAlerts",
    description: "Get current active security alerts and incidents",
    inputSchema: z.object({}),
    outputSchema: z.object({
      alertCount: z.number(),
      highPriorityCount: z.number(),
      recentAlerts: z.array(
        z.object({
          type: z.string(),
          priority: z.string(),
          timestamp: z.string(),
        })
      ),
      success: z.boolean(),
    }),
  },
  async () => {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.ANOMALY_ALERTS)
        .where("status", "==", "active")
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();

      const alerts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          type: data.type || "Unknown",
          priority: data.priority || "medium",
          timestamp: data.timestamp || new Date().toISOString(),
        };
      });

      const highPriorityAlerts = alerts.filter(
        (alert) => alert.priority === "high" || alert.priority === "critical"
      );

      return {
        alertCount: alerts.length,
        highPriorityCount: highPriorityAlerts.length,
        recentAlerts: alerts.slice(0, 5), // Return top 5 recent alerts
        success: true,
      };
    } catch (error) {
      logger.error("Error in getAlertsTool:", error);
      return {
        alertCount: 0,
        highPriorityCount: 0,
        recentAlerts: [],
        success: false,
      };
    }
  }
);

const getSituationalSummaryTool = ai.defineTool(
  {
    name: "getSituationalSummary",
    description: "Get the latest situational summary and security report",
    inputSchema: z.object({}),
    outputSchema: z.object({
      summary: z.string(),
      incidentsToday: z.number(),
      resolvedIncidents: z.number(),
      timestamp: z.string(),
      success: z.boolean(),
    }),
  },
  async () => {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.OCCUPANCY_STATUS)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return {
          summary: "No situational summary available",
          incidentsToday: 0,
          resolvedIncidents: 0,
          timestamp: new Date().toISOString(),
          success: false,
        };
      }

      const data = snapshot.docs[0].data();
      return {
        summary: data.summary || "Summary not available",
        incidentsToday: data.incidents_today || 0,
        resolvedIncidents: data.resolved_incidents || 0,
        timestamp: data.timestamp || new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      logger.error("Error in getSituationalSummaryTool:", error);
      return {
        summary: "Error retrieving summary",
        incidentsToday: 0,
        resolvedIncidents: 0,
        timestamp: new Date().toISOString(),
        success: false,
      };
    }
  }
);
// API: Chat with Security Assistant
export const chatWithAssistant = createFunction(async (req: any, res: any) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    logger.info("Chat request received:", { message: message.trim() });

    // System prompt for Security Assistant
    const systemPrompt = `You are a Security Assistant for a security management system. 
    You help users with security-related queries including:
    - Occupancy status and visitor information
    - Security alerts and incidents  
    - Security summaries and reports
    - Zone capacity and monitoring
    
    You have access to real-time security data through tools. Use these tools when users ask about:
    - Current occupancy or visitor status → use getOccupancyStatus
    - Active alerts or security incidents → use getActiveAlerts  
    - Security summaries or reports → use getSituationalSummary
    
    Always provide helpful, professional responses. If data is unavailable, explain the situation clearly.
    Keep responses concise but informative.`;

    // Generate AI response with tools
    const contentResponse = await ai.generate({
      prompt: `${systemPrompt}\n\nUser Request: ${message.trim()}`,
      tools: [getOccupancyTool, getAlertsTool, getSituationalSummaryTool],
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const result = contentResponse.text;

    logger.info("Chat response generated successfully");

    res.status(200).json({
      success: true,
      response: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error in chat controller:", error);

    res.status(500).json({
      success: false,
      error: "Failed to generate chat response",
      timestamp: new Date().toISOString(),
    });
  }
}, "post");
