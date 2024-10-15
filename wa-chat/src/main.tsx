import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RagExperiment from './App.tsx'
import RagComparison from './RAG-Comparison.tsx'
import './index.css'
import ChatView from './ChatPage.tsx';


const Main = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatView/>} />
        <Route path="/compare" element={<RagComparison/>} />
        <Route path="/experiment" element={<RagExperiment/>} />
        <Route path="/chat" element={<ChatView/>} />
      </Routes>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Main />
);
