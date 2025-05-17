
import React, { useState } from 'react';
import { useNats } from '@/contexts/NatsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Server, WifiOff, Wifi, Loader } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

interface ServerFormValues {
  url: string;
  username: string;
  password: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ serverUrl, setServerUrl }) => {
  const { connectionStatus, connect, disconnect, currentRoom, username, setUsername } = useNats();
  const [newUsername, setNewUsername] = useState(username);
  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Form for server connection settings
  const serverForm = useForm<ServerFormValues>({
    defaultValues: {
      url: serverUrl,
      username: '',
      password: ''
    }
  });

  const handleConnect = async () => {
    const { url, username, password } = serverForm.getValues();
    
    // Ensure the URL includes wss:// or ws://
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('ws://') && !formattedUrl.startsWith('wss://')) {
      formattedUrl = `wss://${formattedUrl}`;
    }
    
    setIsConnecting(true);
    try {
      await connect(formattedUrl, username, password);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleServerSettingsSave = (values: ServerFormValues) => {
    // Ensure the URL includes wss:// or ws://
    let formattedUrl = values.url.trim();
    if (!formattedUrl.startsWith('ws://') && !formattedUrl.startsWith('wss://')) {
      formattedUrl = `wss://${formattedUrl}`;
      serverForm.setValue('url', formattedUrl);
    }
    
    setServerUrl(formattedUrl);
    setServerDialogOpen(false);
  };

  const handleUpdateUsername = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
    }
  };

  // Connection status indicator
  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
            <Loader className="h-3 w-3 animate-spin" />
            Connecting...
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            Disconnected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold text-nats-primary">
          #{currentRoom}
        </h1>
        {renderConnectionStatus()}
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
        <Dialog open={serverDialogOpen} onOpenChange={setServerDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Server className="h-4 w-4 mr-2" />
              Server
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>NATS Server Connection</DialogTitle>
            </DialogHeader>
            <Form {...serverForm}>
              <form onSubmit={serverForm.handleSubmit(handleServerSettingsSave)} className="space-y-4">
                <FormField
                  control={serverForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="wss://example.com:9222" 
                          {...field} 
                          onChange={(e) => {
                            let value = e.target.value;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password (optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setServerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Connect/Disconnect Button */}
        {connectionStatus === 'disconnected' && (
          <Button 
            size="sm" 
            onClick={handleConnect}
            className="bg-nats-primary hover:bg-nats-dark"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        )}
        
        {connectionStatus === 'connecting' && (
          <Button size="sm" disabled>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
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
