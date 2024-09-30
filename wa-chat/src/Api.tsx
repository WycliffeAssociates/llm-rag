
export const sendChatMessages = (data: ChatData) => {
    return fetch(`http://localhost:80/message`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(res => res.json());
};