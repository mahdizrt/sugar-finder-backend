const getChatIdFromMessage = (message: string) => {
  return message
    .slice(message.indexOf("👤") + 2, message.indexOf("\n", 1))
    .trim();
};

export { getChatIdFromMessage };
