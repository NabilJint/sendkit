---
name: sendkit
description: Send Telegram messages from agents using SendKit. Use this skill whenever a user asks to send a Telegram message, notify someone via Telegram, or interact with the Telegram API. Covers both MCP tool invocation and CLI fallback workflows. Always prefer the SendKit MCP tool if available; fall back to the CLI when MCP is unavailable.
---

# SendKit Skill

SendKit sends Telegram messages from agents. It works through two interfaces: an MCP tool (preferred) and a CLI fallback.

## When to Use

Trigger this skill when the user:
- Asks to send a Telegram message
- Wants to notify someone via Telegram
- Mentions Telegram bot interactions
- Needs to verify a SendKit installation

## Packages

| Package | Purpose |
|---------|---------|
| `@jint_2./sendkit` | CLI — `sendkit telegram <chatId> <message>` |
| `@jint_2./sendkit-mcp` | MCP server — exposes a `telegram` tool via stdio |

## Workflow Selection

### Preferred: MCP Tool

If a `telegram` MCP tool is available (registered via `.mcp.json` or `opencode.json`), use it directly.

**MCP tool input:**
| Field     | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| `chatId`  | string | yes      | Telegram chat ID            |
| `message` | string | yes      | Text content to send        |

**MCP tool output:**
```json
{
  "ok": true,
  "chatId": "123456789",
  "messageId": 42
}
```

Call the tool via the MCP interface. The bot token is injected from the environment variable `TELEGRAM_BOT_TOKEN` by the MCP server — the agent never handles it directly.

### Fallback: CLI

Use the CLI when the MCP tool is not available or the user explicitly asks for it.

**Setup (one-time):**
```bash
sendkit init --telegram-bot-token <token>
```
This writes the token to `~/.config/sendkit/config.json` with mode `0600`.

**Send a message:**
```bash
sendkit telegram <chatId> "<message>"
```

**Output:** JSON on stdout:
```json
{"ok":true,"chatId":"123456789","messageId":42}
```

**Error handling:** Non-zero exit code with the error message on stderr.

## MCP Server Setup

The MCP server reads `TELEGRAM_BOT_TOKEN` from the environment. Configure it in your agent's MCP config.

**Claude Code (`.mcp.json`):**
```json
{
  "mcpServers": {
    "sendkit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@jint_2./sendkit-mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<your-bot-token>"
      }
    }
  }
}
```

**OpenCode (`opencode.json`):**
```json
{
  "mcp": {
    "sendkit": {
      "type": "local",
      "command": ["bunx", "-y", "@jint_2./sendkit-mcp"],
      "environment": {
        "TELEGRAM_BOT_TOKEN": "<your-bot-token>"
      },
      "enabled": true
    }
  }
}
```

## Manual Verification

### Check MCP Tool Availability

If the `sendkit` MCP server is configured, the agent can call the `telegram` tool. If the tool is not listed, fall back to the CLI.

### Test Connection

Send a test message to verify the bot token is valid:
```bash
sendkit telegram <chatId> "Test message from SendKit"
```

A successful response returns `{"ok":true,...}`. A failed response returns a non-zero exit code with an error description.

## Telegram Chat IDs

To get a chat ID:
1. Add the bot to a group or start a DM with it
2. Send a message
3. Call `https://api.telegram.org/bot<TOKEN>/getUpdates` to see the `chat.id` value

Chat IDs are strings (e.g., `"123456789"` for DMs, `"-1001234567890"` for groups).

## Error Reference

| Error | Meaning |
|-------|---------|
| `telegram bot token is not set. run sendkit init to set it` | CLI config missing; run `sendkit init` |
| `TELEGRAM_BOT_TOKEN is not set` | MCP env var missing; check MCP server config |
| `Telegram API error: Unauthorized` | Invalid bot token |
| `Telegram API error: Bad Request: chat not found` | Invalid chat ID or bot not in chat |

## Security

- Bot tokens are never logged or returned in tool output
- CLI config file uses `0600` permissions
- MCP server injects the token internally — the agent only sees `chatId` and `message`
- Never hardcode tokens in agent prompts or skill files
