/**
 * Verify KeystoneEscrow on the Arc explorer (Blockscout).
 *
 *   CONTRACT=0xYourDeployedAddress node scripts/verify.mjs
 *
 * What it does:
 *   1. Regenerates the EXACT standard-JSON input used at compile time
 *      (solc 0.8.28, optimizer on, 200 runs) and saves it to
 *      contracts/build/verification-input.json
 *   2. Tries the Blockscout verification API automatically
 *   3. If the API call fails, prints the 2-minute manual path
 *      (Explorer → contract page → "Verify & Publish" → Standard JSON)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, "..", "contracts", "package.json"));

const address = process.env.CONTRACT;
if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
  throw new Error("Set CONTRACT=0x... to the deployed KeystoneEscrow address.");
}

const solc = require("solc");
// "0.8.28+commit.7893614a.Emscripten.clang" -> "v0.8.28+commit.7893614a"
const compilerVersion = "v" + solc.version().split(".Emscripten")[0];
console.log("Compiler:", compilerVersion);

const src = fs.readFileSync(path.join(__dirname, "..", "contracts", "KeystoneEscrow.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: { "KeystoneEscrow.sol": { content: src } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const outPath = path.join(__dirname, "..", "contracts", "build", "verification-input.json");
fs.writeFileSync(outPath, JSON.stringify(input, null, 2));
console.log("Wrote", outPath);

// Best-effort automatic submission via the Blockscout API.
try {
  const res = await fetch(
    `https://explorer.arc.io/api/v2/smart-contracts/${address}/verification/via/solidity-standard-json`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        compiler_version: compilerVersion,
        contract_name: "KeystoneEscrow.sol:KeystoneEscrow",
        source_files: { "KeystoneEscrow.sol": { content: src } },
        optimization_enabled: true,
        optimization_runs: 200,
      }),
    }
  );
  const body = await res.text();
  console.log("API status:", res.status);
  console.log(body.slice(0, 500));
  if (!res.ok) throw new Error("API verification not accepted");
  console.log("\n✓ Verification submitted — check", `https://explorer.arc.io/address/${address}`);
} catch (e) {
  console.log("\nAutomatic verification did not complete (" + (e.message || e) + ").");
  console.log("Manual path (2 minutes):");
  console.log("  1. Open https://explorer.arc.io/address/" + address);
  console.log('  2. Contract tab → "Verify & Publish" → method "Standard JSON Input"');
  console.log("  3. Compiler:", compilerVersion, "| Optimization: enabled, 200 runs");
  console.log("  4. Paste contracts/build/verification-input.json and submit.");
}
