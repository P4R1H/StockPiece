import express from "express";
import errorHandler from "./middlewares/errorHandler.middlewares.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import { __dirname } from "./constants.js";
import cors from "cors";
import compression from 'compression';
import clusterMiddleware from "./middlewares/cluster.middlewares.js";

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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // credentials: true
  })
);
app.use(compression());
app.use(clusterMiddleware);

import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import stockRoute from "./routes/stock.routes.js";
import marketRoute from "./routes/market.routes.js";
import couponRouter from "./routes/coupon.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/stock", stockRoute);
app.use("/api/v1/market", marketRoute);
app.use("/api/v1/coupon", couponRouter);

app.get("/api/v1",(_req, res, _next) => {
  res.status(200).json('hello')
})

app.use(errorHandler);

export default app;
