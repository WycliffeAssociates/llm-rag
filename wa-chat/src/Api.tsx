
export const sendChatMessages = (data: ChatData) => {
    return fetch(`https://llm-rag-server.walink.org/message`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(res => res.json());
};

export const getFollowUpQuestions = (userQuery: string, responseText: string) => fetch(`https://llm-rag-server.walink.org/follow-up-questions`, {
  headers: {
    "Content-Type": "application/json",
  },
  method: 'POST',
  body: JSON.stringify({ question: userQuery, answer: responseText })
});