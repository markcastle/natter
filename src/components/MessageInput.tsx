
import React, { useState, useRef, KeyboardEvent } from 'react';
import { useNats } from '@/contexts/NatsContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, connectionStatus } = useNats();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSendMessage = () => {
    if (message.trim() && connectionStatus === 'connected') {
      sendMessage(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };
  
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t bg-white dark:bg-gray-900">
      <div className="flex items-end gap-2">
        <Textarea
          ref={inputRef}
          placeholder={
            connectionStatus === 'connected' 
              ? "Type your message..." 
              : "Connect to start chatting..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={connectionStatus !== 'connected'}
          className="min-h-[60px] resize-none"
        />
        <Button
          className="bg-nats-primary hover:bg-nats-dark"
          onClick={handleSendMessage}
          disabled={!message.trim() || connectionStatus !== 'connected'}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
