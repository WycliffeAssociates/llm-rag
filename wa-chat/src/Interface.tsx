interface Message {
    text: string;
    sender: 'user' | 'system';
    timestamp: string;  // You could add other fields as needed
}

interface ChatData {
    chat: string[];
    lastResponse: string;
    userQuery: string;
};
