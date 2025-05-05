
import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSupported(true);
        const recognitionInstance = new SpeechRecognition();
        
        // Configure
        recognitionInstance.continuous = options.continuous ?? false;
        recognitionInstance.interimResults = options.interimResults ?? true;
        recognitionInstance.lang = options.language ?? 'en-US';
        
        setRecognition(recognitionInstance);
      }
    }
  }, [options.continuous, options.interimResults, options.language]);

  const startListening = useCallback(() => {
    if (!supported || !recognition) return;
    
    setTranscript('');
    setInterimTranscript('');
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          currentInterimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      
      setInterimTranscript(currentInterimTranscript);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  }, [supported, recognition]);

  const stopListening = useCallback(() => {
    if (!supported || !recognition) return;
    
    recognition.stop();
    setIsListening(false);
  }, [supported, recognition]);

  return {
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    isListening,
    supported
  };
}
