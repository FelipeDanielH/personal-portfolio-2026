import { spawn } from "node:child_process";
import path from "node:path";
import {
  createProductionChildEnvironment,
  readProductionEnvironment,
} from "./production-env.mjs";

const args = process.argv.slice(2);
const allowedCommands = new Set([
  "migrate:status",
  "migrate",
  "run scripts/seed-payload.ts",
  "run scripts/validate-payload-content.ts",
]);
const requestedCommand = args.join(" ");

if (!allowedCommands.has(requestedCommand)) {
  throw new Error(`Production command is not allowed: ${requestedCommand || "(empty)"}`);
}

const productionEnvironment = readProductionEnvironment();
const environment = createProductionChildEnvironment(productionEnvironment);
const payloadCli = path.resolve(process.cwd(), "node_modules", "payload", "bin.js");

console.log(
  "Production environment: .env.production.local (NODE_ENV=production, DATABASE_URL present, push=false)",
);

const child = spawn(process.execPath, [payloadCli, ...args], {
  cwd: process.cwd(),
  env: environment,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Unable to start Production command: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
