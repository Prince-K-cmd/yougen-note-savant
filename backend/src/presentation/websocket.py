
import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manager for WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_count = 0

    async def connect(self, websocket: WebSocket):
        """Connect a new WebSocket client."""
        await websocket.accept()
        connection_id = str(self.connection_count)
        self.active_connections[connection_id] = websocket
        self.connection_count += 1
        logger.info(f"WebSocket client connected: {connection_id}")
        
        # Send welcome message
        await websocket.send_json({
            "type": "system",
            "data": {
                "message": "Connected to VideoNotes API",
                "connection_id": connection_id
            }
        })
        
        return connection_id

    def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket client."""
        for connection_id, conn in list(self.active_connections.items()):
            if conn == websocket:
                self.active_connections.pop(connection_id)
                logger.info(f"WebSocket client disconnected: {connection_id}")
                break

    async def send_personal_message(self, message: Dict[str, Any], connection_id: str):
        """Send a message to a specific client."""
        if connection_id in self.active_connections:
            await self.active_connections[connection_id].send_json(message)
        else:
            logger.warning(f"Client {connection_id} not found")

    async def broadcast(self, message: Dict[str, Any], exclude: List[str] = None):
        """Broadcast a message to all clients, optionally excluding some."""
        exclude = exclude or []
        for connection_id, connection in list(self.active_connections.items()):
            if connection_id not in exclude:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {connection_id}: {e}")
                    self.disconnect(connection)
