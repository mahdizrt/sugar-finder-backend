const getChatIdFromMessage = (message: string) => {
  return message
    .slice(message.indexOf("👤") + 2, message.indexOf("-", 1))
    .trim();
};

export { getChatIdFromMessage };
