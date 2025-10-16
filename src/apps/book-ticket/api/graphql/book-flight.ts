import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { TICKET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchBookFlight(data: { searchInput: object; pageable: object }) {
  return useQuery(
    gql`
      query SearchBookingFlight($searchInput: SearchBookingFlightInput, $pageable: Pageable) {
        searchBookingFlight(searchBookingFlightInput: $searchInput, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            requestNumber
            createdDate
            officerId
            goldenLotusCode
            workContentId
            workContentCode
            workContentContent
            flightType
            cityId
            cityName
            flightDate
            departureAirportId
            departureAirportName
            airportToDepartureId
            airportToDepartureName
            returnFlightDate
            airportDepartureReturnId
            airportDepartureReturnName
            airportToReturnId
            airportToReturnName
            requestType
            departureTime
            outboundFlightNumber
            airlineDepartureId
            airlineDepartureName
            returnFlightTime
            returnFlightNumber
            airlineReturnId
            airlineReturnName
            flightScheduleDescription
            status
            createdBy
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

function getCountAllBookingFlightStatus() {
  return useQuery(
    gql`
      query GetCountAllBookingFlightStatus {
        getCountAllBookingFlightStatus {
            all
            draft
            waitingForApproval
            approved
            completed
        }
    }
    `,
    {},
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getBookFlightById(id: string) {
  return useQuery(
    gql`
      query GetDetailBookingFlightById($id: String!) {
        getDetailBookingFlightById(id: $id) {
            id
            requestNumber
            createdDate
            officerId
            officerName
            officerDepartmentName
            goldenLotusCode
            workContentId
            workContentCode
            workContentContent
            flightType
            cityId
            cityName
            flightDate
            departureAirportId
            departureAirportName
            airportToDepartureId
            airportToDepartureName
            returnFlightDate
            airportDepartureReturnId
            airportDepartureReturnName
            airportToReturnId
            airportToReturnName
            requestType
            departureTime
            outboundFlightNumber
            airlineDepartureId
            airlineDepartureName
            returnFlightTime
            returnFlightNumber
            airlineReturnId
            airlineReturnName
            flightScheduleDescription
            attachments {
                id
                quote
                attachment
                size
                downloadPath
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

function deleteBookFlight() {
  return useMutation(
    gql`
        mutation deleteBookingFlight($id: String!) {
            deleteBookingFlight(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteBookingFlightAttachment() {
  return useMutation(
    gql`
        mutation DeleteBookingFlightAttachment($id: String!) {
            deleteBookingFlightAttachment(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteBookFlight,
  deleteBookingFlightAttachment,
  getBookFlightById,
  getCountAllBookingFlightStatus,
  searchBookFlight
};
