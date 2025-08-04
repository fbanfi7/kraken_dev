import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import RecordRTC from 'recordrtc';

export const useAudioRecording = (onTranscriptionComplete: (text: string) => void, selectedPrompt?: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      // Activar Wake Lock para evitar que se apague la pantalla
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock activado durante la grabación');
        } catch (wakeLockError) {
          console.warn('No se pudo activar Wake Lock:', wakeLockError);
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=opus',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 48000,
        timeSlice: 1000
      });

      recorderRef.current = recorder;
      recorder.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar el temporizador
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Grabación iniciada",
        description: "Hable normalmente"
      });

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      toast({
        title: "Error de micrófono",
        description: "No se pudo acceder al micrófono. Verifique los permisos.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && isRecording && !isPaused) {
      recorderRef.current.pauseRecording();
      setIsPaused(true);
      
      // Pausar el temporizador
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Grabación pausada",
        description: "La grabación ha sido pausada"
      });
    }
  }, [isRecording, isPaused, toast]);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && isRecording && isPaused) {
      recorderRef.current.resumeRecording();
      setIsPaused(false);
      
      // Reanudar el temporizador
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Grabación reanudada",
        description: "La grabación ha sido reanudada"
      });
    }
  }, [isRecording, isPaused, toast]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording(async () => {
        const audioBlob = recorderRef.current!.getBlob();
        await processAudio(audioBlob);
        
        // Limpiar el stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Liberar Wake Lock
        if (wakeLockRef.current) {
          wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock liberado');
        }
      });
      
      setIsRecording(false);
      setIsPaused(false);
      setIsProcessing(true);
      
      // Limpiar el temporizador
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording(() => {
        // No procesar el audio, solo limpiar
        
        // Limpiar el stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Liberar Wake Lock
        if (wakeLockRef.current) {
          wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock liberado');
        }
      });
      
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Limpiar el temporizador
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Grabación cancelada",
        description: "La grabación ha sido cancelada"
      });
    }
  }, [isRecording, toast]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convertir blob a base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remover el prefijo "data:audio/webm;base64,"
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Enviar al endpoint de Supabase
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audio: base64Audio,
          prompt: selectedPrompt || ""
        },
      });

      if (error) {
        throw new Error(error.message || 'Error al procesar el audio');
      }

      if (data.soapNote) {
        onTranscriptionComplete(data.soapNote);
        toast({
          title: "Transcripción completada",
          description: "La nota SOAP ha sido generada exitosamente"
        });
      } else {
        throw new Error('No se recibió nota SOAP válida');
      }

    } catch (error) {
      console.error('Error al procesar audio:', error);
      toast({
        title: "Error de procesamiento",
        description: "No se pudo procesar el audio. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isPaused,
    isProcessing,
    recordingTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  };
};