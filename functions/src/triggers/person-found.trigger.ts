import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as logger from "firebase-functions/logger";
import {
  sendToOrganizers,
  sendToSecurityTeam,
} from "../services/notification.service.js";
import { COLLECTIONS } from "../utils/constants.js";
import * as admin from "firebase-admin";

// Real-time Person Found Processing (Auto-triggered when person is located)
export const processPersonFoundRealtime = onMessagePublished(
  "person-found-stream",
  async (event) => {
    try {
      const personFoundData = event.data.message.json;
      logger.info("Processing person found data:", personFoundData);

      const {
        search_id,
        person_matches,
        confidence_scores,
        locations_found,
        timestamps,
      } = personFoundData;

      // Update search status in Firestore
      const searchUpdateData = {
        status: "completed",
        results: person_matches,
        confidence_scores: confidence_scores,
        locations_found: locations_found,
        completed_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin
        .firestore()
        .collection(COLLECTIONS.PERSON_SEARCHES)
        .doc(search_id)
        .update(searchUpdateData);

      // Send notification to relevant users
      if (person_matches && person_matches.length > 0) {
        const bestMatch = person_matches[0];
        const bestLocation = locations_found[0];

        await sendToSecurityTeam({
          title: "Person Located",
          body: `Person found in ${bestLocation.zone} at ${bestLocation.timestamp}`,
          data: {
            type: "person_found",
            search_id: search_id,
            location: JSON.stringify(bestLocation),
            confidence: confidence_scores[0].toString(),
          },
        });

        logger.info(`Person found notification sent for search ${search_id}`);
      } else {
        // No matches found
        await sendToSecurityTeam({
          title: "Person Search Completed",
          body: "No matches found for the person search",
          data: {
            type: "person_search_completed",
            search_id: search_id,
            result: "no_matches",
          },
        });

        logger.info(`No matches found for search ${search_id}`);
      }
    } catch (error) {
      logger.error("Error processing person found data:", error);
    }
  }
);
