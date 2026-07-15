import { Command } from "commander";

type TelegramResponse = {
  ok: boolean;
  result?: {
    message_id?: number;
  };
  description?: string;
};

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

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      },
    );

    const json = (await response.json()) as TelegramResponse;
    if (!response.ok || !json.ok) {
      const details = json.description ?? response.statusText;
      console.error(`Telegram API error: ${details}`);
      process.exit(1);
    }

    const messageId = json.result?.message_id;
    console.log(`Telegram message sent: ${chatId}`);
    if (messageId === undefined) {
      console.log(`Telegram API error: no message id: ${messageId} `);
    }
  });

program.parseAsync(process.argv);

// https://api.telegram.org/bot<token>/getUpdates
