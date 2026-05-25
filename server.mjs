import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const nextBin = fileURLToPath(new URL("./node_modules/next/dist/bin/next", import.meta.url));

if (!existsSync(nextBin)) {
  console.error("Next.js is not installed yet. Run `npm install` first.");
  process.exit(1);
}

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || "4173";
const child = spawn(process.execPath, [nextBin, "dev", "--webpack", "--hostname", host, "--port", port], {
  env: {
    ...process.env,
    NAPI_RS_FORCE_WASI: process.env.NAPI_RS_FORCE_WASI || "1",
    NEXT_TEST_WASM_DIR: process.env.NEXT_TEST_WASM_DIR || "node_modules/@next/swc-wasm-nodejs"
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
