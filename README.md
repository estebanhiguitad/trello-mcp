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

1. Visit https://trello.com/app-key to get your API key
2. On the same page, click on "Token" link to generate your API token
3. Copy both the API key and token

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

## Configuration for Claude Desktop

Add this to your Claude Desktop config file:

### macOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
Edit: `%APPDATA%\Claude\claude_desktop_config.json`

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

Alternatively, if you have a `.env` file configured, you can use:

```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["/absolute/path/to/trello-mcp/index.js"]
    }
  }
}
```

After adding the configuration, restart Claude Desktop.

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

### MCP Server Not Showing in Claude

1. Check the path in your Claude Desktop config is absolute and correct
2. Restart Claude Desktop completely
3. Check Claude Desktop logs for any errors

## License

MIT
