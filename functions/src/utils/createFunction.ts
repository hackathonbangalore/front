import cors from "cors";
import express from "express";
import { onRequest } from "firebase-functions/v2/https";

export const createFunction = (handler: any, method = "get") => {
  const app = express();

  app.use(cors({ origin: true }));

  app[method]("/", handler);

  return onRequest(app);
};
