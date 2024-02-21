import React, { useEffect } from "react";
import { gql, useLazyQuery, useQuery } from "@apollo/client";

const now = new Date().toISOString();

export function LoggedOutHome() {
  const { data, error, loading, refetch } = useQuery(
    gql`
      query FrontPagePosts($input: PostsInput = {}) {
        posts(input: $input) {
          posts {
            body
          }
          cursor
        }
      }
    `,
    {
      variables: {
        input: {
          cursor: new Date().toTimeString(),
        },
      },
    },
  );

  console.log("render");
  console.log(data);
  console.log(loading);
  console.log(error);

  return (
    <div>
      <div>loading {loading} </div>
      <div>error {JSON.stringify(error)}</div>
      <div>data {JSON.stringify(data)}</div>
    </div>
  );
}
