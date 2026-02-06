#!/usr/bin/env node

const readline = require("readline");
const { loadEnvConfig } = require("@next/env");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function main() {
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

  const apiIdRaw = process.env.TELEGRAM_API_ID || "";
  const apiId = Number(apiIdRaw);
  const apiHash = process.env.TELEGRAM_API_HASH || "";

  if (!apiId || !apiHash) {
    console.error(
      "Missing TELEGRAM_API_ID / TELEGRAM_API_HASH. Provide them via env or .env."
    );
    process.exit(1);
  }

  const stringSession = new StringSession("");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 10,
  });

  await client.start({
    phoneNumber: async () => await ask("Phone (+...): "),
    phoneCode: async () => await ask("Code: "),
    password: async () => await ask("2FA password (press Enter if not set): "),
    onError: (err) => console.error(err),
  });

  const sessionString = client.session.save();
  console.error("Session string (TELEGRAM_SESSION): ", sessionString);

  await client.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
