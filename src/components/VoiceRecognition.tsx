import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Add the missing type definitions for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceRecognitionProps {
  onResult: (transcript: string) => void;
  isProcessing: boolean;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({ 
  onResult,
  isProcessing
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Your browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript = event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        try {
          recognitionRef.current?.start();
        } catch (error) {
          console.error("Recognition error:", error);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  useEffect(() => {
    if (transcript) {
      onResult(transcript);
    }
  }, [transcript, onResult]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
      toast.info("Voice recognition stopped");
    } else {
      setIsListening(true);
      try {
        recognitionRef.current?.start();
        toast.success("Listening...");
      } catch (error) {
        console.error("Recognition error:", error);
        toast.error("Failed to start voice recognition");
      }
    }
  };

  return (
    <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`rounded-full w-20 h-20 flex items-center justify-center ${
              isListening 
                ? "bg-primary hover:bg-primary/90" 
                : "bg-muted hover:bg-muted/90"
            }`}
          >
            {isListening ? (
              <Mic size={32} className="text-white animate-pulse-slow" />
            ) : (
              <MicOff size={32} className="text-primary" />
            )}
          </Button>
          {isProcessing && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Volume2 size={32} className="text-primary animate-pulse" />
            </div>
          )}
        </div>
        <div className="text-center">
          {isListening ? (
            <p className="text-sm text-muted-foreground">
              Listening... Say a recipe name or command
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tap to start voice recognition
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VoiceRecognition;
