import {
  telegramMessageOuputSchema,
  telegramMessageOptionSchema,
  telegramSendMessageRequestSchema,
  telegramSendMessageResponseSchema,
  type TelegramMessageOption,
  type TelegramMessageInput,
  telegramMessageOuput,
} from "./schema";

export async function sendTelegramMessage(
  input: TelegramMessageOption,
): Promise<telegramMessageOuput> {
  const parsedInput = telegramMessageOptionSchema.parse(input);
  const requestBody = telegramSendMessageRequestSchema.parse({
    chat_id: parsedInput.chatId,
    text: parsedInput.message,
  });
  const response = await fetch(
    `https://api.telegram.org/bot${parsedInput.botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await Response.json(requestBody).text(),
      // body: JSON.stringify(requestBody),
    },
  );

  const data = telegramSendMessageResponseSchema.parse(await response.json());
  if (!response.ok || !data.ok || !data.result) {
    const details = data.description ?? response.statusText;
    throw new Error(`Telegram API error: ${details}`);
  }

  return telegramMessageOuputSchema.parse({
    ok: true,
    chatId: parsedInput.chatId,
    messageId: data.result.message_id,
  });
}
