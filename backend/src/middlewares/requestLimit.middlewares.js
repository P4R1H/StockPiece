import rateLimit from "express-rate-limit";

// Define a rate limiter for registration endpoints
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many accounts created from this IP, please try again after 15 minutes.",
});

// Define a rate limiter for waitlist email endpoints
const waitlistEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs (more restrictive for email)
  message: {
    error:
      "Too many email subscription attempts from this IP, please try again after 15 minutes.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Configuration for the registration limiter
const REGISTRATION_WINDOW_MS = process.env.REGISTRATION_WINDOW_MS; // 1 minute window
const MAX_REGISTRATIONS_PER_WINDOW = process.env.MAX_REGISTRATIONS_PER_WINDOW; // Global max registrations allowed per window
const BLOCK_TIME_MS = process.env.BLOCK_TIME_MS; // Block registration for 5 minutes if threshold exceeded

// Configuration for the waitlist email limiter
const WAITLIST_EMAIL_WINDOW_MS =
  process.env.WAITLIST_EMAIL_WINDOW_MS || 60 * 1000; // 1 minute window (default)
const MAX_WAITLIST_EMAILS_PER_WINDOW =
  process.env.MAX_WAITLIST_EMAILS_PER_WINDOW || 100; // Global max emails allowed per window (default)
const WAITLIST_EMAIL_BLOCK_TIME_MS =
  process.env.WAITLIST_EMAIL_BLOCK_TIME_MS || 5 * 60 * 1000; // Block for 5 minutes (default)

let registrationCount = 0;
let windowStart = Date.now();
let blockedUntil = null;

// Global waitlist email tracking
let waitlistEmailCount = 0;
let waitlistEmailWindowStart = Date.now();
let waitlistEmailBlockedUntil = null;

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

// Middleware to limit waitlist email subscriptions globally
function globalWaitlistEmailLimiter(req, res, next) {
  const now = Date.now();

  // If we're in a blocked state, reject all requests until the block expires
  if (waitlistEmailBlockedUntil && now < waitlistEmailBlockedUntil) {
    return res.status(429).json({
      message:
        "Too many email subscription attempts from this IP, please try again later.",
    });
  }

  // Reset the window if the time has passed
  if (now - waitlistEmailWindowStart > WAITLIST_EMAIL_WINDOW_MS) {
    waitlistEmailWindowStart = now;
    waitlistEmailCount = 0;
  }

  // Increment the waitlist email count
  waitlistEmailCount++;

  // If count exceeds the allowed threshold, trigger the block
  if (waitlistEmailCount > MAX_WAITLIST_EMAILS_PER_WINDOW) {
    waitlistEmailBlockedUntil = now + WAITLIST_EMAIL_BLOCK_TIME_MS;
    // Optionally reset count and windowStart for the next window
    waitlistEmailCount = 0;
    waitlistEmailWindowStart = now;
    return res.status(429).json({
      message: "Too many email subscription attempts. Please try again later.",
    });
  }

  next();
}

export {
  globalRequestLimiter,
  registrationLimiter,
  waitlistEmailLimiter,
  globalWaitlistEmailLimiter,
};
