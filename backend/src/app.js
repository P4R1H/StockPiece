import express from "express";
import errorHandler from "./middlewares/errorHandler.middlewares.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import { __dirname } from "./constants.js";
import compression from "compression";
import cors from "cors";

const app = express();

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(
  cors({
    origin: [
      "https://stockpiece.fun",
      "https://admin.stockpiece.fun",
      "https://stockpiece.pages.dev",
      "https://www.stockpiece.fun",
      "https://www.stockpiece.pages.dev",
      ".stockpiece.fun",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(compression());
app.set("trust proxy", true);

import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import stockRouter from "./routes/stock.routes.js";
import marketRoute from "./routes/market.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import waitlistEmailRouter from "./routes/waitlistEmail.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/stock", stockRouter);
app.use("/api/v1/market", marketRoute);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/waitlist-email", waitlistEmailRouter);

app.get("/api/v1", (_req, res, _next) => {
  res.status(200).json("hello");
});

app.use(errorHandler);

export default app;
