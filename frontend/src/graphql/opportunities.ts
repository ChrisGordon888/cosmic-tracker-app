import { gql } from '@apollo/client';

export interface Opportunity {
  id: string;
  title: string;
  desiredOutcome: string;
  context: string;
  traction: 'exploring' | 'interest-expressed' | 'next-step-agreed';
  status: 'open' | 'achieved' | 'closed';
  releaseWorldId: string | null;
  nextAction: string;
  followUpOn: string | null;
  createdAt: string;
  updatedAt: string;
  results: { id: string; action: string; note: string; classification: string; recordedAt: string }[];
}

const FIELDS = gql`
  fragment OpportunityFields on Opportunity {
    id title desiredOutcome context traction status releaseWorldId
    nextAction followUpOn createdAt updatedAt
    results { id action note classification recordedAt }
  }
`;
export const MY_OPPORTUNITIES = gql`
  ${FIELDS}
  query MyOpportunities { myOpportunities { ...OpportunityFields } }
`;
export const CREATE_OPPORTUNITY = gql`
  ${FIELDS}
  mutation CreateOpportunity($input: OpportunityInput!) {
    createOpportunity(input: $input) { ...OpportunityFields }
  }
`;
export const UPDATE_OPPORTUNITY = gql`
  ${FIELDS}
  mutation UpdateOpportunity($id: ID!, $input: OpportunityInput!, $expectedUpdatedAt: String!) {
    updateOpportunity(id: $id, input: $input, expectedUpdatedAt: $expectedUpdatedAt) { ...OpportunityFields }
  }
`;
export const RECORD_OPPORTUNITY_RESULT = gql`
  ${FIELDS}
  mutation RecordOpportunityResult($id: ID!, $input: OpportunityResultInput!, $expectedUpdatedAt: String!) {
    recordOpportunityResult(id: $id, input: $input, expectedUpdatedAt: $expectedUpdatedAt) { ...OpportunityFields }
  }
`;
