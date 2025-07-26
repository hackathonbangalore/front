  import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";

export const ping = createFunction((req: any, res: any) => {
  logger.info("Ping endpoint called", { structuredData: true });
  res.send("Hello from Event Security Management System!");
}, "get");
