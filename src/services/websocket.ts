
type MessageHandler = (data: any) => void;

export interface WebSocketMessage {
  type: string;
  data: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 2000;
  private messageHandlers: Record<string, MessageHandler[]> = {};
  
  connect(url: string = "ws://localhost:8000/ws") {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.socket = new WebSocket(url);
    
    this.socket.onopen = () => {
      console.log("WebSocket connection established");
      this.reconnectAttempts = 0;
    };
    
    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    this.socket.onclose = () => {
      console.log("WebSocket connection closed");
      this.attemptReconnect(url);
    };
    
    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }
  
  private attemptReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(url);
      }, this.reconnectTimeout);
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  send(message: WebSocketMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("Cannot send message - WebSocket not connected");
    }
  }
  
  on(messageType: string, handler: MessageHandler) {
    if (!this.messageHandlers[messageType]) {
      this.messageHandlers[messageType] = [];
    }
    this.messageHandlers[messageType].push(handler);
  }
  
  off(messageType: string, handler: MessageHandler) {
    if (this.messageHandlers[messageType]) {
      this.messageHandlers[messageType] = this.messageHandlers[messageType].filter(
        (h) => h !== handler
      );
    }
  }
  
  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers[message.type] || [];
    handlers.forEach((handler) => {
      try {
        handler(message.data);
      } catch (error) {
        console.error(`Error in handler for message type "${message.type}":`, error);
      }
    });
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
