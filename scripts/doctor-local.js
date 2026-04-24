#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const rootDir = path.resolve(__dirname, "..");
const backendEnvPath = path.join(rootDir, "backend", ".env");

function fail(message) {
  console.error(`\n[doctor] FAIL: ${message}`);
  process.exit(1);
}

async function main() {
  console.log("[doctor] Checking local setup...");

  if (!fs.existsSync(backendEnvPath)) {
    fail("Missing backend/.env. Run `npm run setup:dev`.");
  }

  dotenv.config({ path: backendEnvPath });

  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL is missing in backend/.env.");
  }

  console.log("[doctor] backend/.env found");
  console.log("[doctor] DATABASE_URL configured");

  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[doctor] Database reachable");

    let usersCount = 0;
    let dealsCount = 0;
    let hasDemoUser = false;

    try {
      usersCount = await prisma.user.count();
      dealsCount = await prisma.deal.count();
      const demoUser = await prisma.user.findUnique({
        where: { email: "customer@dealpilot.app" },
        select: { email: true }
      });
      hasDemoUser = Boolean(demoUser);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2021") {
        fail("Database schema is missing. Run `npm run setup:db`.");
      }
      throw error;
    }

    console.log(`[doctor] users: ${usersCount}`);
    console.log(`[doctor] deals: ${dealsCount}`);

    if (!hasDemoUser) {
      console.log("[doctor] Demo user not found. Run `npm --workspace backend run seed`.");
    } else {
      console.log("[doctor] Demo login ready: customer@dealpilot.app / password123");
    }

    console.log("\n[doctor] OK: local environment is ready.");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P1000") {
        fail("Invalid database credentials. Update DATABASE_URL in backend/.env.");
      }
      if (error.code === "P1001") {
        fail("Cannot reach database at DATABASE_URL. Ensure Postgres is running.");
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown local environment error.";
    if (errorMessage.includes("Can't reach database server")) {
      fail("Cannot reach database at DATABASE_URL. Ensure Postgres is running.");
    }
    if (errorMessage.includes("provided database credentials")) {
      fail("Invalid database credentials. Update DATABASE_URL in backend/.env.");
    }

    fail(errorMessage);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
