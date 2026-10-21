import { useState, useEffect, useRef, useCallback } from 'react';
import { Call, Message } from '../types';
import { api } from '../api/client';

export interface UseVoiceCallReturn {
  call: Call | null;
  messages: Message[];
  status: 'idle' | 'requesting_permission' | 'connecting' | 'connected' | 'ending' | 'ended' | 'error';
  isMuted: boolean;
  isAiSpeaking: boolean;
  isCustomerSpeaking: boolean;
  durationSeconds: number;
  micPermission: 'prompt' | 'granted' | 'denied';
  errorMessage: string | null;
  recordingConsent: boolean;
  isRecording: boolean;
  startCall: (consent: boolean) => Promise<void>;
  endCall: () => Promise<Call | null>;
  toggleMute: () => void;
  sendTextMessage: (text: string) => Promise<void>;
}

// Polyfill Web Speech API interfaces
type IWindow = Window & typeof globalThis & {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
};

export function useVoiceCall(): UseVoiceCallReturn {
  const [call, setCall] = useState<Call | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<UseVoiceCallReturn['status']>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isCustomerSpeaking, setIsCustomerSpeaking] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Refs
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(isMuted);
  const statusRef = useRef(status);
  const callRef = useRef(call);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Sync refs
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { callRef.current = call; }, [call]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);

  // Duration timer
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = window.setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Stop AI audio playback
  const stopAiSpeech = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  }, []);

  // Play audio response
  const playAiAudio = useCallback((text: string, audioBase64: string | null) => {
    stopAiSpeech();
    setIsAiSpeaking(true);

    if (audioBase64) {
      const audio = new Audio(audioBase64);
      currentAudioRef.current = audio;
      audio.onended = () => {
        setIsAiSpeaking(false);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsAiSpeaking(false);
        currentAudioRef.current = null;
      };
      audio.play().catch(e => {
        console.warn('Audio play prevented or interrupted:', e);
        setIsAiSpeaking(false);
      });
    } else if ('speechSynthesis' in window) {
      // Browser SpeechSynthesis fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (naturalVoice) utterance.voice = naturalVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      setIsAiSpeaking(false);
    }
  }, [stopAiSpeech]);

  // Send message to backend and receive AI reply
  const handleProcessSpeech = useCallback(async (speechText: string) => {
    if (!speechText.trim() || !callRef.current) return;

    // Interrupt AI if customer speaks
    stopAiSpeech();

    // Optimistically add customer message to transcript
    const userMsg: Message = {
      id: 'cust-' + Date.now(),
      call_id: callRef.current.id,
      speaker: 'customer',
      content: speechText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await api.sendCustomerMessage(callRef.current.id, speechText);
      
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        call_id: callRef.current.id,
        speaker: 'ai',
        content: result.reply_text,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Play AI speech
      playAiAudio(result.reply_text, result.audio_base64);
    } catch (err: any) {
      console.error('Error processing speech:', err);
      setErrorMessage('Failed to receive AI response. Retrying...');
    }
  }, [stopAiSpeech, playAiAudio]);

  // Setup speech recognition
  const initSpeechRecognition = useCallback(() => {
    const win = window as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      console.warn('Web Speech API recognition not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsCustomerSpeaking(false);
    };

    recognition.onspeechstart = () => {
      if (!isMutedRef.current) {
        setIsCustomerSpeaking(true);
        // Interruption: user began speaking
        stopAiSpeech();
      }
    };

    recognition.onspeechend = () => {
      setIsCustomerSpeaking(false);
    };

    recognition.onresult = (event: any) => {
      if (isMutedRef.current) return;

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        const textToSend = finalTranscript.trim();
        finalTranscript = '';
        setIsCustomerSpeaking(false);
        handleProcessSpeech(textToSend);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
      }
      setIsCustomerSpeaking(false);
    };

    recognition.onend = () => {
      // Keep recognition alive while call is connected and not muted
      if (statusRef.current === 'connected' && !isMutedRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already running or closing
        }
      }
    };

    return recognition;
  }, [stopAiSpeech, handleProcessSpeech]);

  // Start Call
  const startCall = async (consent: boolean) => {
    try {
      setErrorMessage(null);
      setStatus('requesting_permission');
      setRecordingConsent(consent);

      // 1. Request microphone permission with timeout
      let stream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const micPromise = navigator.mediaDevices.getUserMedia({ audio: true });
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Mic request timed out')), 3500)
          );
          stream = await Promise.race([micPromise, timeoutPromise]);
          micStreamRef.current = stream;
          setMicPermission('granted');
        }
      } catch (err: any) {
        console.warn('Microphone stream unavailable or timed out; proceeding in interactive speech mode:', err);
        setMicPermission('denied');
        // Create fallback audio stream for recorder if needed
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const dst = ctx.createMediaStreamDestination();
            stream = dst.stream;
            micStreamRef.current = stream;
          }
        } catch (ctxErr) {}
      }

      setStatus('connecting');

      // 2. Initialize Call Session with Backend
      const newCall = await api.startCall(consent);
      setCall(newCall);
      setDurationSeconds(0);
      setMessages(newCall.messages || []);

      // 3. Setup Recording if consent granted
      if (consent && stream) {
        audioChunksRef.current = [];
        try {
          const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          recorder.start(1000); // 1-second chunks
          mediaRecorderRef.current = recorder;
          setIsRecording(true);
        } catch (recErr) {
          console.warn('MediaRecorder with webm failed, falling back:', recErr);
          try {
            const fallbackRecorder = new MediaRecorder(stream);
            fallbackRecorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            fallbackRecorder.start(1000);
            mediaRecorderRef.current = fallbackRecorder;
            setIsRecording(true);
          } catch (e) {
            console.error('Recording initialization failed:', e);
          }
        }
      }

      // 4. Start Speech Recognition
      const rec = initSpeechRecognition();
      if (rec) {
        recognitionRef.current = rec;
        try {
          rec.start();
        } catch (e) {
          console.warn('Recognition start caught:', e);
        }
      }

      setStatus('connected');

      // 5. Play Initial Greeting
      if (newCall.messages && newCall.messages.length > 0) {
        const greeting = newCall.messages[0].content;
        playAiAudio(greeting, null);
      }

    } catch (err: any) {
      console.error('Failed to start call:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to establish voice session');
    }
  };

  // End Call
  const endCall = async (): Promise<Call | null> => {
    if (!callRef.current) return null;
    setStatus('ending');
    stopAiSpeech();

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {}
    }

    // Stop MediaRecorder & upload recording if available
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        if (!mediaRecorderRef.current) return resolve();
        mediaRecorderRef.current.onstop = () => resolve();
        mediaRecorderRef.current.stop();
      });
      setIsRecording(false);
    }

    // Stop microphone tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }

    try {
      // 1. Upload audio recording if chunks exist
      if (recordingConsent && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          await api.uploadRecording(callRef.current.id, audioBlob);
        } catch (upErr) {
          console.error('Recording upload failed:', upErr);
        }
      }

      // 2. Call backend end-call to generate summary and classification
      const endedCall = await api.endCall(callRef.current.id, durationSeconds);
      setCall(endedCall);
      setStatus('ended');
      return endedCall;
    } catch (err: any) {
      console.error('Error ending call:', err);
      setStatus('ended');
      return null;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(t => {
          t.enabled = !next;
        });
      }
      return next;
    });
  };

  // Fallback text input in live call
  const sendTextMessage = async (text: string) => {
    await handleProcessSpeech(text);
  };

  return {
    call,
    messages,
    status,
    isMuted,
    isAiSpeaking,
    isCustomerSpeaking,
    durationSeconds,
    micPermission,
    errorMessage,
    recordingConsent,
    isRecording,
    startCall,
    endCall,
    toggleMute,
    sendTextMessage
  };
}
