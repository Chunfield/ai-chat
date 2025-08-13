import { useState, useRef } from 'react';
import type { Message } from '../../../types';
import { API_CONFIGS, type ModelType } from '../config';

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '你好！我是 AI，有什么可以帮你？' },
  ]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const send = async (question: string, model: ModelType) => {
    if (!question.trim() || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    await fetchWithMessages([...messages, userMessage], model);
  };

  const fetchWithMessages = async (currentMessages: Message[], model: ModelType) => {
    const config = API_CONFIGS[model];
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: currentMessages,
          stream: true,
          temperature: 0.7,
          top_p: 1.0,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(await response.text());

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        if (controller.signal.aborted) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content += '\n\n（已停止生成）';
            return updated;
          });
          break;
        }

        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (dataStr === '[DONE]' || !dataStr) continue;
            try {
              const json = JSON.parse(dataStr);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                aiResponse += content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === 'assistant') {
                    last.content = aiResponse;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `错误: ${err.message || '请求失败'}` },
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const regenerate = async (userMessage: Message, model: ModelType) => {
    if (loading || abortControllerRef.current) {
      abortControllerRef.current?.abort();
    }

    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
        updated.pop(); 
      }
      return updated;
    });

    setLoading(true);
    await fetchWithMessages([...messages, userMessage], model);
  };

  const abort = () => {
    abortControllerRef.current?.abort();
  };

  return { messages, loading, send, abort, regenerate };
}
