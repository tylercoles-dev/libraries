import { MCPServer, z } from '../src';
import type { Transport, ToolContext, ToolHandler } from '../src';

// Mock the SDK server
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn().mockImplementation(() => ({
    registerTool: jest.fn(),
    registerResource: jest.fn(),
    registerPrompt: jest.fn()
  }))
}));

describe('MCPServer', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer({
      name: 'test-server',
      version: '1.0.0'
    });
  });

  describe('constructor', () => {
    it('should create server with config', () => {
      expect(server).toBeDefined();
      expect(server.isStarted()).toBe(false);
    });
  });

  describe('registerTool', () => {
    it('should register a tool', () => {
      const handler = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'test' }]
      });

      expect(() => {
        server.registerTool(
          'test_tool',
          {
            description: 'Test tool',
            inputSchema: { message: z.string() }
          },
          handler
        );
      }).not.toThrow();
    });
  });

  describe('context management', () => {
    it('should set and get context', () => {
      const context = { user: { id: '123', username: 'test' } };
      server.setContext(context);
      
      const retrieved = server.getContext();
      expect(retrieved).toEqual(context);
    });

    it('should merge context updates', () => {
      server.setContext({ user: { id: '123' } });
      server.setContext({ requestId: 'req-456' });
      
      const context = server.getContext();
      expect(context).toEqual({
        user: { id: '123' },
        requestId: 'req-456'
      });
    });
  });

  describe('transport', () => {
    it('should throw if no transport configured on start', async () => {
      await expect(server.start()).rejects.toThrow('No transports configured. Use useTransport() to add transports.');
    });

    it('should not allow transport change after start', async () => {
      const mockTransport = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined)
      };

      server.useTransport(mockTransport);
      await server.start();

      expect(() => {
        server.useTransport(mockTransport);
      }).toThrow('Cannot add transport after server has started');
    });
  });
});
