import _ from "lodash";

import { chatIdConvertor } from "./chatIdConvertor";
import { messages } from "../nouns";

const messageTemplate = `
    👤 <%- code %>
    ${messages.MESSAGE_RECEIVED_FROM_USER}: 
    ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ ⬇️
    <%- message %>
    ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ ⬆️

    ${messages.MESSAGE_REPLY_TO_USER}
`;

const messageCompiled = _.template(messageTemplate);

const createMessage = (messageObj: any) => {
  const message = messageCompiled({
    code: chatIdConvertor.toString(messageObj?.code),
    message: messageObj?.text,
  });
  return message;
};

export { messageTemplate, createMessage };
