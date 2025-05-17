
import React, { useState } from 'react';
import { useNats } from '@/contexts/NatsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User } from 'lucide-react';

interface ChatHeaderProps {
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ serverUrl, setServerUrl }) => {
  const { connectionStatus, connect, disconnect, currentRoom, username, setUsername } = useNats();
  const [newUsername, setNewUsername] = useState(username);
  const [newServerUrl, setNewServerUrl] = useState(serverUrl);

  const handleConnect = () => {
    connect(serverUrl);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleServerUrlChange = () => {
    setServerUrl(newServerUrl);
  };

  const handleUpdateUsername = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-gray-900">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-nats-primary">
          #{currentRoom}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Username Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="max-w-[100px] truncate">{username}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Username</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="Enter new username" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateUsername}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Server URL Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Server URL
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>NATS Server URL</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="ws://localhost:9222" 
                value={newServerUrl}
                onChange={(e) => setNewServerUrl(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleServerUrlChange}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Connect/Disconnect Button */}
        {connectionStatus === 'disconnected' && (
          <Button 
            size="sm" 
            onClick={handleConnect}
            className="bg-nats-primary hover:bg-nats-dark"
          >
            Connect
          </Button>
        )}
        
        {connectionStatus === 'connecting' && (
          <Button size="sm" disabled>
            Connecting...
          </Button>
        )}
        
        {connectionStatus === 'connected' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive"
              >
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect you from the NATS server and you will no longer receive messages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
