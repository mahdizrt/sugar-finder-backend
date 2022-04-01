import * as dotenv from "dotenv";
import _ from "lodash";

import { getState } from "../store";
import { nouns, messages } from "../nouns";

dotenv.config();

const DEV = process.env.NODE_ENV === "development";

const template = `
    📝 ${nouns.SPECIFICATIONS}: #<%- type %>

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

    ${messages.FORM_DESC}

    [${nouns.LINK_CHAT}](https://telegram.me/${
  DEV ? "sugar_finder_staging_bot" : "sugar_yab_bot"
}?start=<%- code %>)

    💢 ${messages.DESCRIPTION2}
    ${DEV ? "@sugar_finder_staging_bot" : "@sugar_yab_bot"}
`;

const formCompiled = _.template(template);

const createForm = (formObj?: any) => {
  const formData = formObj || getState().form;

  return formCompiled({
    ...formData,
  });
};

export { template, formCompiled, createForm };
