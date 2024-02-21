import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

export default function CallAPIView() {
  const {error, loading, data, refetch} = useQuery(gql`
      query MeQuery {
        me {
          email
          id
        }
      }
    `);

  useEffect(() => {
    console.log(data);
  }, [data]);

  async function callAPIClicked() {
    refetch();
  }

  return (
    <>
      <div>Token: {data?.me?.token}</div>
      <div onClick={callAPIClicked} className="sessionButton">
        Call API
      </div>
    </>
  );
}
