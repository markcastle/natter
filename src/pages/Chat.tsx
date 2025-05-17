
import React, { useState } from 'react';
import { NatsProvider } from '@/contexts/NatsContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/ChatSidebar';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';

const Chat: React.FC = () => {
  // Set default server URL to a public NATS server that works reliably
  const [serverUrl, setServerUrl] = useState('wss://demo.nats.io:8443');
  
  return (
    <NatsProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-nats-background">
          <ChatSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center p-2 border-b">
              <SidebarTrigger className="mr-2" />
              <ChatHeader serverUrl={serverUrl} setServerUrl={setServerUrl} />
            </div>
            <MessageList />
            <MessageInput />
          </div>
        </div>
      </SidebarProvider>
    </NatsProvider>
  );
};

export default Chat;
