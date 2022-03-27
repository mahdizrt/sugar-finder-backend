import _ from "lodash";

import { getState } from "../store";
import { nouns, messages } from "../nouns";

const template = `
    📝 ${nouns.SPECIFICATIONS}: #<%- type %>

    🆔 ${nouns.CODE}: ${"`<%- code %>`"}

    📛 ${nouns.NAME}: <%- name %>

    🚺🚹 ${nouns.GANDER}: <%- gender %>

    ⚪️ ${nouns.AGE}: <%- age %>

    📘 ${nouns.EDUCATION}: <%- education %>

    🟠 ${nouns.JOB}: <%- job %>

    💰 ${nouns.EARNINGS_PER_MONTH}: <%- salary %>

    🟢 ${nouns.HEIGHT}: <%- height %>

    🟣 ${nouns.WEIGHT}: <%- weight %>

    🏘 ${nouns.CITY}: <%- location %>

    🔅 ${nouns.CONDITIONS}: <%- conditions %>

    💢 ${messages.DESCRIPTION1}

    💢 ${messages.DESCRIPTION2}
`;

const formCompiled = _.template(template);

const createForm = (formObj?: any) => {
  const formData = formObj || getState().form;

  const form = formCompiled({
    ...formData,
  });
  return form;
};

export { template, formCompiled, createForm };
