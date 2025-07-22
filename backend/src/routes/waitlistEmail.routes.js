import { Router } from "express";
import {
  subscribeWaitlistEmail,
  getAllWaitlistEmails,
  unsubscribeWaitlistEmail,
} from "../controllers/waitlistEmail.controllers.js";
import {
  waitlistEmailLimiter,
  globalWaitlistEmailLimiter,
} from "../middlewares/requestLimit.middlewares.js";

const router = Router();

// Apply both IP-based and global rate limiting to subscribe and unsubscribe endpoints
router
  .route("/subscribe")
  .post(
    globalWaitlistEmailLimiter,
    waitlistEmailLimiter,
    subscribeWaitlistEmail
  );
router
  .route("/unsubscribe")
  .post(
    globalWaitlistEmailLimiter,
    waitlistEmailLimiter,
    unsubscribeWaitlistEmail
  );
router.route("/").get(getAllWaitlistEmails); // No rate limiting for GET requests

export default router;
