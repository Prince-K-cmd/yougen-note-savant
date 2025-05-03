
import { Chat, Message } from "@/types/chat";
import { v4 as uuid } from "uuid";

// Chat functions
export const saveChat = (resourceId: string, title: string): string => {
  try {
    const chatId = uuid();
    const chats = getAllChats();

    const existingChat = chats.find((chat) => chat.resourceId === resourceId);
    
    if (existingChat) {
      return existingChat.id;
    }

    const newChat: Chat = {
      id: chatId,
      resourceId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    chats.push(newChat);
    localStorage.setItem("yougen_chats", JSON.stringify(chats));
    
    return chatId;
  } catch (error) {
    console.error("Error saving chat:", error);
    return "";
  }
};

export const addChatMessage = (
  chatId: string,
  message: Message
): void => {
  try {
    const chats = getAllChats();
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex >= 0) {
      chats[chatIndex].messages.push(message);
      chats[chatIndex].updatedAt = Date.now();
      localStorage.setItem("yougen_chats", JSON.stringify(chats));
    }
  } catch (error) {
    console.error("Error adding chat message:", error);
  }
};

export const getChatById = (chatId: string): Chat | null => {
  try {
    const chats = getAllChats();
    return chats.find((chat) => chat.id === chatId) || null;
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    return null;
  }
};

export const getChatByResourceId = (resourceId: string): Chat | null => {
  try {
    const chats = getAllChats();
    return chats.find((chat) => chat.resourceId === resourceId) || null;
  } catch (error) {
    console.error("Error getting chat by resource ID:", error);
    return null;
  }
};

export const getChatsByResourceId = (resourceId: string): Chat[] => {
  try {
    const chats = getAllChats();
    return chats.filter((chat) => chat.resourceId === resourceId);
  } catch (error) {
    console.error("Error getting chats by resource ID:", error);
    return [];
  }
};

export const getAllChats = (): Chat[] => {
  try {
    const chats = localStorage.getItem("yougen_chats");
    return chats ? JSON.parse(chats) : [];
  } catch (error) {
    console.error("Error getting all chats:", error);
    return [];
  }
};
