
export const sendChatMessages = (data: ChatData, logging: boolean = false) => {
    return fetch(`http://localhost:80/message${logging ? '?logging=true' : ''}`, {
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

export const sendWikiMessage = (data: WikiMessage) => {
  return fetch(`http://192.168.144.158:8000/wiki-message`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: 'POST',
      body: JSON.stringify(data)
    })
    .then(res => res.json());
};