import express from "express";
import errorHandler from "./middlewares/errorHandler.middlewares.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import { __dirname } from "./constants.js";
import userRouter from "./routes/user.routes.js";

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

app.use("/api/v1/user", userRouter);

app.use(errorHandler);

export default app;
