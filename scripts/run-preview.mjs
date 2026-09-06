import { spawn } from "node:child_process";
import path from "node:path";
import { createPreviewChildEnvironment, readPreviewEnvironment } from "./preview-env.mjs";

const [command, ...args] = process.argv.slice(2);

if (command !== "payload") {
  throw new Error("Preview commands may only invoke Payload.");
}

const previewEnv = readPreviewEnvironment();
const environment = createPreviewChildEnvironment(previewEnv);
const payloadCli = path.resolve(process.cwd(), "node_modules", "payload", "bin.js");

console.log("Preview environment: .env.preview.local (NODE_ENV=production, DATABASE_URL present, push=false)");

const child = spawn(process.execPath, [payloadCli, ...args], {
  cwd: process.cwd(),
  env: environment,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Unable to start Preview command: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
