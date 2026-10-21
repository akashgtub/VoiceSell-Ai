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
  stopAiSpeech: () => void;
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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMutedRef = useRef(isMuted);
  const statusRef = useRef(status);
  const callRef = useRef(call);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mixedStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Acoustic Echo Cancellation & Bleed Prevention Refs
  const isAiAudioPlayingRef = useRef<boolean>(false);
  const currentAiTextRef = useRef<string>('');
  const lastAiSpeechEndTimeRef = useRef<number>(0);
  const recognitionRestartTimeoutRef = useRef<number | null>(null);

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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Stop AI audio playback
  const stopAiSpeech = useCallback(() => {
    isAiAudioPlayingRef.current = false;
    lastAiSpeechEndTimeRef.current = Date.now();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    utteranceRef.current = null;
    setIsAiSpeaking(false);
  }, []);

  // Play audio response
  const playAiAudio = useCallback((text: string, audioBase64: string | null) => {
    stopAiSpeech();
    setIsAiSpeaking(true);
    isAiAudioPlayingRef.current = true;
    currentAiTextRef.current = text.toLowerCase();

    if (audioBase64) {
      try {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = audioBase64;
        currentAudioRef.current = audio;

        // Route to mixed recorder destination if active
        if (audioContextRef.current && mixedStreamDestRef.current && audioContextRef.current.state !== 'closed') {
          try {
            const source = audioContextRef.current.createMediaElementSource(audio);
            source.connect(mixedStreamDestRef.current);
            source.connect(audioContextRef.current.destination);
          } catch (e) {
            // Already connected or browser limitation
          }
        }

        audio.onended = () => {
          isAiAudioPlayingRef.current = false;
          lastAiSpeechEndTimeRef.current = Date.now();
          setIsAiSpeaking(false);
          currentAudioRef.current = null;
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error, falling back to synthesis:', e);
          isAiAudioPlayingRef.current = false;
          lastAiSpeechEndTimeRef.current = Date.now();
          currentAudioRef.current = null;
          // Fallback to speech synthesis if audio buffer fails
          playSpeechSynthesisFallback(text);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn('Audio play prevented or interrupted:', e);
            // Fallback to speech synthesis
            playSpeechSynthesisFallback(text);
          });
        }
      } catch (err) {
        console.warn('Error creating audio element:', err);
        playSpeechSynthesisFallback(text);
      }
    } else {
      playSpeechSynthesisFallback(text);
    }
  }, [stopAiSpeech]);

  // SpeechSynthesis Fallback
  const playSpeechSynthesisFallback = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsAiSpeaking(false);
      isAiAudioPlayingRef.current = false;
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        isAiAudioPlayingRef.current = false;
        lastAiSpeechEndTimeRef.current = Date.now();
        setIsAiSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        isAiAudioPlayingRef.current = false;
        lastAiSpeechEndTimeRef.current = Date.now();
        setIsAiSpeaking(false);
        utteranceRef.current = null;
      };

      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const naturalVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Microsoft'))
          ) || voices.find(v => v.lang.startsWith('en'));
          if (naturalVoice) utterance.voice = naturalVoice;
        }
        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          setVoiceAndSpeak();
        };
        // Also call speak immediately as fallback
        window.speechSynthesis.speak(utterance);
      } else {
        setVoiceAndSpeak();
      }
    } catch (e) {
      console.warn('Speech synthesis call failed:', e);
      setIsAiSpeaking(false);
      isAiAudioPlayingRef.current = false;
    }
  };

  // Helper: Detect if recognized speech is speaker feedback echo from the AI
  const isAcousticEcho = (customerText: string): boolean => {
    if (!isAiAudioPlayingRef.current && Date.now() - lastAiSpeechEndTimeRef.current > 1200) {
      return false;
    }
    const aiText = currentAiTextRef.current;
    if (!aiText) return false;

    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
    const custWords = clean(customerText).split(/\s+/).filter(w => w.length > 2);
    if (custWords.length === 0) return true;

    const aiWords = clean(aiText).split(/\s+/).filter(w => w.length > 2);
    const aiWordSet = new Set(aiWords);

    let matchCount = 0;
    for (const w of custWords) {
      if (aiWordSet.has(w)) matchCount++;
    }

    const matchRatio = matchCount / custWords.length;
    // If over 40% of words match what the AI is speaking right now, it's acoustic feedback
    return matchRatio >= 0.4;
  };

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
        // Only interrupt AI immediately if user actively speaks and AI is not just speaking to itself
        if (!isAiAudioPlayingRef.current) {
          stopAiSpeech();
        }
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

        // Check for acoustic echo feedback
        if (isAcousticEcho(textToSend)) {
          console.log('[Echo Suppression]: Filtered out AI speaker bleed from recognition:', textToSend);
          return;
        }

        // Genuine customer speech detected -> stop any ongoing AI audio and process
        stopAiSpeech();
        handleProcessSpeech(textToSend);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicPermission('denied');
        setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
        recognitionRef.current = null;
      }
      setIsCustomerSpeaking(false);
    };

    recognition.onend = () => {
      // Keep recognition alive while call is connected and not muted
      if (statusRef.current === 'connected' && !isMutedRef.current && micPermission !== 'denied' && recognitionRef.current) {
        if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);
        recognitionRestartTimeoutRef.current = window.setTimeout(() => {
          if (statusRef.current === 'connected' && !isMutedRef.current && recognitionRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Already active
            }
          }
        }, 300);
      }
    };

    return recognition;
  }, [stopAiSpeech, handleProcessSpeech, micPermission]);

  // Start Call
  const startCall = async (consent: boolean) => {
    try {
      setErrorMessage(null);
      setStatus('requesting_permission');
      setRecordingConsent(consent);

      // Pre-warm Web Audio Context during user activation gesture
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          audioContextRef.current = ctx;
        }
      } catch (e) {
        console.warn('AudioContext pre-warming note:', e);
      }

      // 1. Request microphone permission with hardware echo cancellation
      let stream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const micPromise = navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Mic request timed out')), 4000)
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
          if (audioContextRef.current) {
            const dst = audioContextRef.current.createMediaStreamDestination();
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

      // 3. Setup Mixed Dual-Channel Recording if consent granted
      if (consent && stream) {
        audioChunksRef.current = [];
        let recordStream = stream;

        try {
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            const dest = audioContextRef.current.createMediaStreamDestination();
            mixedStreamDestRef.current = dest;
            const micSource = audioContextRef.current.createMediaStreamSource(stream);
            micSource.connect(dest);
            recordStream = dest.stream;
          }
        } catch (mixErr) {
          console.warn('Dual-channel mixer fallback to direct stream:', mixErr);
          recordStream = stream;
        }

        try {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : '';

          const recorder = mimeType ? new MediaRecorder(recordStream, { mimeType }) : new MediaRecorder(recordStream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          recorder.start(1000); // 1-second chunks
          mediaRecorderRef.current = recorder;
          setIsRecording(true);
        } catch (recErr) {
          console.warn('MediaRecorder initialization notice:', recErr);
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

      // 5. Play Initial AI Greeting (Neural Edge-TTS Audio with synthesis fallback)
      if (newCall.messages && newCall.messages.length > 0) {
        const greeting = newCall.messages[0].content;
        const initialAudio = newCall.initial_audio_base64 || null;
        playAiAudio(greeting, initialAudio);
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

    if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);

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
    sendTextMessage,
    stopAiSpeech
  };
}
