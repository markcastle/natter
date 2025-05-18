
import { Subscription } from 'nats.ws';
import { Message, MessageHandler, NatsSubscription } from './types';
import { MessageHandler as MessageProcessor } from './messageHandler';

/**
 * Manages NATS subscriptions
 */
export class SubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private messageHandlers: Set<MessageHandler> = new Set();
  private messageProcessor: MessageProcessor;
  
  constructor() {
    this.messageProcessor = new MessageProcessor();
  }
  
  /**
   * Register a new message handler
   */
  public addMessageHandler(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }
  
  /**
   * Get all registered message handlers
   */
  public getMessageHandlers(): Set<MessageHandler> {
    return this.messageHandlers;
  }
  
  /**
   * Store a subscription for a topic
   */
  public addSubscription(topic: string, subscription: Subscription): void {
    this.subscriptions.set(topic, subscription);
  }
  
  /**
   * Remove a subscription for a topic
   */
  public removeSubscription(topic: string): void {
    const sub = this.subscriptions.get(topic);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }
  
  /**
   * Get a subscription by topic
   */
  public getSubscription(topic: string): Subscription | undefined {
    return this.subscriptions.get(topic);
  }
  
  /**
   * Check if a subscription exists
   */
  public hasSubscription(topic: string): boolean {
    return this.subscriptions.has(topic);
  }
  
  /**
   * Get all subscriptions
   */
  public getAllSubscriptions(): Map<string, Subscription> {
    return this.subscriptions;
  }
  
  /**
   * Notify all handlers of a new message
   */
  public notifyHandlers(message: Message): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }
}
