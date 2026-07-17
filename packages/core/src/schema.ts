import { z } from "zod";

export const telegramMessageInputSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
  message: z.string().min(1, "message is required"),
});

export const telegramMessageOptionSchema = telegramMessageInputSchema.extend({
  botToken: z.string().min(1, "Telegram bot token is required"),
});

export const telegramSendMessageRequestSchema = z.object({
  chat_id: z.string().min(1, "chat_id is required"),
  text: z.string().min(1, "text is required"),
});

export const telegramSendMessageResponseSchema = z.object({
  ok: z.boolean(),
  result: z.object({
    message_id: z.number().optional(),
  }),
  description: z.string().optional(),
});

export const telegramMessageOuputSchema = z.object({
  ok: z.literal(true),
  chatId: z.string(),
  messageId: z.number().optional(),
});

export type TelegramMessageInput = z.infer<typeof telegramMessageInputSchema>;
export type TelegramMessageOption = z.infer<typeof telegramMessageOptionSchema>;
export type telegramMessageOuput = z.infer<typeof telegramMessageOuputSchema>;
