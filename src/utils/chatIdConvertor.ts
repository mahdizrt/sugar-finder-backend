const chatIdConvertor = {
  toString: (chatId: number) => {
    return chatId.toString(25);
  },
  parse: (chatId: string) => {
    return parseInt(chatId, 25);
  },
};

export { chatIdConvertor };
