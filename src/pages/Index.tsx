
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-nats-light dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-3xl px-6">
        <h1 className="text-5xl font-bold mb-6 text-nats-primary">NATS WebSocket Chat</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          A real-time chat application using NATS over WebSockets with dynamic topic subscriptions
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-nats-dark">Dynamic Topics</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Subscribe to multiple rooms and create your own chat topics on-the-fly
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-nats-dark">Real-time Messaging</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Instant message delivery with WebSocket connectivity to NATS message bus
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-nats-dark">Simple Setup</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect to any NATS server with WebSocket support using a simple URL
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-3 text-nats-dark">Quick Setup Instructions</h2>
          <div className="text-left">
            <p className="mb-2 text-gray-600 dark:text-gray-400">
              1. Setup a NATS server with WebSocket support enabled
            </p>
            <p className="mb-2 text-gray-600 dark:text-gray-400">
              2. Configure it to listen on WebSocket port (e.g., 9222)
            </p>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              3. Use the WebSocket URL to connect (e.g., ws://localhost:9222)
            </p>
          </div>
        </div>
        
        <Button asChild className="px-8 py-6 text-lg bg-nats-primary hover:bg-nats-dark">
          <Link to="/chat">Start Chatting</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
