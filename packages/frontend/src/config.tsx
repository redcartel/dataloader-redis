import ThirdPartyPasswordless, {
  ThirdpartyPasswordlessComponentsOverrideProvider,
} from "supertokens-auth-react/recipe/thirdpartypasswordless";
import { ThirdPartyPasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/thirdpartypasswordless/prebuiltui";
import Session from "supertokens-auth-react/recipe/session";
import React from "react";

export function getApiDomain() {
  const apiPort = process.env.REACT_APP_API_PORT || 4000;
  const apiUrl =
    process.env.REACT_APP_API_URL || `http://localhost:${apiPort}/auth`;
  return apiUrl;
}

export function getWebsiteDomain() {
  const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
  const websiteUrl =
    process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;
  return websiteUrl;
}

export const SuperTokensConfig = {
  appInfo: {
    appName: "SuperTokens Demo App",
    apiDomain: getApiDomain(),
    websiteDomain: getWebsiteDomain(),
  },
  // recipeList contains all the modules that you want to
  // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
  recipeList: [
    ThirdPartyPasswordless.init({
      signInUpFeature: {
        providers: [
          ThirdPartyPasswordless.Github.init(),
          ThirdPartyPasswordless.Google.init(),
          ThirdPartyPasswordless.Apple.init(),
          ThirdPartyPasswordless.Twitter.init(),
        ],
      },
      contactMethod: "EMAIL_OR_PHONE",
    }),
    Session.init(),
  ],
};

export const recipeDetails = {
  docsLink: "https://supertokens.com/docs/thirdpartypasswordless/introduction",
};

export const PreBuiltUIList = [ThirdPartyPasswordlessPreBuiltUI];

export const ComponentWrapper = (props: {
  children: JSX.Element;
}): JSX.Element => {
  return (
    <ThirdpartyPasswordlessComponentsOverrideProvider
      components={{
        PasswordlessUserInputCodeFormFooter_Override: ({
          DefaultComponent,
          ...props
        }) => {
          const loginAttemptInfo = props.loginAttemptInfo;
          let showQuotaMessage = false;

          if (loginAttemptInfo.contactMethod === "PHONE") {
            showQuotaMessage = true;
          }

          return (
            <div
              style={{
                width: "100%",
              }}
            >
              <DefaultComponent {...props} />
              {showQuotaMessage && (
                <div
                  style={{
                    width: "100%",
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 6,
                    paddingBottom: 6,
                    borderRadius: 4,
                    backgroundColor: "#EF9A9A",
                    margin: 0,
                    boxSizing: "border-box",
                    MozBoxSizing: "border-box",
                    WebkitBoxSizing: "border-box",
                    fontSize: 12,
                    textAlign: "start",
                    fontWeight: "bold",
                    lineHeight: "18px",
                  }}
                >
                  There is a daily quota for the free SMS service, if you do not
                  receive the SMS please try again tomorrow.
                </div>
              )}
            </div>
          );
        },
      }}
    >
      {props.children}
    </ThirdpartyPasswordlessComponentsOverrideProvider>
  );
};
