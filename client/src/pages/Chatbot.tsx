
import { useState, useRef, useEffect } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send } from "lucide-react";

// Mock chatbot responses
const mockResponses = {
  "hello": "Hello! How can I help you today?",
  "hi": "Hi there! How may I assist you?",
  "who are you": "I'm the Yenepoya University campus chatbot. I can answer questions about courses, facilities, events, and other campus related information.",
  "courses": "Yenepoya University offers various undergraduate and postgraduate programs in Medicine, Dentistry, Nursing, Pharmacy, Physiotherapy, and many more. What specific course are you interested in?",
  "library": "The central library is open from 8 AM to 10 PM on weekdays, and 9 AM to 5 PM on weekends. It has over 50,000 books and journals across various disciplines.",
  "cafeteria": "There are multiple cafeterias on campus. The main cafeteria is open from 7:30 AM to 9 PM and serves breakfast, lunch, and dinner. There are also coffee shops and food kiosks around campus.",
  "hostel": "Yenepoya University provides separate hostel facilities for boys and girls with furnished rooms, Wi-Fi, recreational areas, and 24/7 security. For more details, please contact the hostel warden.",
  "fees": "Fee structures vary based on the program. Please visit the university website or contact the admissions office for detailed information on fees for specific courses.",
  "admission": "Admissions are typically based on entrance exams and previous academic performance. The admission process usually starts in January each year. For specific programs, please check the university website.",
  "exams": "The examination schedule is published on the university portal at least 3 weeks before exams begin. Make sure to check regularly for any updates.",
  "wifi": "Free Wi-Fi is available across the campus. Connect to 'Yenepoya_Student' network and use your student login credentials.",
  "sports": "The university has facilities for cricket, football, basketball, tennis, badminton, and indoor games. The sports complex is open from 6 AM to 8 PM.",
  "bus": "University buses operate on multiple routes covering major parts of the city. Bus schedules are available at the transport office and on the university app.",
  "holiday": "Please check the academic calendar on the university website or portal for the list of holidays and semester breaks.",
  "reminder": "I can set a reminder for you. Please specify what you'd like to be reminded about and when."
};

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

function getResponse(query: string): string {
  // Convert query to lowercase for case-insensitive matching
  const lowercaseQuery = query.toLowerCase();
  
  // Check each keyword in mockResponses
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (lowercaseQuery.includes(keyword)) {
      return response;
    }
  }
  
  // Default response if no keyword matches
  return "I'm not sure about that. Could you rephrase your question or ask about campus facilities, courses, or schedules?";
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Yenepoya University campus assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate bot thinking
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: getResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // If user mentioned a reminder
      if (input.toLowerCase().includes("reminder")) {
        setTimeout(() => {
          toast.success("Reminder set successfully!");
        }, 1000);
      }
    }, 1000);
  };
  
  const handleSetReminder = () => {
    setInput("Can you remind me about my next exam?");
  };

  return (
    <DefaultLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Campus Chatbot</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Campus Assistant</CardTitle>
                <CardDescription>
                  Ask questions about courses, facilities, events, and more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] overflow-y-auto pr-4">
                  {messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="mr-2 mt-0.5">
                          <AvatarImage src="/placeholder.svg" alt="Bot" />
                          <AvatarFallback>YU</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div 
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.sender === 'user' 
                            ? 'bg-yendine-navy text-white' 
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      {message.sender === 'user' && (
                        <Avatar className="ml-2 mt-0.5">
                          <AvatarImage src="/placeholder.svg" alt="You" />
                          <AvatarFallback>YO</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <Avatar className="mr-2 mt-0.5">
                        <AvatarImage src="/placeholder.svg" alt="Bot" />
                        <AvatarFallback>YU</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <p>Typing...</p>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="bg-yendine-teal hover:bg-yendine-teal/90 text-white"
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("Tell me about the library hours")}
                >
                  Library Hours
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("What courses are offered?")}
                >
                  Courses Info
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setInput("When is the next holiday?")}
                >
                  Holiday Schedule
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleSetReminder}
                >
                  Set Reminder
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-2">
                  <p className="font-medium">Library Extended Hours</p>
                  <p className="text-sm text-muted-foreground">During exam week</p>
                </div>
                <div className="border-b pb-2">
                  <p className="font-medium">Summer Internship Fair</p>
                  <p className="text-sm text-muted-foreground">Next Monday, 10 AM</p>
                </div>
                <div>
                  <p className="font-medium">New Sports Equipment</p>
                  <p className="text-sm text-muted-foreground">Now available at the gym</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
