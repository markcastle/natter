
import { connect, NatsConnection, StringCodec, Subscription } from 'nats.ws';

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
  private nc: NatsConnection | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private messageHandlers: Set<MessageHandler> = new Set();
  private subscriptions: Map<string, Subscription> = new Map();
  private userId: string;
  private username: string;
  private credentials: ConnectionCredentials = {};
  private authFailed: boolean = false;

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

  
  // Get authentication status
  public getAuthFailedStatus(): boolean {
    return this.authFailed;
  }

  
  // Reset authentication status
  public resetAuthStatus(): void {
    this.authFailed = false;
  }


  // Connect to NATS server using nats.ws
  public async connect(url: string, username?: string, password?: string): Promise<boolean> {
    this.authFailed = false;
    this.credentials = { username, password };
    if (this.nc) {
      try {
        await this.nc.close();
      } catch (e) {}

      this.nc = null;
    }

    this.connectionStatus = 'connecting';
    try {
      const options: any = {
        servers: [url],
        reconnect: true,
        maxReconnectAttempts: 5,
        reconnectTimeWait: 2000,
        timeout: 30000,
        pingInterval: 30000,
        maxPingOut: 3,
      };
      if (username) {
        options.user = username;
        options.pass = password || '';
      }

      // Optionally support token auth
      if ((username && !password) && username.length > 20) {
        options.token = username;
      }

      this.nc = await connect(options);
      this.connectionStatus = 'connected';
      this.nc.closed().then((err) => {
        if (err) {
          this.connectionStatus = 'disconnected';
          this.authFailed = true;
          this.nc = null;
        }

      });
      // Listen for messages on all subscriptions
      for (const [topic, sub] of this.subscriptions) {
        this.processSubscription(topic, sub);
      }

      return true;
    } catch (err: any) {
      this.connectionStatus = 'disconnected';
      console.error('NATS connection error:', err);
      return false;
    }

  }


  // Process incoming message data
  private processMessage(data: any): void {
    console.log('Processing message:', data);
    if (data.type === 'message') {
      this.handleIncomingMessage(data.message);
    } else if (data.type === 'pong') {
      // Handle pong response
      console.log('Received pong from server');
    } else if (data.type === 'auth_success') {
      console.log('Authentication successful');
    } else if (data.type === 'auth_failure') {
      console.error('Authentication failed:', data.error);
      this.authFailed = true;
    } else {
      console.log('Unknown message type:', data.type);
    }

  }




  // Unsubscribe from a topic
  public unsubscribe(topic: string): void {
    if (!this.nc) return;
    const sub = this.subscriptions.get(topic);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(topic);
    }

  }


  /**
   * Publish a message to a topic.
   *
   * @param topic The topic to publish to.
   * @param content The content of the message.
   * @returns True if published, false otherwise.
   */
  public publish(topic: string, content: string): boolean {
    if (!this.nc) {
      console.error('Not connected to NATS');
      return false;
    }

    try {
      const sc = StringCodec();
      this.nc.publish(topic, sc.encode(content));
      return true;
    } catch (err) {
      console.error('Failed to publish:', err);
      return false;
    }

  }


  /**
   * Subscribe to a topic using nats.ws.
   *
   * @param topic The topic to subscribe to.
   * @returns A NatsSubscription object or null if not connected.
   */
  public subscribe(topic: string): NatsSubscription | null {
    if (!this.nc) {
      console.error('Not connected to NATS');
      return null;
    }

    if (this.subscriptions.has(topic)) {
      return { topic, unsubscribe: () => this.unsubscribe(topic) };
    }

    try {
      const sub = this.nc.subscribe(topic);
      this.subscriptions.set(topic, sub);
      this.processSubscription(topic, sub);
      return { topic, unsubscribe: () => this.unsubscribe(topic) };
    } catch (err) {
      console.error('Failed to subscribe:', err);
      return null;
    }

  }


  /**
   * Process incoming messages for a subscription.
   *
   * @param topic The topic for the subscription.
   * @param sub The NATS Subscription object.
   */
  private async processSubscription(topic: string, sub: Subscription) {
    const sc = StringCodec();
    (async () => {
      for await (const msg of sub) {
        try {
          const data = sc.decode(msg.data);
          const message: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            userId: this.userId,
            username: this.username,
            content: data,
            topic,
            timestamp: Date.now(),
          };
          this.handleIncomingMessage(message);
        } catch (err) {
          console.error('Error processing subscription message:', err);
        }
      }
    })();
  }

  /**
   * Disconnect from the NATS server and clean up resources.
   */
  public async disconnect(): Promise<void> {
    if (this.nc) {
      try {
        await this.nc.close();
      } catch (e) {
        console.error('Error closing NATS connection:', e);
      }
      this.nc = null;
    }
    this.connectionStatus = 'disconnected';
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


  /**
   * Register a message handler.
   *
   * @param handler The message handler function.
   * @returns A function to remove the handler.
   */
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

}

export default NatsService;