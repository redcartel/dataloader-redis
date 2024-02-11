import axios from "axios";
import { getApiDomain } from "../config";
import { Client, cacheExchange, fetchExchange, useQuery } from "urql";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useEffect } from "react";

export default function CallAPIView() {
  const [result, reexecuteQuery] = useQuery({
    query: `query MeQuery { 
            me { 
                email
                id 
            }
        }`,
  });

  useEffect(() => {
    console.log(result.data);
  }, [result]);

  async function callAPIClicked() {
    reexecuteQuery();
  }

  return (
    <>
      <div>{result.data?.me?.token}</div>
      <div onClick={callAPIClicked} className="sessionButton">
        Call API
      </div>
    </>
  );
}
