import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { getGeminiChat, ChatMessage, createSampleKhonKaenTrip } from '@/lib/gemini';
import { cn } from '@/lib/utils';

const AIAssistant = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on first open
  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = getGeminiChat();
      setMessages(chatRef.current.getMessages());
    }
  }, [isOpen]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage(userMessage);

      // Check if the response contains special commands
      if (response.includes('[CREATE_TRIP]')) {
        // Extract trip creation command and create the trip
        const tripId = createSampleKhonKaenTrip();
        const successMessage = `✅ สร้างทริปสำเร็จแล้ว! 🎉\n\nทริป "${tripId}" ถูกบันทึกใน localStorage แล้ว\n\nคุณสามารถดูและแก้ไขทริปได้ในหน้า "ทริปของฉัน" หรือคลิกปุ่มด้านล่างเพื่อดูทริปนี้เลย!`;

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: successMessage,
          timestamp: new Date()
        }]);

        // Add navigation button (this will be displayed as a clickable element)
        setTimeout(() => {
          navigate(`/plan/${tripId}`);
        }, 2000);
      } else {
        setMessages(chatRef.current.getMessages());
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'ขออภัย เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (chatRef.current) {
      chatRef.current.clearHistory();
      setMessages([]);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 animate-pulse"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={cn(
        "w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border-2 border-blue-200 shadow-2xl transition-all duration-300",
        isMinimized ? "h-14" : "max-h-[calc(100vh-6rem)]"
      )}>
        {/* Header */}
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-sm font-kanit text-blue-800">
                AI Assistant
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 hover:bg-blue-100"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3" />
                ) : (
                  <Minimize2 className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <p className="text-xs text-gray-600 font-sarabun">
              ถามฉันเกี่ยวกับการท่องเที่ยวขอนแก่นได้เลย!
            </p>
          )}
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-64 p-3">
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500 font-sarabun">
                        สวัสดี! ฉันเป็น AI Assistant ของ KhonKaenTravelAI
                        <br />
                        ถามอะไรเกี่ยวกับการท่องเที่ยวขอนแก่นก็ได้นะ!
                      </p>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-2 rounded-lg text-sm font-sarabun",
                          msg.role === 'user'
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Quick Actions */}
            <div className="px-3 py-2 border-t bg-blue-50">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const quickMessage = "ช่วยสร้างทริป 3 วันที่น่าสนใจในขอนแก่นหน่อย";
                    setMessage(quickMessage);
                    // Auto-send after a brief delay
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="text-xs h-7 px-2 bg-white hover:bg-blue-50 border-blue-200"
                  disabled={isLoading}
                >
                  🗺️ สร้างทริป
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const quickMessage = "แนะนำร้านอาหารที่ดีในขอนแก่น";
                    setMessage(quickMessage);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="text-xs h-7 px-2 bg-white hover:bg-blue-50 border-blue-200"
                  disabled={isLoading}
                >
                  🍜 อาหาร
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const quickMessage = "สถานที่ท่องเที่ยวแนะนำในขอนแก่น";
                    setMessage(quickMessage);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="text-xs h-7 px-2 bg-white hover:bg-blue-50 border-blue-200"
                  disabled={isLoading}
                >
                  📍 สถานที่
                </Button>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-gray-50">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="พิมพ์ข้อความของคุณที่นี่..."
                  className="flex-1 text-sm font-sarabun"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700"
                >
                  ล้างการสนทนา
                </Button>
                <span className="text-xs text-gray-400">
                  กด Enter เพื่อส่ง
                </span>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default AIAssistant;