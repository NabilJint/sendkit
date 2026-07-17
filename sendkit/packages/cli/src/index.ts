import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { sendTelegramMessage } from "sendkit-core";
import { z } from "zod";

const program = new Command();
const configPath = join(homedir(), ".config", "sendkit", "config.json");
const cliCongigSchema = z.object({
  telegramBotToken: z.string().min(1, "botToken is required"),
});

function writeTelegramBotToken(token: string) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(
    configPath,
    `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`,
    {
      mode: 0o600,
    },
  );
}

function getTelegramBotToken() {
  if (!existsSync(configPath)) {
    throw new Error(
      "telegram bot token is not set. run `sendkit init` to set it",
    );
  }

  const config = cliCongigSchema.parse(
    JSON.parse(readFileSync(configPath, "utf-8")),
  );

  const token = config.telegramBotToken;
  if (!token) {
    throw new Error(
      "telegram bot token is not set. run `sendkit init` to set it",
    );
  }
  return token;
}

program.name("sendkit").description("sendkit CLI backed by sendkit-core");

program
  .command("init")
  .description("Initialize sendkit cli settings")
  .requiredOption("--telegram-bot-token <botToken>", "Telegram bot token")
  .action(async (options: { telegramBotToken: string }) => {
    writeTelegramBotToken(options.telegramBotToken);
    console.log(`Saved SendKit CLI config to ${configPath}`);
  });

program
  .command("telegram")
  .description("Send a telegram message")
  .argument("<chatId>", "Telegram Id")
  .argument("<message>", "Message text to send")
  .action(async (chatId: string, message: string) => {
    

    const result = await sendTelegramMessage({
      chatId,
      message,
      botToken: getTelegramBotToken(),
    });

    console.log(JSON.stringify(result));
  });

await program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

// https://api.telegram.org/bot<token>/getUpdates

// https://api.telegram.org/bot8962257498:AAHd_rWwypPH2i1bwe33feZ6TCGVyz8QA5U/getUpdates
