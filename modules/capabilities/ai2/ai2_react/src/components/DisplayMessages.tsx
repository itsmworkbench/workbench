import React from 'react';
import MessageItem, { Message } from './MessageItem';

type DisplayMessagesProps = {
    messages: Message[];
};

const DisplayMessages: React.FC<DisplayMessagesProps> = ({ messages }) => {
    return (
        <>
            {messages.map((msg, idx) => (
                <MessageItem key={idx} message={msg} />
            ))}
        </>
    );
};

export default DisplayMessages;
