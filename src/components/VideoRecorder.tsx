'use client';

import { useState, useRef } from 'react';

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void;
  exerciseName?: string;
}

export default function VideoRecorder({ onVideoRecorded, exerciseName }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access camera. Please grant camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUseVideo = () => {
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      onVideoRecorded(blob);
      setRecordedVideo(null);
      chunksRef.current = [];
    }
  };

  const handleRetake = () => {
    setRecordedVideo(null);
    chunksRef.current = [];
  };

  return (
    <div className="space-y-3">
      {!recordedVideo && !isRecording && (
        <button
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
          Record Video
        </button>
      )}

      {isRecording && (
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-red-500">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium">Recording...</span>
          </div>
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {recordedVideo && (
        <div className="space-y-3">
          <video 
            src={recordedVideo} 
            controls 
            className="w-full rounded-xl bg-black"
            playsInline
          />
          <div className="flex gap-2">
            <button
              onClick={handleRetake}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
            >
              Retake
            </button>
            <button
              onClick={handleUseVideo}
              disabled={uploading}
              className="flex-1 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-xl transition-colors"
            >
              {uploading ? 'Saving...' : 'Use Video'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
