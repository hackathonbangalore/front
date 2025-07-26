import { messaging } from "../config/firebase.js";
import { USER_ROLES } from "../utils/constants.js";
import { getUsersByRole } from "../services/user.service.js";

import * as logger from "firebase-functions/logger";

export const sendToSecurityTeam = async (messageData: {
  title: string;
  body: string;
  data: any;
}) => {
  try {
    const users = await getUsersByRole(USER_ROLES.SECURITY_TEAM);
    const tokens = users
      .filter((user) => user.fcm_token)
      .map((user) => user.fcm_token);

    if (tokens.length > 0) {
      const response = await messaging.sendMulticast({
        notification: {
          title: messageData.title,
          body: messageData.body,
        },
        data: messageData.data,
        tokens: tokens,
      });

      logger.info(`FCM sent to ${response.successCount} security team members`);
      return response;
    }
    return;
  } catch (error) {
    logger.error("Error sending notification to security team:", error);
    throw error;
  }
};

export const sendToOrganizers = async (messageData: {
  title: string;
  body: string;
  data: any;
}) => {
  try {
    const users = await getUsersByRole(USER_ROLES.ORGANIZER_TEAM);
    const tokens = users
      .filter((user) => user.fcm_token)
      .map((user) => user.fcm_token);

    if (tokens.length > 0) {
      const response = await messaging.sendMulticast({
        notification: {
          title: messageData.title,
          body: messageData.body,
        },
        data: messageData.data,
        tokens: tokens,
      });

      logger.info(
        `FCM sent to ${response.successCount} organizer team members`
      );
      return response;
    }
    return;
  } catch (error) {
    logger.error("Error sending notification to organizers:", error);
    throw error;
  }
};
