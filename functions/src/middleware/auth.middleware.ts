import { auth } from "../config/firebase.js";
import * as logger from "firebase-functions/logger";

export async function validateUserRole(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No authorization token provided",
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid authorization token",
    });
  }
}
