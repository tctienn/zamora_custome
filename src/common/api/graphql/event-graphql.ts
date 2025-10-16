import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WIDGET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const userColumn = [
  'id',
  'username',
  'email',
  'fullName',
  'avatar',
];

const eventColumns = [
  'id',
  'name',
  'type',
  'subjectId',
  'date',
  'fromAt',
  'toAt',
  'isAllDay',
  'repeat',
  'host',
  'participatingDepartments',
  'participants',
  'location',
  'isApproved',
  'description',
  'remind',
  'isDeleted',
  'subjectName',
  'attachments',
];

function getSubjectEventsGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], fromDate: string | null, toDate: string | null, pageable: object | null }) {
  return useQuery(
    gql`
          query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $fromDate: Date, $toDate: Date, $pageable: Pageable!) {
              subjectEvents(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, fromDate: $fromDate, toDate: $toDate, pageable: $pageable) {
                  totalCount
                  edges{
                      node{
                          ${eventColumns.join(' ')}
                      }
                  }
              }
          }
      `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getEventsGraphql(data: { isDeleted: boolean, types: string[], fromDate: string | null, toDate: string | null, limit: number | null }) {
  return useQuery(
    gql`
          query($isDeleted: Boolean!, $types: [String]!, $fromDate: Date, $toDate: Date, $limit: Int) {
              events(isDeleted: $isDeleted, types: $types, fromDate: $fromDate, toDate: $toDate, limit: $limit) {
                  ${eventColumns.join(' ')}
              }
          }
      `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function countEventsGraphql(data: { isDeleted: boolean, types: string[], fromDate: string | null, toDate: string | null }) {
  return useQuery(
    gql`
          query($isDeleted: Boolean!, $types: [String]!, $fromDate: Date, $toDate: Date) {
              countEvents(isDeleted: $isDeleted, types: $types, fromDate: $fromDate, toDate: $toDate) {
                  type
                  count
              }
          }
      `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getEventGraphql(eventId: string) {
  return useQuery(
    gql`
          query($eventId: String!) {
              event(eventId: $eventId) {
                  ${eventColumns.join(' ')}
              }
          }
      `, { eventId },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getSubjectEventsLazyGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], fromDate: string | null, toDate: string | null, pageable: object | null }) {
  return useLazyQuery(
    gql`
          query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $fromDate: Date, $toDate: Date, $pageable: Pageable!) {
              subjectEvents(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, fromDate: $fromDate, toDate: $toDate, pageable: $pageable) {
                  totalCount
                  edges{
                      node{
                          ${eventColumns.join(' ')}
                      }
                  }
              }
          }
      `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getEventsLazyGraphql(data: { isDeleted: boolean, types: string[], fromDate: string | null, toDate: string | null, limit: number | null }) {
  return useLazyQuery(
    gql`
          query($isDeleted: Boolean!, $types: [String]!, $fromDate: Date, $toDate: Date, $limit: Int) {
              events(isDeleted: $isDeleted, types: $types, fromDate: $fromDate, toDate: $toDate, limit: $limit) {
                  ${eventColumns.join(' ')}
              }
          }
      `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function saveEventGraphql() {
  return useMutation(
    gql`
          mutation($event: EventInput!, $attachments: [Upload]) {
              saveEventWidget(event: $event, attachments: $attachments) {
                  ${eventColumns.join(' ')}
              }
          }
      `, {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function deleteEventGraphql() {
  return useMutation(
    gql`
          mutation($eventId: String!) {
              deleteEvent(eventId: $eventId) {
                  id
              }
          }
      `, { clientId: WIDGET_CLIENT_ID });
}

function restoreEventGraphql() {
  return useMutation(
    gql`
          mutation($eventId: String!) {
              restoreEvent(eventId: $eventId) {
                  id
              }
          }
      `, { clientId: WIDGET_CLIENT_ID });
}

function removeEventGraphql() {
  return useMutation(
    gql`
          mutation($eventId: String!) {
              removeEvent(eventId: $eventId)
          }
      `, { clientId: WIDGET_CLIENT_ID });
}

export {
  countEventsGraphql,
  deleteEventGraphql,
  getEventGraphql,
  getEventsGraphql,
  getEventsLazyGraphql,
  getSubjectEventsGraphql,
  getSubjectEventsLazyGraphql,
  removeEventGraphql,
  restoreEventGraphql,
  saveEventGraphql
};