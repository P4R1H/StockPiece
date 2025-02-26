import rateLimit from "express-rate-limit";

// Define a rate limiter for registration endpoints
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many accounts created from this IP, please try again after 15 minutes.",
});

// Configuration for the registration limiter
const REGISTRATION_WINDOW_MS = process.env.REGISTRATION_WINDOW_MS; // 1 minute window
const MAX_REGISTRATIONS_PER_WINDOW = process.env.MAX_REGISTRATIONS_PER_WINDOW; // Global max registrations allowed per window
const BLOCK_TIME_MS = process.env.BLOCK_TIME_MS; // Block registration for 5 minutes if threshold exceeded

let registrationCount = 0;
let windowStart = Date.now();
let blockedUntil = null;

// Middleware to limit account creation globally
function globalRequestLimiter(req, res, next) {
  const now = Date.now();

  // If we're in a blocked state, reject all requests until the block expires
  if (blockedUntil && now < blockedUntil) {
    return res.status(429).json({
      message:
        "Too many accounts are being created right now. Please try again later.",
    });
  }

  // Reset the window if the time has passed
  if (now - windowStart > REGISTRATION_WINDOW_MS) {
    windowStart = now;
    registrationCount = 0;
  }

  // Increment the registration count
  registrationCount++;

  // If count exceeds the allowed threshold, trigger the block
  if (registrationCount > MAX_REGISTRATIONS_PER_WINDOW) {
    blockedUntil = now + BLOCK_TIME_MS;
    // Optionally reset count and windowStart for the next window
    registrationCount = 0;
    windowStart = now;
    return res.status(429).json({
      message:
        "Too many accounts are being created. Registration is temporarily disabled. Please try again later.",
    });
  }

  next();
}

export { globalRequestLimiter, registrationLimiter };
