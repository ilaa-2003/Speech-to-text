import { useState, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Mic, MicOff, Wand2, Moon, Trash2 } from 'lucide-react';

export interface SpeechTranscriptionModuleProps {
  wakeWord?: string;
  sleepWord?: string;
  onTranscriptUpdate?: (transcript: string) => void;
  className?: string;
}

export const SpeechTranscriptionModule = ({
  wakeWord = 'hi',
  sleepWord = 'bye',
  onTranscriptUpdate,
  className = '',
}: SpeechTranscriptionModuleProps) => {
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  }, []);

  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      addDebugLog(`Transcript (${isFinal ? 'final' : 'interim'}): "${text}"`);
      if (isFinal) {
        setTranscriptHistory((prev) => [...prev, text.trim()]);
        onTranscriptUpdate?.(text);
      }
    },
    [onTranscriptUpdate, addDebugLog]
  );

  const {
    isListening,
    isActive,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    wakeWord,
    sleepWord,
    onTranscript: handleTranscript,
    onWakeWordDetected: () => {
      addDebugLog('✓ Wake word detected - Transcription ACTIVE');
    },
    onSleepWordDetected: () => {
      addDebugLog('✗ Sleep word detected - Transcription STOPPED');
    },
    onError: (err) => {
      addDebugLog(`Error: ${err}`);
    },
  });

  const handleClearTranscript = () => {
    resetTranscript();
    setTranscriptHistory([]);
  };

  if (!isSupported) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800 font-medium">
          Speech Recognition is not supported in this browser.
        </p>
        <p className="text-red-600 text-sm mt-2">
          Please use Chrome, Edge, or Safari to test this module.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">
            Speech Transcription Module
          </h2>
          <p className="text-sm text-gray-600">
            Say <span className="font-semibold text-blue-600">"{wakeWord}"</span> to start,{' '}
            <span className="font-semibold text-orange-600">"{sleepWord}"</span> to stop
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={20} />
                Stop Listening
              </>
            ) : (
              <>
                <Mic size={20} />
                Start Listening
              </>
            )}
          </button>

          {(transcript || transcriptHistory.length > 0) && (
            <button
              onClick={handleClearTranscript}
              className="p-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              title="Clear transcript"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
            isListening
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <Mic
            size={18}
            className={isListening ? 'text-green-600' : 'text-gray-400'}
          />
          <span
            className={`text-sm font-medium ${
              isListening ? 'text-green-700' : 'text-gray-500'
            }`}
          >
            {isListening ? 'Listening' : 'Not Listening'}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
            isActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          {isActive ? (
            <Wand2 size={18} className="text-blue-600" />
          ) : (
            <Moon size={18} className="text-gray-400" />
          )}
          <span
            className={`text-sm font-medium ${
              isActive ? 'text-blue-700' : 'text-gray-500'
            }`}
          >
            {isActive ? 'Transcribing' : 'Waiting for wake word'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 min-h-[300px]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transcript
        </h3>

        {!isListening && transcriptHistory.length === 0 && !transcript && (
          <p className="text-gray-400 italic">
            Click "Start Listening" and say the wake word to begin transcription...
          </p>
        )}

        <div className="space-y-3">
          {transcriptHistory.map((text, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <p className="text-gray-900">{text}</p>
            </div>
          ))}

          {transcript && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-900">{transcript}</p>
            </div>
          )}

          {isActive && interimTranscript && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-gray-600 italic">{interimTranscript}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          How to use:
        </h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Click "Start Listening" to enable speech recognition</li>
          <li>Say "<span className="font-semibold">{wakeWord}</span>" to activate transcription</li>
          <li>Speak normally - your speech will be transcribed in real-time</li>
          <li>Say "<span className="font-semibold">{sleepWord}</span>" to stop transcription</li>
          <li>Repeat steps 2-4 as needed</li>
        </ol>
      </div>

      <div className="bg-gray-900 text-gray-100 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2 text-green-400">
          Debug Log (Real-time Speech Recognition)
        </h4>
        <div className="text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
          {debugLog.length === 0 ? (
            <p className="text-gray-500">Waiting for speech input...</p>
          ) : (
            debugLog.map((log, index) => (
              <div key={index} className="text-gray-300">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
