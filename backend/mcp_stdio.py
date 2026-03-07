"""
Stdio transport entrypoint for the flompt MCP server.

Used by Glama and other environments that communicate via MCP stdio protocol.
Runs the same FastMCP server as the HTTP transport, but over stdin/stdout.
"""
import sys
import os

# Add backend to path and set working directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.mcp_server import mcp

if __name__ == "__main__":
    mcp.run(transport="stdio")
