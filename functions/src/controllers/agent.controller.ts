import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";
import { GoogleAuth } from "google-auth-library";
import { Request, Response } from "express";

// Scopes required for AI Platform access
const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];

// The base URL for your Reasoning Engine.
const REASONING_ENGINE_BASE_URL =
  "https://us-central1-aiplatform.googleapis.com/v1/projects/clear-veld-467107-f0/locations/us-central1/reasoningEngines/2680301485262110720";

export const myAgent = createFunction(async (req: Request, res: Response) => {
  logger.info("Agent endpoint called", { structuredData: true });

  let sessionName: string | null = null;
  const auth = new GoogleAuth({ scopes: SCOPES });

  try {
    const client = await auth.getClient();

    // 1. Create a session with the Reasoning Engine.
    const createSessionResponse = await client.request<any>({
      url: `${REASONING_ENGINE_BASE_URL}/sessions`,
      method: "POST",
      data: {}, // An empty body is usually sufficient to start a session.
    });
    logger.info("Session creation response:", { data: createSessionResponse.data });
    return res.json("d")
    sessionName = createSessionResponse.data.name;

    if (!sessionName) {
      throw new Error("Failed to create a session with the Reasoning Engine.");
    }
    logger.info(`Created session: ${sessionName}`);

    // 2. Prepare and validate the request payload from the incoming request body.
    const payload = req.body;
    if (!payload || !payload.input || !payload.input.text) {
      logger.warn("Invalid payload received for agent query.", { body: req.body });
      return res.status(400).json({ success: false, error: "Invalid payload. Expected an object with 'input.text'." });
    }

    logger.info(`Sending payload to session ${sessionName}`, { payload });
    return res.json("ff");
    // 3. Query the session using the authenticated client.
    const queryResponse = await client.request({
      url: `https://us-central1-aiplatform.googleapis.com/v1/${sessionName}:query`,
      method: "POST",
      data: payload,
    });

    logger.info("Agent Response:", { data: queryResponse.data });
    return res.status(200).json(queryResponse.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error?.message || error.message;
    logger.error("Error calling reasoning agent:", { message: errorMessage, fullError: error?.response?.data || error });
    return res.status(500).json({ success: false, error: "Failed to call reasoning agent", details: errorMessage });
  } finally {
    // 4. Clean up the session to release resources.
    if (sessionName) {
      try {
        const client = await auth.getClient(); // Re-auth just in case
        await client.request({ url: `https://us-central1-aiplatform.googleapis.com/v1/${sessionName}`, method: "DELETE" });
        logger.info(`Successfully deleted session: ${sessionName}`);
      } catch (deleteError: any) {
        logger.error(`Failed to delete session ${sessionName}:`, { error: deleteError.message });
      }
    }
  }
}, "post");
