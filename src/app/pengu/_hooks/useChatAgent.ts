"use client";

import { useState } from "react";
import { PGlite } from "@electric-sql/pglite";
import Groq from "groq-sdk";

// --- Types ---
export type Message = {
  conversation_id: number;
  role: "user" | "assistant" | "system";
  content: string;
};

export type Conversation = {
  id: number;
  title: string;
  system_prompt: string;
};

let dbInstance: PGlite | null = null;

async function getDB() {
  if (!dbInstance) dbInstance = new PGlite("idb://pengu-chat-db");
  return dbInstance;
}

async function initDB() {
  const db = await getDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      title TEXT,
      system_prompt TEXT DEFAULT 'You are a helpful assistant.',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS chat_history (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function useChatAgent(apiKey: string, selectedModel: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- INIT ---
  const init = async () => {
    await initDB();
    const db = await getDB();
    const res = await db.query("SELECT * FROM conversations ORDER BY created_at DESC");
    setConversations(res.rows as Conversation[]);
    if (res.rows.length > 0) {
      setCurrentConvId((res.rows as Conversation[])[0].id);
    }
  };

  // --- LOAD MESSAGES ---
  const loadMessages = async (convId: number) => {
    const db = await getDB();
    const res = await db.query(
      "SELECT role, content FROM chat_history WHERE conversation_id = $1 ORDER BY created_at ASC",
      [convId]
    );
    setMessages(res.rows as Message[]);
  };

  // --- NEW CHAT ---
  const createConversation = async () => {
    const db = await getDB();
    const res = await db.query(
      "INSERT INTO conversations (title) VALUES ($1) RETURNING *",
      ["Cuộc trò chuyện mới"]
    );

    const newConv = (res.rows as Conversation[])[0];
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConvId(newConv.id);
    setMessages([]);
  };

  // --- DELETE ---
  const deleteConversation = async (id: number) => {
    const db = await getDB();
    await db.query("DELETE FROM chat_history WHERE conversation_id = $1", [id]);
    await db.query("DELETE FROM conversations WHERE id = $1", [id]);

    const res = await db.query("SELECT * FROM conversations ORDER BY created_at DESC");
    const updated = res.rows as Conversation[];

    setConversations(updated);

    if (currentConvId === id) {
      setCurrentConvId(updated[0]?.id || null);
      setMessages([]);
    }
  };

  // --- SEND MESSAGE ---
  const sendMessage = async (
    input: string,
    systemPrompt: string
  ) => {
    if (!input.trim() || !apiKey) return;

    const db = await getDB();
    setIsLoading(true);

    try {
      const groq = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      let activeId = currentConvId;

      if (!activeId) {
        const res = await db.query(
          "INSERT INTO conversations (title) VALUES ($1) RETURNING *",
          ["Chat"]
        );
        const newConv = (res.rows as Conversation[])[0];
        activeId = newConv.id;

        setCurrentConvId(activeId);
        setConversations((prev) => [newConv, ...prev]);
      }

      // Save user message
      await db.query(
        "INSERT INTO chat_history (conversation_id, role, content) VALUES ($1,$2,$3)",
        [activeId, "user", input]
      );

      const updatedMessages = [
        ...messages,
        { conversation_id: activeId, role: "user", content: input },
      ] as Message[];

      setMessages(updatedMessages);

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...updatedMessages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const completion = await groq.chat.completions.create({
        messages: apiMessages as any,
        model: selectedModel,
      });

      const aiText = completion.choices[0]?.message?.content || "";

      await db.query(
        "INSERT INTO chat_history (conversation_id, role, content) VALUES ($1,$2,$3)",
        [activeId, "assistant", aiText]
      );

      setMessages((prev) => [
        ...prev,
        { conversation_id: activeId!, role: "assistant", content: aiText },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    conversations,
    currentConvId,
    setCurrentConvId,
    isLoading,

    init,
    loadMessages,
    createConversation,
    deleteConversation,
    sendMessage,
  };
}