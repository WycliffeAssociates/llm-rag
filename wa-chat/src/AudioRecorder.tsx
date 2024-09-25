import React, { useState, useRef } from "react";
import { Button }  from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

function AudioRecorder({ setUserPrompt }: { setUserPrompt: React.Dispatch<React.SetStateAction<string>>}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        await sendAudioToServer(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://localhost:80/upload-audio-command', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserPrompt(data['prompt'])
        
        console.log('Audio file uploaded successfully');
      } else {
        console.error('Audio upload failed');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      {isRecording ? (
        <Button onClick={stopRecording}>
          <GraphicEqIcon>Stop</GraphicEqIcon>
        </Button>
      ) : (
        <Button onClick={startRecording}>
          <MicIcon>Start Recording</MicIcon>
        </Button>
      )}
      {/* {audioUrl && (
        <div>
          <h3>Recorded Audio:</h3>
          <audio controls src={audioUrl}></audio>
        </div>
      )} */}
    </div>
  );
}

export default AudioRecorder;
