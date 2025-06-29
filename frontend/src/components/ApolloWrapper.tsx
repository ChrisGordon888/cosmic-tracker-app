// src/components/ApolloWrapper.tsx
"use client";

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useSession } from "next-auth/react";

const ApolloWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();

  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  });

  const authLink = setContext((_, { headers }) => {
    const token = session?.accessToken;
    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloWrapper;