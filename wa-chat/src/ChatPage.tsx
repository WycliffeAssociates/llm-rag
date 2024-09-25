import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';
import Markdown from 'react-markdown'

interface Message {
  text: string;
  sender: 'user' | 'system';
  timestamp: string;  // You could add other fields as needed
}

const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hi there! How can I help you?', sender: 'system', timestamp: '10:01 AM' },
  ]);
  const [inputMessage, setInputValue] = useState('');


  const handleSend = (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    if (inputMessage.trim() !== '') {
      setInputValue(''); // clear input after sending

      const newUserMessage: Message = {
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([...messages, newUserMessage]);

      fetch(`http://localhost:80/rag?prompt=${encodeURIComponent(inputMessage)}`)
        .then(r => r.json())
        .then(res => {
          const text = res['rag-response'].response
          const newsystemMessage: Message = {
            text: text,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString(),
          };

          // setMessages([...messages, newsystemMessage]);
          setMessages(messages => [...messages, newsystemMessage]);
        });
    }
  };

  return (
    <Container maxWidth='md'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: '98vh'
        }}
      >
        {/* Chat messages */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 1,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  padding: '10px 20px',
                  maxWidth: '60%',
                  backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: message.sender === 'user' ? 8 : 2
                }}
              >
                <Typography variant="body1">
                  {message.sender === 'system' ?
                    <Markdown>{message.text}</Markdown>
                    :
                    <div>{message.text}</div>
                  }
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Input area */}
        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center', // Align items horizontally
            width: '100%' // Ensure the form takes the full width
          }}
        >
          <TextField
            sx={{ flexGrow: 1 }} // Allow the text field to stretch
            value={inputMessage}
            onChange={(e) => setInputValue(e.target.value)}
            label="Type a message"
            variant="outlined"
          />
          <Button type='submit' variant="contained">
            Send
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChatView;
