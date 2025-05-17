
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNats } from '@/contexts/NatsContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const ChatSidebar: React.FC = () => {
  const sidebar = useSidebar();
  const { 
    currentRoom, 
    availableRooms, 
    subscribeToRoom,
    createRoom
  } = useNats();
  
  const [newRoomName, setNewRoomName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Check if the sidebar is collapsed based on the state property
  const isCollapsed = sidebar.state === "collapsed";

  const handleRoomChange = (room: string) => {
    subscribeToRoom(room);
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      createRoom(newRoomName);
      setNewRoomName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <Sidebar
      className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-60"} border-r`}
    >
      <div className="flex justify-between items-center p-3">
        {!isCollapsed && (
          <div className="text-lg font-semibold text-nats-primary">NATS Chat</div>
        )}
        <SidebarTrigger className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            <span>Rooms</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Enter room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateRoom}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {availableRooms.map((room) => (
                <SidebarMenuItem key={room}>
                  <SidebarMenuButton
                    className={`w-full flex justify-between ${
                      currentRoom === room ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"
                    }`}
                    onClick={() => handleRoomChange(room)}
                  >
                    <div className="flex items-center">
                      {!isCollapsed && (
                        <span className="truncate">#{room}</span>
                      )}
                      {isCollapsed && (
                        <span className="w-8 h-8 rounded-md flex items-center justify-center bg-sidebar-accent">
                          {room.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ChatSidebar;
