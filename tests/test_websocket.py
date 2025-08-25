import asyncio
import websockets


async def hello(uri):
    async with websockets.connect(uri, open_timeout=100) as websocket:
        await websocket.send("Hello there!")
        greeting = await websocket.recv()
        print(f"Received: {greeting}")


asyncio.run(hello("ws://localhost:3000/api/socket2"))
