import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';
import Markdown from 'react-markdown'
import AudioRecorder from './AudioRecorder';
import { getFollowUpQuestions, sendChatMessages } from './Api';

const ChatView = () => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hi there! How can I help you?', sender: 'system', timestamp: '10:01 AM' },
  ]);
  const [inputMessage, setInputValue] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [summary, setSummary] = useState<string[]>([]);

  const sendMessages = (userQuery: string) => {
    let latestResponse = messages[messages.length - 1].text;
    if (messages.length === 1) {
      latestResponse = "";
    }
    const chatData: ChatData = {
      chat: summary,
      lastResponse: latestResponse,
      userQuery: inputMessage
    };

    sendChatMessages(chatData)
    .then(res => {
      setSummary(res['chat-summary']);
      const responseText = res['rag-response'];

      const newsystemMessage: Message = {
        text: responseText,
        sender: 'system',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(messages => [...messages, newsystemMessage]);

      return getFollowUpQuestions(userQuery, responseText);
    })
    .then(res => res.json())
    .then(data => {
      const followUpQuestions = Array.from<string>(data)
      setSuggestedPrompts(followUpQuestions);
    });
  };

  const handleSend = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const userQuery = inputMessage;

    if (userQuery.trim() !== '') {
      setInputValue(''); // clear input after sending
      setSuggestedPrompts([]);

      const newUserMessage: Message = {
        text: userQuery,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([...messages, newUserMessage]);

      return sendMessages(userQuery);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                marginBottom: 2,
                marginTop: 2
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
                    <span>{message.text}</span>
                  }
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef}></div>
        </Box>
        {/* Suggested prompts section */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap', // Allow the prompts to wrap if they overflow
            gap: 1,
            marginBottom: 2, // Add spacing between prompts and input area
          }}
        >
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => setInputValue(prompt)}
              sx={{ textTransform: 'none' }} // Prevent button text from being uppercase
            >
              {prompt}
            </Button>
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
          <AudioRecorder setUserPrompt={setInputValue} />
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
        <Box><Typography variant="body2" color="textSecondary" sx={{ paddingTop: '10px', textAlign: 'center', fontStyle: 'italic' }}>This chat is recorded for research and development purposes only.</Typography></Box>
      </Box>
    </Container>
  );
};

export default ChatView;
