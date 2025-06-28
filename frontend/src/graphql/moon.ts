import { gql } from "@apollo/client";

export const GET_MOON_PHASE = gql`
  query {
    todayMoonPhase
  }
`;