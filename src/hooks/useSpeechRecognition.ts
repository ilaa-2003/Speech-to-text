import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export interface UseSpeechRecognitionOptions {
  wakeWord?: string;
  sleepWord?: string;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onWakeWordDetected?: () => void;
  onSleepWordDetected?: () => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = ({
  wakeWord = 'hi',
  sleepWord = 'bye',
  continuous = true,
  interimResults = true,
  lang = 'en-US',
  onTranscript,
  onWakeWordDetected,
  onSleepWordDetected,
  onError,
}: UseSpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (!SpeechRecognition) {
      const errorMsg = 'Speech Recognition API is not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript.trim();

        if (result.isFinal) {
          finalText += transcriptText + ' ';
          console.log('[Speech Recognition] FINAL:', transcriptText, '| Active:', isActiveRef.current);
        } else {
          interimText += transcriptText;
          console.log('[Speech Recognition] INTERIM:', transcriptText, '| Active:', isActiveRef.current);
        }
      }

      if (interimText) {
        setInterimTranscript(interimText);
        if (!isActiveRef.current) {
          onTranscript?.(interimText, false);
        }
      }

      if (finalText) {
        const lowerText = finalText.toLowerCase();

        if (!isActiveRef.current && lowerText.includes(wakeWord.toLowerCase())) {
          console.log('[Wake Word] Detected! Activating transcription...');
          isActiveRef.current = true;
          setIsActive(true);
          setTranscript('');
          setInterimTranscript('');
          onWakeWordDetected?.();

          const wakeWordIndex = lowerText.indexOf(wakeWord.toLowerCase());
          const textAfterWakeWord = finalText.substring(wakeWordIndex + wakeWord.length).trim();
          console.log('[Wake Word] Text after wake word:', textAfterWakeWord);
          if (textAfterWakeWord) {
            setTranscript(textAfterWakeWord + ' ');
            onTranscript?.(textAfterWakeWord, true);
          }
        } else if (isActiveRef.current && lowerText.includes(sleepWord.toLowerCase())) {
          console.log('[Sleep Word] Detected! Stopping transcription...');
          const sleepWordIndex = lowerText.indexOf(sleepWord.toLowerCase());
          const textBeforeSleepWord = finalText.substring(0, sleepWordIndex).trim();
          console.log('[Sleep Word] Text before sleep word:', textBeforeSleepWord);
          if (textBeforeSleepWord) {
            setTranscript((prev) => prev + textBeforeSleepWord + ' ');
            onTranscript?.(textBeforeSleepWord, true);
          }

          isActiveRef.current = false;
          setIsActive(false);
          setInterimTranscript('');
          onSleepWordDetected?.();
        } else if (isActiveRef.current) {
          console.log('[Active Transcription] Adding text:', finalText);
          setTranscript((prev) => prev + finalText);
          onTranscript?.(finalText, true);
        } else {
          console.log('[Waiting] Ignoring text (not active):', finalText);
        }

        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg = `Speech recognition error: ${event.error}`;
      setError(errorMsg);
      onError?.(errorMsg);

      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [wakeWord, sleepWord, continuous, interimResults, lang, onTranscript, onWakeWordDetected, onSleepWordDetected, onError, isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const errorMsg = 'Speech recognition not initialized';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      if (err instanceof Error && !err.message.includes('already started')) {
        const errorMsg = `Failed to start recognition: ${err.message}`;
        setError(errorMsg);
        onError?.(errorMsg);
      }
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsActive(false);
      isActiveRef.current = false;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isActive,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};
