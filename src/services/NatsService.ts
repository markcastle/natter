
interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  topic: string;
  timestamp: number;
}

export interface NatsSubscription {
  topic: string;
  unsubscribe: () => void;
}

type MessageHandler = (message: Message) => void;

interface ConnectionCredentials {
  username?: string;
  password?: string;
}

class NatsService {
  private ws: WebSocket | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private messageHandlers: Set<MessageHandler> = new Set();
  private subscriptions: Map<string, NatsSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private userId: string;
  private username: string;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private credentials: ConnectionCredentials = {};

  constructor() {
    // Generate a random user ID and default username on instantiation
    this.userId = `user-${Math.random().toString(36).substring(2, 10)}`;
    this.username = `User-${Math.random().toString(36).substring(2, 5)}`;
  }

  // Get current connection status
  public getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionStatus;
  }

  // Set username
  public setUsername(username: string): void {
    this.username = username;
  }

  // Get username
  public getUsername(): string {
    return this.username;
  }

  // Get userId
  public getUserId(): string {
    return this.userId;
  }

  // Connect to NATS server via WebSocket
  public async connect(url: string, username?: string, password?: string): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket connection already exists');
      return true;
    }

    // Store credentials for reconnection
    this.credentials = { username, password };

    try {
      this.connectionStatus = 'connecting';
      
      // Build connection URL with credentials if provided
      let connectionUrl = url;
      
      if (username && password) {
        // For WSS protocol, we need to handle authentication differently
        if (url.startsWith('wss://')) {
          // Use standard WSS URL and handle auth in the CONNECT frame
          connectionUrl = url;
        } else {
          // For WS, include credentials in URL directly
          const urlObj = new URL(url);
          urlObj.username = encodeURIComponent(username);
          urlObj.password = encodeURIComponent(password);
          connectionUrl = urlObj.toString();
        }
      }
      
      console.log(`Connecting to ${connectionUrl}`);
      this.ws = new WebSocket(connectionUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.ws) {
          this.connectionStatus = 'disconnected';
          reject(new Error('Failed to create WebSocket'));
          return;
        }

        this.ws.onopen = () => {
          console.log('Connected to NATS server');
          
          // Send CONNECT frame with credentials if using WSS
          if (url.startsWith('wss://') && username && password) {
            const connectFrame = {
              type: 'CONNECT',
              verbose: true,
              pedantic: false,
              user: username,
              pass: password,
              auth_token: null,
              name: `nats_js_client_${this.userId}`
            };
            
            if (this.ws) {
              this.ws.send(JSON.stringify(connectFrame));
            }
          }
          
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.setupPingInterval();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            // Handle both text and binary messages
            if (event.data instanceof Blob) {
              // Handle binary data (Blob)
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const textData = reader.result as string;
                  
                  // Handle INFO, PING, PONG, and -ERR messages differently
                  if (textData.startsWith('INFO ') || 
                      textData === 'PING' || 
                      textData === 'PONG' || 
                      textData.startsWith('-ERR')) {
                    console.log(`Received control message: ${textData.substring(0, 40)}${textData.length > 40 ? '...' : ''}`);
                    
                    // Respond to PING with PONG
                    if (textData === 'PING' && this.ws && this.ws.readyState === WebSocket.OPEN) {
                      this.ws.send('PONG');
                    }
                    
                    // Handle -ERR messages (authentication errors etc)
                    if (textData.startsWith('-ERR')) {
                      console.error(`NATS server error: ${textData}`);
                      if (textData.includes('Authorization') || textData.includes('Authentication')) {
                        this.connectionStatus = 'disconnected';
                        if (this.ws) {
                          // Use a valid close code (1000 = normal closure)
                          this.ws.close(1000, 'Authentication Failure');
                        }
                      }
                    }
                    
                    return;
                  }
                  
                  // Try to parse as JSON for regular messages
                  try {
                    const jsonData = JSON.parse(textData);
                    this.processMessage(jsonData);
                  } catch (jsonError) {
                    console.log('Received non-JSON text data:', textData.substring(0, 100));
                  }
                } catch (error) {
                  console.error('Error processing binary message:', error);
                }
              };
              reader.readAsText(event.data);
            } else if (typeof event.data === 'string') {
              // Handle text messages
              if (event.data.startsWith('INFO ') || 
                  event.data === 'PING' || 
                  event.data === 'PONG' || 
                  event.data.startsWith('-ERR')) {
                console.log(`Received control message: ${event.data.substring(0, 40)}${event.data.length > 40 ? '...' : ''}`);
                
                // Respond to PING with PONG
                if (event.data === 'PING' && this.ws && this.ws.readyState === WebSocket.OPEN) {
                  this.ws.send('PONG');
                }
                
                // Handle -ERR messages
                if (event.data.startsWith('-ERR')) {
                  console.error(`NATS server error: ${event.data}`);
                  if (event.data.includes('Authorization') || event.data.includes('Authentication')) {
                    this.connectionStatus = 'disconnected';
                    if (this.ws) {
                      // Use a valid close code (1000 = normal closure)
                      this.ws.close(1000, 'Authentication Failure');
                    }
                  }
                }
                
                return;
              }
              
              // Try to parse regular JSON messages
              try {
                const jsonData = JSON.parse(event.data);
                this.processMessage(jsonData);
              } catch (error) {
                console.log('Received non-JSON text data:', event.data.substring(0, 100));
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`Disconnected from NATS server: ${event.code} - ${event.reason}`);
          this.connectionStatus = 'disconnected';
          this.clearPingInterval();
          
          // Only attempt reconnect for certain close codes
          // Don't reconnect on authentication failures
          if (event.code !== 1000) {
            this.attemptReconnect(url);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatus = 'disconnected';
          reject(error);
        };
      });
    } catch (error) {
      console.error('Failed to connect to NATS server:', error);
      this.connectionStatus = 'disconnected';
      return false;
    }
  }

  // Process incoming message data
  private processMessage(data: any): void {
    if (data.type === 'message') {
      this.handleIncomingMessage(data.message);
    } else if (data.type === 'pong') {
      // Handle pong response
      console.log('Received pong from server');
    } else if (data.type === 'auth_success') {
      console.log('Authentication successful');
    } else if (data.type === 'auth_failure') {
      console.error('Authentication failed:', data.error);
    }
  }

  // Disconnect from NATS server
  public disconnect(): void {
    if (this.ws) {
      // Use valid close code
      this.ws.close(1000);
    }
    
    this.clearPingInterval();
    this.connectionStatus = 'disconnected';
  }

  // Subscribe to a topic
  public subscribe(topic: string): NatsSubscription | null {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot subscribe: WebSocket not connected');
      return null;
    }

    // Check if we're already subscribed
    if (this.subscriptions.has(topic)) {
      return this.subscriptions.get(topic) || null;
    }

    // Send subscription request
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      topic
    }));

    // Create subscription object
    const subscription: NatsSubscription = {
      topic,
      unsubscribe: () => this.unsubscribe(topic)
    };

    // Store subscription
    this.subscriptions.set(topic, subscription);
    return subscription;
  }

  // Unsubscribe from a topic
  public unsubscribe(topic: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot unsubscribe: WebSocket not connected');
      return;
    }

    if (this.subscriptions.has(topic)) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        topic
      }));
      
      this.subscriptions.delete(topic);
    }
  }

  // Publish a message to a topic
  public publish(topic: string, content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot publish: WebSocket not connected');
      return false;
    }

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: this.userId,
      username: this.username,
      content,
      topic,
      timestamp: Date.now()
    };

    this.ws.send(JSON.stringify({
      type: 'publish',
      topic,
      message
    }));

    return true;
  }

  // Register a message handler
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  // Handle incoming message
  private handleIncomingMessage(message: Message): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  // Setup ping interval
  private setupPingInterval(): void {
    this.clearPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('PING');
      }
    }, 30000); // Send ping every 30 seconds
  }

  // Clear ping interval
  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Attempt to reconnect
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect(url, this.credentials.username, this.credentials.password);
        
        // If reconnection is successful, resubscribe to all topics
        if (this.connectionStatus === 'connected') {
          const topics = Array.from(this.subscriptions.keys());
          this.subscriptions.clear();
          topics.forEach(topic => {
            this.subscribe(topic);
          });
        }
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }
}

// Create a singleton instance
const natsService = new NatsService();

export default natsService;
