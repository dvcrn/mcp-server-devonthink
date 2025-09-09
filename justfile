# DEVONthink MCP Server - Just Commands

# Default recipe to show available commands
default:
    @just --list

# Build the project
build:
    npm run build

# Start local development server
dev:
    npm run dev

# Deploy to Cloudflare Workers
deploy:
    npm run deploy

# Format code with Biome
format:
    npm run format