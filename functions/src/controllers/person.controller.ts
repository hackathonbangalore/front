import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { createFunction } from "../utils/createFunction.js";
import { COLLECTIONS } from "../utils/constants.js";
import * as admin from "firebase-admin";
import { storeAlert } from "../services/alert.service.js";

// API: Search Person
export const searchPerson = createFunction(async (req: any, res: any) => {
  try {
    const { photo_url, additional_info, search_zones } = req.body;

    if (!photo_url) {
      return res.status(400).json({
        success: false,
        error: "Photo URL is required",
      });
    }

    // Create search request
    const searchRequest = {
      photo_url: photo_url,
      additional_info: additional_info || {},
      search_zones: search_zones || [],
      status: "processing",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      results: [],
    };

    const docRef = await storeAlert(COLLECTIONS.PERSON_SEARCHES, searchRequest);

    // TODO: Integrate with Vertex Vision AI for face detection
    // This would trigger the AI processing pipeline

    res.status(200).json({
      success: true,
      data: {
        search_id: docRef.id,
        status: "processing",
        message: "Person search initiated",
      },
    });
  } catch (error) {
    logger.error("Error initiating person search:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate person search",
    });
  }
}, "post");

// API: Get Person Search Results
export const getPersonSearchResults = createFunction(
  async (req: any, res: any) => {
    try {
      const { search_id } = req.query;

      if (!search_id) {
        return res.status(400).json({
          success: false,
          error: "Search ID is required",
        });
      }

      // const searchDoc = await firestore
      //   .collection(COLLECTIONS.PERSON_SEARCHES)
      //   .doc(search_id)
      //   .get();
      const searchDoc = {
        exists: true,
        data: () => {},
      };

      if (!searchDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "Search not found",
        });
      }

      res.status(200).json({
        success: true,
        data: searchDoc.data(),
      });
    } catch (error) {
      logger.error("Error fetching search results:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch search results",
      });
    }
  },
  "get"
);
