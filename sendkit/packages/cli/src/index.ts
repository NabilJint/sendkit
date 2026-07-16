import { Command } from "commander";
import { sendTelegramMessage } from "sendkit-core";

const program = new Command();

program
  .name("sendkit")
  .description("sendkit cli tutorial")
  .command("telegram")
  .description("Send a telegram message")
  .argument("<chatId>", "Telegram Id")
  .argument("<message>", "Message text to send")
  .action(async (chatId: string, message: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("TELEGRAM_BOT_TOKEN is not set");
      process.exit(1);
    }

    if (!chatId) {
      console.error("chatId is not set");
      process.exit(1);
    }

    if (!message) {
      console.error("message is not set");
      process.exit(1);
    }

    try {
      const result = await sendTelegramMessage({
        chatId,
        message,
        botToken: token,
      });
      console.log(`Sent Telegram message to chat ${result.chatId}`);
      console.log(`Telegram messageId ${result.messageId}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`Telegram API error: ${detail}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);

// https://api.telegram.org/bot<token>/getUpdates

// https://api.telegram.org/bot8962257498:AAHd_rWwypPH2i1bwe33feZ6TCGVyz8QA5U/getUpdates
