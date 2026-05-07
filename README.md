# Trello MCP Server

A Model Context Protocol (MCP) server that provides tools to fetch and interact with Trello boards, lists, and cards.

## Features

- Get all boards for authenticated user
- Get board details
- Fetch lists from a board
- Fetch cards from boards or lists
- Get specific card details
- Search for cards across boards
- Get card actions/history

## Setup

### 1. Get Trello API Credentials

**Important:** You need to create a Power-Up to get API credentials.

1. Visit https://trello.com/power-ups/admin
2. Click "Create New Power-Up" (or "Crear" button)
3. Fill in basic information:
   - Name: "Trello MCP" (or any name you prefer)
   - Workspace: Select your workspace
4. Once created, go to the "API Key" section in your Power-Up settings
5. You'll see your **API Key** displayed (a 32-character string)
6. Click on the "Token" link (or "token" in the description) to generate your API token
7. Authorize the token when prompted
8. Copy both the **API key** and **API token**

Alternatively, you can go directly to https://trello.com/app-key if you already have a Power-Up created.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```
TRELLO_API_KEY=your_actual_api_key
TRELLO_API_TOKEN=your_actual_api_token
```

### 4. Test the Server

Run the server directly:

```bash
npm start
```

## Configuration

You can configure this MCP server globally in Claude Desktop or per-project in Claude Code CLI.

### Option 1: Global Configuration (Claude Desktop)

Edit your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["/absolute/path/to/trello-mcp/index.js"],
      "env": {
        "TRELLO_API_KEY": "your_api_key_here",
        "TRELLO_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

Replace `/absolute/path/to/trello-mcp/` with the actual path to this directory.

After adding the configuration, restart Claude Desktop.

### Option 2: Per-Project Configuration (Claude Code CLI)

For Claude Code CLI, MCP servers are configured per-project in `~/.claude.json`.

**Important:** You must include the `type: "stdio"` field and the `env` variables directly in the configuration. The `.env` file won't be loaded automatically.

Use this command to configure for a specific project:

```bash
# Using jq to add the configuration
jq '.projects."/path/to/your/project".mcpServers.trello = {
  "type": "stdio",
  "command": "node",
  "args": ["/Users/ehigu/Documents/Esteban/Projects/habitus/webapp/trello-mcp/index.js"],
  "env": {
    "TRELLO_API_KEY": "your_api_key_here",
    "TRELLO_API_TOKEN": "your_api_token_here"
  }
}' ~/.claude.json > /tmp/claude_config.json && mv /tmp/claude_config.json ~/.claude.json
```

Or manually edit `~/.claude.json`:

```json
{
  "projects": {
    "/path/to/your/project": {
      "mcpServers": {
        "trello": {
          "type": "stdio",
          "command": "node",
          "args": ["/Users/ehigu/Documents/Esteban/Projects/habitus/webapp/trello-mcp/index.js"],
          "env": {
            "TRELLO_API_KEY": "your_api_key_here",
            "TRELLO_API_TOKEN": "your_api_token_here"
          }
        }
      }
    }
  }
}
```

After adding the configuration, restart Claude Code.

## Available Tools

### `get_my_boards`
Get all boards for the authenticated user.

**Parameters:**
- `filter` (optional): Filter boards by type (all, open, closed, starred, organization, public, members). Default: "open"

### `get_board`
Get details of a specific board.

**Parameters:**
- `board_id` (required): The ID of the board

### `get_board_lists`
Get all lists on a board.

**Parameters:**
- `board_id` (required): The ID of the board
- `filter` (optional): Filter lists (all, open, closed, none). Default: "open"

### `get_board_cards`
Get all cards on a board.

**Parameters:**
- `board_id` (required): The ID of the board

### `get_list_cards`
Get all cards in a specific list.

**Parameters:**
- `list_id` (required): The ID of the list

### `get_card`
Get details of a specific card.

**Parameters:**
- `card_id` (required): The ID of the card

### `search_cards`
Search for cards across all boards.

**Parameters:**
- `query` (required): Search query
- `board_ids` (optional): Comma-separated board IDs to search within

### `get_card_actions`
Get actions (activity/history) for a specific card.

**Parameters:**
- `card_id` (required): The ID of the card

## Usage Examples

Once configured in Claude Desktop, you can use natural language to interact with your Trello boards:

- "Show me all my open Trello boards"
- "Get the cards from board [board_id]"
- "Search for cards containing 'bug fix'"
- "Show me the details of card [card_id]"
- "What are the lists in my board?"

## Troubleshooting

### Authentication Errors

If you see authentication errors:
1. Verify your API key and token are correct
2. Make sure the token has not expired
3. Regenerate the token if necessary from https://trello.com/app-key

### Server Not Starting

1. Check that Node.js is installed: `node --version`
2. Ensure dependencies are installed: `npm install`
3. Verify environment variables are set correctly

### MCP Server Shows "Failed" Status

If the MCP server shows as "failed" in Claude Code:

1. **Missing `type` field**: Make sure your configuration includes `"type": "stdio"`. This is required for Claude Code CLI.

2. **Environment variables not loaded**: The `.env` file is NOT automatically loaded when Claude Code runs the MCP server. You must include the `env` object with your API credentials directly in the configuration:
   ```json
   {
     "type": "stdio",
     "command": "node",
     "args": ["/path/to/trello-mcp/index.js"],
     "env": {
       "TRELLO_API_KEY": "your_api_key",
       "TRELLO_API_TOKEN": "your_api_token"
     }
   }
   ```

3. **Check logs**: Run `claude --debug` to see detailed error logs

4. **Test manually**: Run the server directly to verify it works:
   ```bash
   cd /path/to/trello-mcp
   TRELLO_API_KEY=your_key TRELLO_API_TOKEN=your_token node index.js
   ```

5. **Restart Claude Code**: After configuration changes, completely quit and restart Claude Code

### MCP Server Not Showing in Claude

1. Check the path in your config is absolute and correct
2. Restart Claude Desktop/Code completely
3. Check Claude Desktop logs for any errors
4. For Claude Code CLI, verify the configuration is in the correct project path in `~/.claude.json`

## License

MIT
