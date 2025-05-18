
import { NatsService } from './natsService';
import { MessageHandler } from './messageHandler';
import { SubscriptionManager } from './subscriptionManager';
import { Message, NatsSubscription, ConnectionStatus } from './types';

// Export a singleton instance of NatsService
const natsService = new NatsService();

// Export types and classes
export type {
  Message,
  NatsSubscription,
  ConnectionStatus
};

export {
  natsService,
  NatsService,
  MessageHandler,
  SubscriptionManager
};

// Default export for backward compatibility
export default natsService;
