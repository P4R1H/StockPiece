import express from "express";
import {
  subscribeWaitlistEmail,
  getAllWaitlistEmails,
  unsubscribeWaitlistEmail,
} from "./waitlistController.js";

const router = express.Router();

// POST /api/waitlist/subscribe - Subscribe to waitlist
router.post("/subscribe", subscribeWaitlistEmail);

// GET /api/waitlist - Get all waitlist emails with pagination
router.get("/", getAllWaitlistEmails);

// POST /api/waitlist/unsubscribe - Unsubscribe from waitlist
router.post("/unsubscribe", unsubscribeWaitlistEmail);

export default router;
