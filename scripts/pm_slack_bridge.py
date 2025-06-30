#!/usr/bin/env python3
"""
Alternative Python-based Slack bridge for AutoGen PM-agent integration.
This is a simpler alternative to the Node.js Slack bot.
"""

import os
import asyncio
import autogen
from slack_bolt.async_app import AsyncApp
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler
import tempfile

# Load environment variables
BOT_TOKEN = os.environ["SLACK_BOT_TOKEN"]
APP_TOKEN = os.environ["SLACK_APP_TOKEN"] 
SIGN_SECRET = os.environ["SLACK_SIGNING_SECRET"]
CHANNEL = os.getenv("BUILD_BOT_CHANNEL", "#build-bot")
HALT = os.getenv("HALT_PIPELINE", "false").lower() == "true"

# AutoGen configuration
pm_cfg = autogen.config_from_yaml("autogen/agents.yaml")["pm_agent"]
pm_agent = autogen.UserProxyAgent(**pm_cfg)

app = AsyncApp(token=BOT_TOKEN, signing_secret=SIGN_SECRET)

@app.event("app_mention")
async def handle_mention(body, say, logger):
    """Handle @PM-agent mentions in Slack"""
    if HALT:
        await say(":octagonal_sign: Pipeline halted (`HALT_PIPELINE=true`).")
        return
    
    text = body["event"]["text"]
    user = body["event"]["user"]
    
    await say(f":seedling: Working on spec for <@{user}> ...")
    
    try:
        # Call PM agent
        spec_md = pm_agent.initiate_chat(text, config={"max_turns": 4}).summary
        
        # Upload result
        with tempfile.NamedTemporaryFile("w+", suffix=".md", delete=False) as tmp:
            tmp.write(spec_md)
            tmp.flush()
            
            await app.client.files_upload(
                channels=CHANNEL,
                file=tmp.name,
                title="spec.md",
                initial_comment="Here is the generated spec.md :page_facing_up:"
            )
        
        logger.info("spec.md uploaded.")
        
    except Exception as e:
        await say(f":x: Error generating spec: {str(e)}")
        logger.error(f"Error: {e}")

async def main():
    """Start the Slack bot"""
    handler = AsyncSocketModeHandler(app, APP_TOKEN)
    await handler.start_async()

if __name__ == "__main__":
    asyncio.run(main())