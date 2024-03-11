import { config } from "common-values";
import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import ThirdPartyPasswordless from "supertokens-node/recipe/thirdpartypasswordless";

const stConfig = {
  framework: "express",
  supertokens: {
    connectionURI: config.supertokens.url as string,
    apiKey: undefined,
  },
  appInfo: {
    // learn more about this on https://supertokens.com/docs/session/appinfo
    appName: "omnitemplate",
    apiDomain: config.gateway.url as string,
    websiteDomain: config.frontend.url as string,
    // apiBasePath: "/auth",
    websiteBasePath: "/",
  },
  recipeList: [
    ThirdPartyPasswordless.init({
      flowType: "USER_INPUT_CODE",
      contactMethod: "EMAIL",
      /*TODO: See next steps for third party provider setup */
      providers: [
        {
          config: {
            thirdPartyId: "google",
            clients: [
              {
                clientId: config.supertokens.googleClientId as string,
                clientSecret: config.supertokens.googleClientSecret as string,
              },
            ],
          },
        },
        {
          config: {
            thirdPartyId: "github",
            clients: [
              {
                clientId: config.supertokens.githubClientId as string,
                clientSecret: config.supertokens.githubClientSecret as string,
              },
            ],
          },
        },
      ],
    }),
    Session.init(), // initializes session features
  ],
};

// console.log(stConfig);

try {
  supertokens.init(stConfig as any);
} catch {
  console.log("supertokens init fail");
}
