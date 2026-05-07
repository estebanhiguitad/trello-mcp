#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TRELLO_API_BASE = 'https://api.trello.com/1';
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN;

if (!TRELLO_API_KEY || !TRELLO_API_TOKEN) {
  console.error('Error: TRELLO_API_KEY and TRELLO_API_TOKEN must be set in environment variables');
  process.exit(1);
}

class TrelloMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'trello-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${TRELLO_API_BASE}${endpoint}`;
    const separator = endpoint.includes('?') ? '&' : '?';
    const fullUrl = `${url}${separator}key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`;

    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(fullUrl, fetchOptions);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trello API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_my_boards',
          description: 'Get all boards for the authenticated user',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'string',
                description: 'Filter boards (all, open, closed, starred, organization, public, members)',
                enum: ['all', 'open', 'closed', 'starred', 'organization', 'public', 'members'],
                default: 'open'
              }
            }
          }
        },
        {
          name: 'get_board',
          description: 'Get details of a specific board by ID',
          inputSchema: {
            type: 'object',
            properties: {
              board_id: {
                type: 'string',
                description: 'The ID of the board'
              }
            },
            required: ['board_id']
          }
        },
        {
          name: 'get_board_lists',
          description: 'Get all lists on a board',
          inputSchema: {
            type: 'object',
            properties: {
              board_id: {
                type: 'string',
                description: 'The ID of the board'
              },
              filter: {
                type: 'string',
                description: 'Filter lists (all, open, closed, none)',
                enum: ['all', 'open', 'closed', 'none'],
                default: 'open'
              }
            },
            required: ['board_id']
          }
        },
        {
          name: 'get_board_cards',
          description: 'Get all cards on a board',
          inputSchema: {
            type: 'object',
            properties: {
              board_id: {
                type: 'string',
                description: 'The ID of the board'
              }
            },
            required: ['board_id']
          }
        },
        {
          name: 'get_list_cards',
          description: 'Get all cards in a specific list',
          inputSchema: {
            type: 'object',
            properties: {
              list_id: {
                type: 'string',
                description: 'The ID of the list'
              }
            },
            required: ['list_id']
          }
        },
        {
          name: 'get_card',
          description: 'Get details of a specific card by ID',
          inputSchema: {
            type: 'object',
            properties: {
              card_id: {
                type: 'string',
                description: 'The ID of the card'
              }
            },
            required: ['card_id']
          }
        },
        {
          name: 'search_cards',
          description: 'Search for cards across all boards',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              },
              board_ids: {
                type: 'string',
                description: 'Comma-separated board IDs to search within (optional)'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'get_card_actions',
          description: 'Get actions (activity/history) for a specific card',
          inputSchema: {
            type: 'object',
            properties: {
              card_id: {
                type: 'string',
                description: 'The ID of the card'
              }
            },
            required: ['card_id']
          }
        },
        {
          name: 'add_comment_to_card',
          description: 'Add a comment to a specific card',
          inputSchema: {
            type: 'object',
            properties: {
              card_id: {
                type: 'string',
                description: 'The ID of the card to comment on'
              },
              text: {
                type: 'string',
                description: 'The comment text to add'
              }
            },
            required: ['card_id', 'text']
          }
        },
        {
          name: 'move_card_to_list',
          description: 'Move a card to a different list (e.g., from "To Do" to "In Progress")',
          inputSchema: {
            type: 'object',
            properties: {
              card_id: {
                type: 'string',
                description: 'The ID of the card to move'
              },
              list_id: {
                type: 'string',
                description: 'The ID of the destination list'
              }
            },
            required: ['card_id', 'list_id']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'get_my_boards': {
            const filter = args.filter || 'open';
            const boards = await this.makeRequest(`/members/me/boards?filter=${filter}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(boards, null, 2)
                }
              ]
            };
          }

          case 'get_board': {
            const board = await this.makeRequest(`/boards/${args.board_id}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(board, null, 2)
                }
              ]
            };
          }

          case 'get_board_lists': {
            const filter = args.filter || 'open';
            const lists = await this.makeRequest(`/boards/${args.board_id}/lists?filter=${filter}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(lists, null, 2)
                }
              ]
            };
          }

          case 'get_board_cards': {
            const cards = await this.makeRequest(`/boards/${args.board_id}/cards`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(cards, null, 2)
                }
              ]
            };
          }

          case 'get_list_cards': {
            const cards = await this.makeRequest(`/lists/${args.list_id}/cards`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(cards, null, 2)
                }
              ]
            };
          }

          case 'get_card': {
            const card = await this.makeRequest(`/cards/${args.card_id}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(card, null, 2)
                }
              ]
            };
          }

          case 'search_cards': {
            let endpoint = `/search?query=${encodeURIComponent(args.query)}&modelTypes=cards`;
            if (args.board_ids) {
              endpoint += `&idBoards=${args.board_ids}`;
            }
            const results = await this.makeRequest(endpoint);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2)
                }
              ]
            };
          }

          case 'get_card_actions': {
            const actions = await this.makeRequest(`/cards/${args.card_id}/actions`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(actions, null, 2)
                }
              ]
            };
          }

          case 'add_comment_to_card': {
            const result = await this.makeRequest(
              `/cards/${args.card_id}/actions/comments`,
              {
                method: 'POST',
                body: { text: args.text }
              }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: `Comment added successfully!\n\n${JSON.stringify(result, null, 2)}`
                }
              ]
            };
          }

          case 'move_card_to_list': {
            const result = await this.makeRequest(
              `/cards/${args.card_id}`,
              {
                method: 'PUT',
                body: { idList: args.list_id }
              }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: `Card moved successfully!\n\n${JSON.stringify(result, null, 2)}`
                }
              ]
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Trello MCP Server running on stdio');
  }
}

const server = new TrelloMCPServer();
server.run().catch(console.error);
