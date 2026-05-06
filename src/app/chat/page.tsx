"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, Paperclip, MoreVertical, 
  MapPin, Phone, Video, ChevronLeft,
  Loader2, MessageCircle, AlertCircle
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "@/services/chat.service";
import type { Chat, Message } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import Link from "next/link";

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load Chats
  useEffect(() => {
    if (!user) return;
    const unsub = chatService.subscribeToChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Load Messages
  useEffect(() => {
    if (!selectedChat) return;
    const unsub = chatService.subscribeToMessages(selectedChat.id, (data) => {
      setMessages(data);
      chatService.markAsSeen(selectedChat.id, user!.uid);
    });
    return () => unsub();
  }, [selectedChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    setSending(true);
    const text = newMessage;
    setNewMessage("");
    try {
      await chatService.sendMessage(selectedChat.id, user.uid, text);
    } catch (error) {
      console.error(error);
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  // Amazon Base Classes
  const inputBaseClass = "w-full min-h-[31px] px-3 py-1.5 border border-[#a6a6a6] rounded-[3px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px] bg-white";
  const btnPrimary = "bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors";

  return (
    <AuthGuard>
      {/* Amazon standard light gray background */}
      <div className="flex flex-col h-screen overflow-hidden bg-[#eaeded] text-[#0f1111]">
        <SiteHeader />
        
        <main className="flex-grow flex justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
          
          {/* Main Content Card (Amazon Workspace Style) */}
          <div className="w-full max-w-[1200px] bg-white border border-[#d5d9d9] rounded-[4px] shadow-sm flex overflow-hidden h-full">
            
            {/* LEFT COLUMN: CHAT LIST */}
            <aside className={cn(
              "w-full md:w-[320px] border-r border-[#d5d9d9] bg-white flex flex-col shrink-0",
              selectedChat ? "hidden md:flex" : "flex"
            )}>
              <div className="p-4 border-b border-[#d5d9d9] bg-[#f0f2f2]">
                <h2 className="text-[18px] font-bold text-[#0f1111] mb-3">Message Center</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-[9px] h-4 w-4 text-[#565959]" />
                  <Input 
                    placeholder="Search messages" 
                    className={inputBaseClass + " pl-9"}
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-grow">
                <div className="flex flex-col">
                  {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-[80px] animate-pulse bg-[#f8f8f8] border-b border-[#e7e7e7]" />)
                  ) : chats.length > 0 ? (
                    chats.map(chat => {
                      const otherId = chat.participants.find(id => id !== user?.uid) || "";
                      const otherName = chat.participantNames[otherId];
                      const otherAvatar = chat.participantAvatars[otherId];
                      const isActive = selectedChat?.id === chat.id;
                      
                      return (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChat(chat)}
                          className={cn(
                            "w-full flex items-start gap-3 p-4 border-b border-[#e7e7e7] cursor-pointer transition-colors relative",
                            isActive 
                              ? "bg-[#fcf5ee] hover:bg-[#fcf5ee]" 
                              : "bg-white hover:bg-gray-50"
                          )}
                        >
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#e77600]" />}
                          
                          <Avatar className="h-[40px] w-[40px] rounded-[4px] border border-[#d5d9d9] shrink-0">
                            <AvatarImage src={otherAvatar || ""} />
                            <AvatarFallback className="bg-[#f0f2f2] text-[#565959] font-bold rounded-[4px]">
                              {otherName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className={cn("font-bold text-[14px] truncate", isActive ? "text-[#007185]" : "text-[#0f1111]")}>
                                {otherName}
                              </h4>
                              <span className="text-[11px] text-[#565959] shrink-0 mt-0.5">
                                {chat.lastMessageAt ? formatTime(chat.lastMessageAt) : ""}
                              </span>
                            </div>
                            <p className={cn(
                              "text-[12px] line-clamp-2 leading-snug",
                              isActive ? "text-[#0f1111]" : "text-[#565959]"
                            )}>
                              {chat.lastMessage}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 px-4">
                      <MessageCircle className="h-10 w-10 text-[#a6a6a6] mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-[14px] font-bold text-[#0f1111]">No messages</p>
                      <p className="text-[13px] text-[#565959] mt-1">When you contact a provider, messages will appear here.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </aside>

            {/* RIGHT COLUMN: CHAT WINDOW */}
            <section className={cn(
              "flex-grow flex flex-col bg-white relative",
              !selectedChat ? "hidden md:flex" : "flex"
            )}>
              {selectedChat ? (
                <>
                  {/* CHAT HEADER */}
                  <div className="p-4 border-b border-[#d5d9d9] bg-[#f8f8f8] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <button className="md:hidden p-1 text-[#007185]" onClick={() => setSelectedChat(null)}>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h4 className="font-bold text-[16px] text-[#0f1111]">
                          {selectedChat.participantNames[selectedChat.participants.find(id => id !== user?.uid) || ""]}
                        </h4>
                        <div className="text-[12px] text-[#565959] mt-0.5">
                          Booking Inquiry
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-[31px] bg-white border-[#d5d9d9] text-[13px] text-[#0f1111] hover:bg-gray-50 px-3">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Amazon Security Warning */}
                  <div className="bg-[#fff3cd] border-b border-[#ff9900] p-3 flex gap-3 text-[12px] text-[#0f1111]">
                    <AlertCircle className="h-4 w-4 text-[#c40000] shrink-0 mt-0.5" />
                    <p>
                      For your security, keep all communication and payments within the Servexia platform. Never share sensitive personal or payment information in this chat.
                    </p>
                  </div>

                  {/* MESSAGES AREA */}
                  <ScrollArea className="flex-grow p-4 md:p-6 bg-white">
                    <div className="space-y-6 pb-4 max-w-3xl mx-auto">
                      <div className="text-center">
                        <span className="bg-[#f0f2f2] text-[#565959] border border-[#d5d9d9] text-[11px] px-3 py-1 rounded-[4px] font-bold">
                          TODAY
                        </span>
                      </div>
                      
                      {messages.map((msg, i) => {
                        const isMe = msg.senderId === user?.uid;
                        return (
                          <div key={msg.id || i} className="flex flex-col w-full">
                            <div className={cn(
                              "max-w-[85%] md:max-w-[75%]",
                              isMe ? "ml-auto" : "mr-auto"
                            )}>
                              {/* Meta Info */}
                              <div className={cn("text-[11px] text-[#565959] mb-1 flex", isMe ? "justify-end" : "justify-start")}>
                                {isMe ? "You" : selectedChat.participantNames[msg.senderId]} • {msg.timestamp ? formatTime(msg.timestamp) : ""}
                              </div>
                              
                              {/* Amazon Style Message Block */}
                              <div className={cn(
                                "px-4 py-3 text-[13px] leading-relaxed border rounded-[4px]",
                                isMe 
                                  ? "bg-[#f0f2f2] border-[#d5d9d9] text-[#0f1111]" 
                                  : "bg-white border-[#d5d9d9] text-[#0f1111]"
                              )}>
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* MESSAGE INPUT AREA */}
                  <div className="p-4 border-t border-[#d5d9d9] bg-[#f8f8f8] shrink-0">
                    <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input 
                          placeholder="Write your message here..." 
                          className={inputBaseClass + " flex-grow h-[38px]"}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <div className="flex items-center gap-2 justify-end sm:justify-start">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="bg-white border-[#d5d9d9] h-[38px] px-3 hover:bg-gray-50 text-[#565959]"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="submit" 
                            className={btnPrimary + " h-[38px] px-6"}
                            disabled={!newMessage.trim() || sending}
                          >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Send message
                          </Button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#565959] mt-2 text-right sm:text-left">
                        Pressing Send will transmit this message securely.
                      </p>
                    </form>
                  </div>
                </>
              ) : (
                // Empty State
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-[#f8f8f8]">
                  <MessageCircle className="h-16 w-16 text-[#d5d9d9] mb-4" strokeWidth={1} />
                  <h3 className="text-[18px] font-bold text-[#0f1111]">Message Center</h3>
                  <p className="text-[13px] text-[#565959] max-w-[300px] mt-2">
                    Select a conversation from the list to view your message history or reply to a provider.
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}