const fs = require("fs");
const path = require("path");
const solc = require("solc");

const src = fs.readFileSync(path.join(__dirname, "KeystoneEscrow.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: { "KeystoneEscrow.sol": { content: src } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const out = JSON.parse(solc.compile(JSON.stringify(input)));
if (out.errors) {
  const fatal = out.errors.filter((e) => e.severity === "error");
  out.errors.forEach((e) => console.log(e.severity.toUpperCase() + ": " + e.formattedMessage));
  if (fatal.length) process.exit(1);
}
const c = out.contracts["KeystoneEscrow.sol"]["KeystoneEscrow"];
fs.writeFileSync(path.join(__dirname, "build", "KeystoneEscrow.abi.json"), JSON.stringify(c.abi, null, 2));
fs.writeFileSync(path.join(__dirname, "build", "KeystoneEscrow.bytecode.txt"), "0x" + c.evm.bytecode.object);
console.log("OK — ABI entries:", c.abi.length, "| bytecode bytes:", c.evm.bytecode.object.length / 2);
