import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { ChatIcon, CloseIcon } from '@chakra-ui/icons';
import { http } from '../../config/http';
import { unwrap } from '../../config/api';
import { useUser } from '../../context/UserContext';
import './AIChatBox.css';

const AIChatBox = () => {
  const { currentUser } = useUser();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadInbox = async () => {
    if (!currentUser?.id) {
      return;
    }
    try {
      const response = await http.get('/ai/chat', { params: { user_id: currentUser.id } });
      const data = unwrap(response);
      setConversationId(data?.conversation?.id || '');
      setMessages(data?.messages || []);
    } catch (error) {
      console.error('Error loading AI inbox:', error);
    }
  };

  useEffect(() => {
    if (open) {
      loadInbox();
    }
  }, [open, currentUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending || !currentUser?.id) {
      return;
    }
    setSending(true);
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: 'user', content },
    ]);
    try {
      const response = await http.post('/ai/chat', {
        user_id: currentUser.id,
        conversation_id: conversationId,
        message: content,
      });
      const data = unwrap(response);
      setConversationId(data?.conversation?.id || conversationId);
      setMessages((prev) => {
        const withoutLocal = prev.filter((item) => !String(item.id).startsWith('local-'));
        const next = [...withoutLocal];
        if (data?.user_message) {
          next.push(data.user_message);
        }
        if (data?.assistant) {
          next.push(data.assistant);
        }
        return next;
      });
    } catch (error) {
      console.error('Error sending AI message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'The assistant is unavailable right now. Start the backend and try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    try {
      await http.delete(`/ai/conversations/${conversationId}`, {
        params: { user_id: currentUser.id },
      });
      setConversationId('');
      setMessages([]);
    } catch (error) {
      console.error('Error clearing AI chat:', error);
    }
  };

  if (!currentUser?.id) {
    return null;
  }

  return (
    <Box className="ai-chatbox">
      {open && (
        <Box className="ai-chatbox-panel">
          <Box className="ai-chatbox-header">
            <Text fontWeight="bold">AI assistant</Text>
            <Box>
              <IconButton
                aria-label="Clear chat"
                size="xs"
                variant="ghost"
                color="white"
                mr={1}
                onClick={clearChat}
                icon={<Text fontSize="xs">Clear</Text>}
              />
              <IconButton
                aria-label="Close AI chat"
                size="xs"
                variant="ghost"
                color="white"
                icon={<CloseIcon boxSize={2.5} />}
                onClick={() => setOpen(false)}
              />
            </Box>
          </Box>
          <VStack className="ai-chatbox-messages" align="stretch" spacing={2}>
            {messages.length === 0 && (
              <Text fontSize="sm" color="gray.500">
                Ask about friends, posts, notifications, or the slot game.
              </Text>
            )}
            {messages.map((message) => (
              <Box
                key={message.id}
                className={message.role === 'user' ? 'ai-chatbox-bubble you' : 'ai-chatbox-bubble bot'}
              >
                {message.content}
              </Box>
            ))}
            {sending && <Text fontSize="xs" color="gray.500">Thinking...</Text>}
            <div ref={bottomRef} />
          </VStack>
          <Box className="ai-chatbox-input">
            <Input
              size="sm"
              placeholder="Type a message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <IconButton
              aria-label="Send"
              size="sm"
              colorScheme="blue"
              ml={2}
              isDisabled={sending || !input.trim()}
              onClick={sendMessage}
              icon={<ChatIcon />}
            />
          </Box>
        </Box>
      )}
      <IconButton
        className="ai-chatbox-toggle"
        aria-label="Open AI chat"
        colorScheme="blue"
        rounded="full"
        size="lg"
        icon={<ChatIcon />}
        onClick={() => setOpen((value) => !value)}
      />
    </Box>
  );
};

export default AIChatBox;
