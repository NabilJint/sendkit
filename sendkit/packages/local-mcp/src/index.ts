import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { sendTelegramMessage, telegramMessageInputSchema } from "sendkit-core";

const server = new McpServer({
  name: "sendkit-local-mcp",
  version: "0.0.0",
});

function getTelegramBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error(
      "TELEGRAM_BOT_TOKEN is not set. configure it in your MCP client environment",
    );
    process.exit(1);
  }
  return token;
}

server.registerTool(
  "telegram",
  {
    title: "Telegram",
    description: "Send a telegram message",
    inputSchema: telegramMessageInputSchema.shape,
  },
  async (input) => {
    const result = await sendTelegramMessage({
      ...input,
      botToken: getTelegramBotToken(),
    });
    return {
      content: [
        {
          type: "text",
          text: `Sent Telegram message ${result.messageId} to chat ${result.chatId}`,
        },
      ],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
