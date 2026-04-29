import { spawn } from "node:child_process";
import http from "node:http";
import process from "node:process";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const isWindows = process.platform === "win32";

function spawnCommand(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: isWindows,
    windowsHide: true,
    ...options,
  });
}

function waitForServer(url, timeoutMs = 120_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(check, 500);
      });

      request.setTimeout(2_000, () => {
        request.destroy();
      });
    };

    check();
  });
}

function stopProcessTree(child) {
  if (!child.pid) return Promise.resolve();

  return new Promise((resolve) => {
    const finish = () => {
      child.kill();
      child.unref();
      resolve();
    };

    if (isWindows) {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
        windowsHide: true,
      });
      const timeout = setTimeout(finish, 1_500);
      killer.on("close", () => {
        clearTimeout(timeout);
        finish();
      });
      killer.on("error", () => {
        clearTimeout(timeout);
        finish();
      });
      return;
    }

    child.kill("SIGTERM");
    child.unref();
    resolve();
  });
}

function runPlaywright(playwrightCli) {
  const testProcess = spawn(process.execPath, [playwrightCli, "test"], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    windowsHide: true,
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: baseURL,
      PLAYWRIGHT_PORT: String(port),
    },
  });
  let output = "";
  let settled = false;

  return new Promise((resolve) => {
    const finish = (code) => {
      if (settled) return;
      settled = true;
      testProcess.kill();
      resolve(code);
    };

    const handleOutput = (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);

      if (output.includes("failed")) {
        setTimeout(() => finish(1), 250);
        return;
      }

      if (output.includes("passed")) {
        setTimeout(() => finish(0), 250);
      }
    };

    testProcess.stdout.on("data", handleOutput);
    testProcess.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
      if (output.includes("failed")) {
        setTimeout(() => finish(1), 250);
        return;
      }
      if (output.includes("passed")) {
        setTimeout(() => finish(0), 250);
      }
    });
    testProcess.on("close", (code) => finish(code ?? 1));
    testProcess.on("error", () => finish(1));
  });
}

async function main() {
  const npmCommand = isWindows ? "npm.cmd" : "npm";
  const devServer = spawnCommand(npmCommand, ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)]);

  try {
    await waitForServer(baseURL);

    const playwrightCli = fileURLToPath(new URL("../node_modules/@playwright/test/cli.js", import.meta.url));
    process.exitCode = await runPlaywright(playwrightCli);
  } finally {
    await stopProcessTree(devServer);
  }
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
