import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageCircle, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatWindow {
  chat_window_id: string;
  chat_window_name: string;
  lastMessage?: string;
  lastTimestamp?: string;
  messageCount: number;
}

interface ChatWindowListProps {
  onSelectWindow: (windowId: string, windowName: string) => void;
  selectedWindowId?: string;
}

export const ChatWindowList = ({ onSelectWindow, selectedWindowId }: ChatWindowListProps) => {
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWindow, setEditingWindow] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadChatWindows();
    }
  }, [user]);

  const loadChatWindows = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('AIMessageLog')
        .select('chat_window_id, chat_window_name, timestamp')
        .eq('userid', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by chat window and get stats
      const windowMap = new Map<string, ChatWindow>();
      
      data?.forEach((message) => {
        const windowId = message.chat_window_id;
        if (!windowMap.has(windowId)) {
          windowMap.set(windowId, {
            chat_window_id: windowId,
            chat_window_name: message.chat_window_name || 'New chat',
            lastTimestamp: message.timestamp,
            messageCount: 1
          });
        } else {
          const window = windowMap.get(windowId)!;
          window.messageCount++;
          if (!window.lastTimestamp || message.timestamp > window.lastTimestamp) {
            window.lastTimestamp = message.timestamp;
          }
        }
      });

      const windows = Array.from(windowMap.values()).sort((a, b) => 
        new Date(b.lastTimestamp || 0).getTime() - new Date(a.lastTimestamp || 0).getTime()
      );

      setChatWindows(windows);
    } catch (error) {
      console.error('Error loading chat windows:', error);
      toast({
        title: "Error",
        description: "Failed to load chat windows.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewChatWindow = async () => {
    if (!user) return;

    const newWindowId = crypto.randomUUID();
    const newWindow: ChatWindow = {
      chat_window_id: newWindowId,
      chat_window_name: 'New chat',
      messageCount: 0
    };

    setChatWindows(prev => [newWindow, ...prev]);
    onSelectWindow(newWindowId, 'New chat');
  };

  const updateWindowName = async (windowId: string, newName: string) => {
    if (!user || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from('AIMessageLog')
        .update({ chat_window_name: newName.trim() })
        .eq('userid', user.id)
        .eq('chat_window_id', windowId);

      if (error) throw error;

      // Update local state immediately
      setChatWindows(prev => 
        prev.map(window => 
          window.chat_window_id === windowId 
            ? { ...window, chat_window_name: newName.trim() }
            : window
        )
      );

      setEditingWindow(null);
      setEditName("");

      toast({
        title: "Success",
        description: "Chat window name updated successfully.",
      });
    } catch (error) {
      console.error('Error updating window name:', error);
      toast({
        title: "Error",
        description: "Failed to update chat window name.",
        variant: "destructive",
      });
    }
  };

  const deleteWindow = async (windowId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('AIMessageLog')
        .delete()
        .eq('userid', user.id)
        .eq('chat_window_id', windowId);

      if (error) throw error;

      setChatWindows(prev => prev.filter(window => window.chat_window_id !== windowId));
      
      // If we deleted the currently selected window, create a new one
      if (selectedWindowId === windowId) {
        createNewChatWindow();
      }

      toast({
        title: "Success",
        description: "Chat window deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting window:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat window.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (window: ChatWindow) => {
    setEditingWindow(window.chat_window_id);
    setEditName(window.chat_window_name);
  };

  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat Sessions</CardTitle>
          <Button onClick={createNewChatWindow} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : chatWindows.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No chat sessions yet</p>
              <p className="text-sm">Create your first chat!</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {chatWindows.map((window) => (
                <div
                  key={window.chat_window_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedWindowId === window.chat_window_id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectWindow(window.chat_window_id, window.chat_window_name)}
                >
                  <div className="flex items-center justify-between">
                    {editingWindow === window.chat_window_id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => updateWindowName(window.chat_window_id, editName)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateWindowName(window.chat_window_id, editName);
                          }
                        }}
                        className="text-sm"
                        autoFocus
                      />
                    ) : (
                      <>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm truncate">
                            {window.chat_window_name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {window.messageCount} messages
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(window);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWindow(window.chat_window_id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};