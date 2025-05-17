
import React, { useEffect, useRef } from 'react';
import { useNats } from '@/contexts/NatsContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const MessageList: React.FC = () => {
  const { messages, currentRoom, username } = useNats();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentMessages = messages[currentRoom] || [];
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentRoom]);
  
  if (currentMessages.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-gray-500">
        <div className="text-center">
          <p>Welcome to #{currentRoom}</p>
          <p className="text-sm mt-2">No messages yet. Be the first to send a message!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto message-container">
      {currentMessages.map(message => {
        const isCurrentUser = message.username === username;
        const initials = message.username
          .split(' ')
          .map(name => name[0])
          .join('')
          .toUpperCase();
          
        const messageTime = new Date(message.timestamp);
        const formattedTime = format(messageTime, 'h:mm a');

        return (
          <div 
            key={message.id} 
            className={`mb-4 flex items-start gap-2 animate-fade-in ${
              isCurrentUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {!isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-nats-secondary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
              <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {isCurrentUser ? 'You' : message.username}
                </span>
                <span className="text-xs text-gray-500 ml-2">{formattedTime}</span>
              </div>
              
              <div className={`
                rounded-lg p-3 shadow-sm
                ${isCurrentUser 
                  ? 'bg-nats-primary text-white rounded-tr-none' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'}
              `}>
                {message.content}
              </div>
            </div>
            
            {isCurrentUser && (
              <Avatar className="h-8 w-8 order-3">
                <AvatarFallback className="bg-nats-primary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
