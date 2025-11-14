import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { ArrowLeft, Send, Bot, User as UserIcon, Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WellnessChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm your wellness travel assistant. I'm here to provide emotional support, answer your questions, and help you plan comfortable travels based on your wellness needs. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText || !userId || sending) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("wellness-chat", {
        body: {
          message: userMessage.content,
          userId: userId,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-play voice response if enabled
      if (autoPlayVoice) {
        await playTextAsVoice(data.response);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      if (isRecording) {
        // Stop recording and transcribe
        setSending(true);
        const audioBase64 = await stopRecording();

        toast({
          title: "Transcribing...",
          description: "Converting your voice to text",
        });

        const { data, error } = await supabase.functions.invoke("speech-to-text", {
          body: { audio: audioBase64 },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        // Send the transcribed text
        await handleSend(data.text);
      } else {
        // Start recording
        await startRecording();
        toast({
          title: "Recording",
          description: "Speak now...",
        });
      }
    } catch (error: any) {
      console.error("Error with voice input:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process voice input",
        variant: "destructive",
      });
      setSending(false);
    }
  };

  const playTextAsVoice = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text, voice: "alloy" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Convert base64 to audio and play
      const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error: any) {
      console.error("Error playing audio:", error);
      setIsPlayingAudio(false);
      toast({
        title: "Audio Error",
        description: "Failed to play voice response",
        variant: "destructive",
      });
    }
  };

  const base64ToBlob = (base64: string, type: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-profile-gradient-start via-profile-gradient-mid to-profile-gradient-end">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-profile-gradient-start via-profile-gradient-mid to-profile-gradient-end py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/wellness")}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wellness
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wellness Chat Assistant</h1>
          <p className="text-white/80">Get personalized emotional support and travel advice</p>
        </div>

        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden h-[600px] flex flex-col">
          <ScrollArea ref={scrollRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-profile-button flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-profile-button text-white"
                        : "bg-gray-100 text-profile-text"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-profile-button flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-profile-button" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant={autoPlayVoice ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoPlayVoice(!autoPlayVoice)}
                className="text-xs"
              >
                <Volume2 className="w-3 h-3 mr-1" />
                Auto-play Voice: {autoPlayVoice ? "ON" : "OFF"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleVoiceInput}
                disabled={sending}
                variant={isRecording ? "destructive" : "outline"}
                className="rounded-xl"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending || isRecording}
                className="flex-1 bg-gray-50 border-gray-200 focus:border-profile-button focus:ring-profile-button rounded-xl"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending || isRecording}
                className="bg-profile-button hover:bg-profile-button/90 text-white rounded-xl px-6"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WellnessChat;
