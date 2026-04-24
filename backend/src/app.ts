import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import routes from "./routes";

const app = express();

const vercelAppPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const localhostPattern = /^http:\/\/localhost:\d+$/i;
const loopbackPattern = /^http:\/\/127\.0\.0\.1:\d+$/i;

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        origin === env.CLIENT_URL ||
        vercelAppPattern.test(origin) ||
        localhostPattern.test(origin) ||
        loopbackPattern.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    }
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
