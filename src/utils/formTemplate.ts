import * as dotenv from "dotenv";
import _ from "lodash";

import { getState } from "../store";
import { nouns, messages } from "../nouns";

dotenv.config();

const DEV = process.env.NODE_ENV === "development";

const template = `
    π ${nouns.SPECIFICATIONS}: #<%- type %>

    π ${nouns.NAME}: <%- name %>

    πΊπΉ ${nouns.GANDER}: <%- gender %>

    βͺοΈ ${nouns.AGE}: <%- age %>

    π ${nouns.EDUCATION}: <%- education %>

    π  ${nouns.JOB}: <%- job %>

    π° ${nouns.EARNINGS_PER_MONTH}: <%- salary %>

    π’ ${nouns.HEIGHT}: <%- height %>

    π£ ${nouns.WEIGHT}: <%- weight %>

    π ${nouns.CITY}: <%- location %>

    π ${nouns.CONDITIONS}: <%- conditions %>

    ${messages.FORM_DESC}

    [${nouns.LINK_CHAT}](https://telegram.me/${
  DEV ? "sugar_finder_staging_bot" : "sugar_yab_bot"
}?start=<%- code %>)

    π’ ${messages.DESCRIPTION2}

    [${
      DEV ? "@sugar_finder_staging_bot" : "@sugar_yab_bot"
    }](https://telegram.me/${DEV ? "sugar_finder_staging_bot" : "sugar_yab_bot"}
`;

const formCompiled = _.template(template);

const createForm = (formObj?: any) => {
  const formData = formObj || getState().form;

  return formCompiled({
    ...formData,
  });
};

export { template, formCompiled, createForm };
