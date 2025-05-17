
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import natsService from '../services/NatsService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  topic: string;
  timestamp: number;
}

interface NatsContextType {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  messages: Record<string, Message[]>;
  currentRoom: string;
  username: string;
  availableRooms: string[];
  connect: (url: string, username?: string, password?: string) => Promise<boolean>;
  disconnect: () => void;
  sendMessage: (content: string) => boolean;
  subscribeToRoom: (room: string) => void;
  unsubscribeFromRoom: (room: string) => void;
  setCurrentRoom: (room: string) => void;
  setUsername: (username: string) => void;
  createRoom: (room: string) => void;
}

const NatsContext = createContext<NatsContextType | null>(null);

interface NatsProviderProps {
  children: ReactNode;
}

export const NatsProvider: React.FC<NatsProviderProps> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [currentRoom, setCurrentRoom] = useState<string>('general');
  const [availableRooms, setAvailableRooms] = useState<string[]>(['general', 'random', 'tech']);
  const { toast } = useToast();
  
  // Initialize with username from service
  const [username, setUsernameState] = useState<string>(natsService.getUsername());

  useEffect(() => {
    // Set up message handler
    const unsubscribe = natsService.onMessage((message) => {
      setMessages(prevMessages => {
        const topic = message.topic.split('.')[1]; // Extract room name from topic
        const roomMessages = prevMessages[topic] || [];
        return {
          ...prevMessages,
          [topic]: [...roomMessages, message]
        };
      });
    });

    // Update connection status when it changes
    const checkConnectionStatus = setInterval(() => {
      const status = natsService.getConnectionStatus();
      if (status !== connectionStatus) {
        setConnectionStatus(status);
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnectionStatus);
    };
  }, [connectionStatus]);

  const connect = async (url: string, username?: string, password?: string): Promise<boolean> => {
    try {
      setConnectionStatus('connecting');
      const success = await natsService.connect(url, username, password);
      setConnectionStatus(natsService.getConnectionStatus());
      
      if (success) {
        // Auto-subscribe to default room
        subscribeToRoom('general');
        toast({
          title: "Connected",
          description: "Successfully connected to NATS server",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to NATS server",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to connect to NATS server:', error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Connection Error",
        description: `Failed to connect: ${(error as Error).message}`,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const disconnect = () => {
    natsService.disconnect();
    setConnectionStatus('disconnected');
    toast({
      title: "Disconnected",
      description: "Disconnected from NATS server",
    });
  };

  const sendMessage = (content: string): boolean => {
    if (!content.trim()) return false;
    
    const topic = `chat.${currentRoom}`;
    const success = natsService.publish(topic, content);
    
    if (!success) {
      toast({
        title: "Failed to Send",
        description: "Message could not be sent. Please check your connection.",
        variant: "destructive",
      });
    }
    
    return success;
  };

  const subscribeToRoom = (room: string) => {
    const topic = `chat.${room}`;
    const subscription = natsService.subscribe(topic);
    
    if (subscription) {
      setCurrentRoom(room);
      
      // Initialize messages array for this room if it doesn't exist
      setMessages(prev => ({
        ...prev,
        [room]: prev[room] || []
      }));
      
      toast({
        title: "Joined Room",
        description: `You joined #${room}`,
      });
    } else {
      toast({
        title: "Failed to Join Room",
        description: `Could not subscribe to #${room}`,
        variant: "destructive",
      });
    }
  };

  const unsubscribeFromRoom = (room: string) => {
    const topic = `chat.${room}`;
    natsService.unsubscribe(topic);
  };

  const setUsername = (newUsername: string) => {
    if (newUsername && newUsername.trim()) {
      natsService.setUsername(newUsername.trim());
      setUsernameState(newUsername.trim());
      toast({
        title: "Username Updated",
        description: `Your username is now ${newUsername.trim()}`,
      });
    }
  };

  const createRoom = (room: string) => {
    if (!room || !room.trim()) return;
    
    const formattedRoom = room.toLowerCase().replace(/\s+/g, '-');
    
    if (availableRooms.includes(formattedRoom)) {
      toast({
        title: "Room Already Exists",
        description: `The room #${formattedRoom} already exists`,
        variant: "destructive",
      });
      return;
    }
    
    setAvailableRooms(prev => [...prev, formattedRoom]);
    subscribeToRoom(formattedRoom);
    
    toast({
      title: "Room Created",
      description: `You created and joined #${formattedRoom}`,
    });
  };

  const contextValue: NatsContextType = {
    connectionStatus,
    messages,
    currentRoom,
    username,
    availableRooms,
    connect,
    disconnect,
    sendMessage,
    subscribeToRoom,
    unsubscribeFromRoom,
    setCurrentRoom,
    setUsername,
    createRoom,
  };

  return (
    <NatsContext.Provider value={contextValue}>
      {children}
    </NatsContext.Provider>
  );
};

export const useNats = () => {
  const context = useContext(NatsContext);
  if (!context) {
    throw new Error('useNats must be used within a NatsProvider');
  }
  return context;
};
