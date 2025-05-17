
import React, { useState } from 'react';
import { NatsProvider } from '@/contexts/NatsContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/ChatSidebar';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';

const Chat: React.FC = () => {
  const [serverUrl, setServerUrl] = useState('ws://localhost:9222');
  
  return (
    <NatsProvider>
      <SidebarProvider defaultCollapsed={false} collapsedWidth={68}>
        <div className="min-h-screen flex w-full bg-nats-background">
          <ChatSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatHeader serverUrl={serverUrl} setServerUrl={setServerUrl} />
            <MessageList />
            <MessageInput />
          </div>
        </div>
      </SidebarProvider>
    </NatsProvider>
  );
};

export default Chat;
