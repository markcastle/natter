
import { connect, NatsConnection } from 'nats.ws';
import { ConnectionCredentials, ConnectionStatus, NatsSubscription } from './types';
import { MessageHandler } from './messageHandler';
import { SubscriptionManager } from './subscriptionManager';

/**
 * Main NATS service for communication
 */
export class NatsService {
  private nc: NatsConnection | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private subscriptionManager: SubscriptionManager;
  private messageHandler: MessageHandler;
  private userId: string;
  private username: string;
  private credentials: ConnectionCredentials = {};
  private authFailed: boolean = false;
  
  constructor() {
    // Generate a random user ID and default username on instantiation
    this.userId = `user-${Math.random().toString(36).substring(2, 10)}`;
    this.username = `User-${Math.random().toString(36).substring(2, 5)}`;
    
    this.subscriptionManager = new SubscriptionManager();
    this.messageHandler = new MessageHandler();
  }

  // Get current connection status
  public getConnectionStatus(): ConnectionStatus {
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
      for (const [topic, sub] of this.subscriptionManager.getAllSubscriptions()) {
        this.processSubscription(topic, sub);
      }

      return true;
    } catch (err: any) {
      this.connectionStatus = 'disconnected';
      console.error('NATS connection error:', err);
      return false;
    }
  }

  /**
   * Publish a message to a topic.
   */
  public publish(topic: string, content: string): boolean {
    if (!this.nc) {
      console.error('Not connected to NATS');
      return false;
    }

    try {
      // Create a JSON message payload and encode it
      const jsonMessage = this.messageHandler.createMessagePayload(
        this.username, 
        content,
        this.userId
      );
      
      // Publish the JSON message
      this.nc.publish(topic, this.messageHandler.encodeMessage(jsonMessage));
      return true;
    } catch (err) {
      console.error('Failed to publish:', err);
      return false;
    }
  }

  /**
   * Subscribe to a topic using nats.ws.
   */
  public subscribe(topic: string): NatsSubscription | null {
    if (!this.nc) {
      console.error('Not connected to NATS');
      return null;
    }

    if (this.subscriptionManager.hasSubscription(topic)) {
      return { topic, unsubscribe: () => this.unsubscribe(topic) };
    }

    try {
      const sub = this.nc.subscribe(topic);
      this.subscriptionManager.addSubscription(topic, sub);
      this.processSubscription(topic, sub);
      return { topic, unsubscribe: () => this.unsubscribe(topic) };
    } catch (err) {
      console.error('Failed to subscribe:', err);
      return null;
    }
  }

  // Unsubscribe from a topic
  public unsubscribe(topic: string): void {
    if (!this.nc) return;
    this.subscriptionManager.removeSubscription(topic);
  }

  /**
   * Process incoming messages for a subscription.
   */
  private async processSubscription(topic: string, sub: any) {
    (async () => {
      for await (const msg of sub) {
        try {
          const data = this.messageHandler.decodeMessage(msg.data);
          const message = this.messageHandler.parseMessageContent(data, topic);
          this.subscriptionManager.notifyHandlers(message);
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

  /**
   * Register a message handler.
   */
  public onMessage(handler: (message: any) => void): () => void {
    return this.subscriptionManager.addMessageHandler(handler);
  }
}
