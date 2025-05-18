
import { StringCodec, Subscription } from 'nats.ws';
import { Message, MessagePayload } from './types';

/**
 * Handles processing and parsing incoming NATS messages
 */
export class MessageHandler {
  private sc = StringCodec();
  
  /**
   * Decode and parse a NATS message
   */
  public decodeMessage(data: Uint8Array): string {
    return this.sc.decode(data);
  }
  
  /**
   * Encode a string message for NATS
   */
  public encodeMessage(content: string): Uint8Array {
    return this.sc.encode(content);
  }
  
  /**
   * Parse message content and create a standardized Message object
   */
  public parseMessageContent(data: string, topic: string): Message {
    let parsedData: MessagePayload;
    let content: string;
    let senderName: string;
    let senderId: string | undefined;
    
    // Try to parse as JSON first
    try {
      parsedData = JSON.parse(data);
      content = parsedData.message;
      senderName = parsedData.name || 'Unknown';
      senderId = parsedData.userId;
    } catch (e) {
      // If not valid JSON, use the raw message as content
      content = data;
      senderName = 'Unknown';
      senderId = undefined;
    }
    
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: senderId || 'unknown-user',
      username: senderName,
      content: content,
      topic,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Create a JSON message payload
   */
  public createMessagePayload(username: string, content: string, userId: string): string {
    const payload: MessagePayload = {
      name: username,
      message: content,
      timestamp: new Date().toISOString(),
      userId: userId
    };
    
    return JSON.stringify(payload);
  }
}
