import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatWindowList } from "./ChatWindowList";

interface ChatMessage {
  id: string;
  userinput: string;
  airesponse: string;
  timestamp: string;
  chat_window_id: string;
}

export const FitnessChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedWindowId, setSelectedWindowId] = useState<string>("");
  const [selectedWindowName, setSelectedWindowName] = useState<string>("New chat");
  const [showWindowList, setShowWindowList] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load chat history when dialog opens or window changes
  useEffect(() => {
    if (isOpen && user && selectedWindowId) {
      loadChatHistory();
    }
  }, [isOpen, user, selectedWindowId]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user || !selectedWindowId) return;

    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('AIMessageLog')
        .select('*')
        .eq('userid', user.id)
        .eq('chat_window_id', selectedWindowId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim() || !user || isLoading || !selectedWindowId) return;

    const userMessage = currentInput.trim();
    setCurrentInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-chat', {
        body: {
          userInput: userMessage,
          userId: user.id,
          chatWindowId: selectedWindowId,
          chatWindowName: selectedWindowName
        }
      });

      if (error) throw error;

      if (data.success) {
        // Add the new message to the chat history
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          userinput: userMessage,
          airesponse: data.aiResponse,
          timestamp: new Date().toISOString(),
          chat_window_id: selectedWindowId
        };
        
        setMessages(prev => [...prev, newMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWindow = (windowId: string, windowName: string) => {
    setSelectedWindowId(windowId);
    setSelectedWindowName(windowName);
    setShowWindowList(false);
  };

  const handleBackToWindowList = () => {
    setShowWindowList(true);
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-20 right-4 rounded-full shadow-lg z-50 h-14 w-14 p-0"
          variant="default"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {showWindowList ? "Fitness Coach AI - Chat Sessions" : `${selectedWindowName}`}
            {!showWindowList && (
              <Button variant="ghost" size="sm" onClick={handleBackToWindowList}>
                ← Back to Sessions
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex min-h-0">
          {showWindowList ? (
            <ChatWindowList 
              onSelectWindow={handleSelectWindow}
              selectedWindowId={selectedWindowId}
            />
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading chat history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a conversation with your AI fitness coach!</p>
                    <p className="text-sm mt-1">Ask about workouts, nutrition, or healthy habits.</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <div key={message.id} className="space-y-3">
                        {/* User message */}
                        <div className="flex justify-end">
                          <Card className="max-w-[80%] bg-primary text-primary-foreground">
                            <CardContent className="p-3">
                              <p className="text-sm">{message.userinput}</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* AI response */}
                        <div className="flex justify-start">
                          <Card className="max-w-[80%] bg-muted">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <MessageCircle className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                                <p className="text-sm whitespace-pre-wrap">{message.airesponse}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input area */}
              <div className="p-6 pt-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about fitness, nutrition, or workouts..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !currentInput.trim()}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};