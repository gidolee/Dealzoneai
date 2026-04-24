import app from "./app";
import { prisma } from "./config/db";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

void startServer();
