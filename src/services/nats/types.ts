
/**
 * Common types for NATS service
 */

export interface Message {
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

export interface ConnectionCredentials {
  username?: string;
  password?: string;
}

export interface MessagePayload {
  name: string;
  message: string;
  timestamp: string;
  userId?: string;
}

export type MessageHandler = (message: Message) => void;
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
