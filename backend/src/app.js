import express from "express";
import errorHandler from "./middlewares/errorHandler.middlewares.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import { __dirname } from "./constants.js";

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

app.get("/", (_req, res, _next) => {
  res.status(200).json({
    message: "hello",
  });
});

import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import stockRoute from "./routes/stock.routes.js";
import marketRoute from "./routes/market.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/stock", stockRoute);
app.use("/api/v1/market", marketRoute);

app.use(errorHandler);

export default app;
