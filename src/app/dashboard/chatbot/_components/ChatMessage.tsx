import { UserMessage } from './UserMessage';
import { BotMessage } from './BotMessage';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ message }: { message: Message }) => {
  if (message.role === 'user') {
    return <UserMessage content={message.content} />;
  }
  return <BotMessage content={message.content} />;
};