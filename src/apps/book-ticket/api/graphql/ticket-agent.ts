import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { TICKET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchTicketAgentByKeyword(data: { searchInput: object; pageable: object }) {
  return useQuery(
    gql`
      query SearchTicketAgent($searchInput: SearchInput, $pageable: Pageable) {
        searchTicketAgent(searchInput: $searchInput, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            code
            name
            address
            taxCode
            phone
            email
            note
            status
            createdBy
            createdTime
            ticketAgentContact {
              ticketAgentContactId
              ticketAgentContactName
              ticketAgentContactEmail
              ticketAgentContactPhone
            }
          }
        }
      }
    `,
    { ...data },
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function maxNOrder() {
  return useQuery(
    gql`
        query maxNOrderVehicle {
            maxNOrderVehicle
        }
    `,
    {},
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getTicketAgentById(id: string) {
  return useQuery(
    gql`
      query GetDetailTicketById($id: String!) {
        getDetailTicketById(id: $id) {
          id
          code
          name
          address
          taxCode
          phone
          email
          note
          status
          createdBy
          createdTime
          ticketAgentContact {
            ticketAgentContactId
            ticketAgentContactName
            ticketAgentContactEmail
            ticketAgentContactPhone
          }
        }
      }
    `,
    { id },
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function deleteTicketAgent() {
  return useMutation(
    gql`
        mutation deleteTicketAgent($id: String!) {
            deleteTicketAgent(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveTicketAgent() {
  return useMutation(
    gql`
      mutation SaveTicketAgent($input: SaveTicketAgentReq) {
        saveTicketAgent(saveTicketAgentReq: $input)
      }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteTicketAgent,
  getTicketAgentById,
  maxNOrder,
  saveTicketAgent,
  searchTicketAgentByKeyword
};
