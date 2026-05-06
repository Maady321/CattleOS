'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Check, X, RefreshCw } from 'lucide-react';

interface VoiceInputProps {
  onActionConfirmed: (type: string, data: any) => void;
}

export default function VoiceInput({ onActionConfirmed }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [prediction, setPrediction] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ml-IN'; // Default to Malayalam

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) handleProcessTranscript();
      };
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setPrediction(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleProcessTranscript = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/v1/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Voice processing failed', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (prediction) {
      onActionConfirmed(prediction.type, prediction.data);
      setPrediction(null);
      setTranscript('');
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/50">
        {!prediction ? (
          <div className="flex flex-col items-center gap-6">
            <div className={`text-center ${isListening ? 'animate-pulse' : ''}`}>
              <p className="text-slate-400 text-sm font-medium">
                {isListening ? 'Listening in Malayalam...' : 'Tap to speak data'}
              </p>
              <h3 className="text-white text-lg font-bold mt-1 min-h-[28px]">
                {transcript || 'e.g. "രാവിലെ 5 ലിറ്റർ പാൽ"'}
              </h3>
            </div>
            
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                isListening 
                  ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isListening ? (
                <Square className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-white font-bold text-lg mb-4 text-center">
              {prediction.confirmation_text}
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setPrediction(null)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl border border-white/10 transition-all"
              >
                <X className="w-5 h-5" /> Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-5 h-5" /> Confirm
              </button>
            </div>
          </div>
        )}
        
        {processing && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
