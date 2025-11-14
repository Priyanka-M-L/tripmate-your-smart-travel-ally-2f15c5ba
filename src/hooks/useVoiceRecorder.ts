import { useState, useRef, useCallback } from 'react';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const base64Audio = base64data.split(',')[1];
            resolve(base64Audio);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);

          // Stop all tracks
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        } catch (error) {
          reject(error);
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
