import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WIDGET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const noteColumns = [
  'id',
  'type',
  'subjectId',
  'creatorId',
  'creator',
  'createdAt',
  'title',
  'content',
  'pinned',
  'isDeleted',
  'subjectName'
];

function getSubjectNotesGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], limit: number | null }) {
  return useQuery(
    gql`
            query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                subjectNotes(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getSubjectNotesPageGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], limit: number | null }) {
  return useQuery(
    gql`
          query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $limit: Int) {
              subjectNotesPage(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, limit: $limit) {
                  content {
                      ${noteColumns.join(' ')}
                  }
                  totalPages
                  totalElements
              }
          }
      `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getNotesGraphql(data: { isDeleted: boolean, types: string[], limit: number | null }) {
  return useQuery(
    gql`
            query( $isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                notes(isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function countNotesGraphql(data: { isDeleted: boolean, types: string[] }) {
  return useQuery(
    gql`
          query( $isDeleted: Boolean!, $types: [String]! ) {
              countNotes(isDeleted: $isDeleted, types: $types ) {
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

function getNoteGraphql(noteId: string) {
  return useQuery(
    gql`
            query($noteId: String!) {
                note(noteId: $noteId) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { noteId },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getSubjectNotesLazyGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], limit: number | null }) {
  return useLazyQuery(
    gql`
            query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                subjectNotes(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getNotesLazyGraphql(data: { isDeleted: boolean, types: string[], limit?: number | null }) {
  return useLazyQuery(
    gql`
            query($isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                notes( isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function saveNoteGraphql() {
  return useMutation(
    gql`
            mutation($note: NoteInput!) {
                saveNote(note: $note) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

function pinNoteGraphql() {
  return useMutation(
    gql`
            mutation ($noteId: String!) {
                pinNote(noteId: $noteId) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { clientId: WIDGET_CLIENT_ID }
  );
}

function unpinNoteGraphql() {
  return useMutation(
    gql`
            mutation ($noteId: String!) {
                unpinNote(noteId: $noteId) {
                    ${noteColumns.join(' ')}
                }
            }
        `, { clientId: WIDGET_CLIENT_ID }
  );
}

function deleteNoteGraphql() {
  return useMutation(
    gql`
            mutation($noteId: String!) {
                deleteNote(noteId: $noteId) {
                    id
                }
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

function restoreNoteGraphql() {
  return useMutation(
    gql`
            mutation($noteId: String!) {
                restoreNote(noteId: $noteId) {
                    id
                }
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

function removeNoteGraphql() {
  return useMutation(
    gql`
            mutation($noteId: String!) {
                removeNote(noteId: $noteId)
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

export {
  countNotesGraphql,
  deleteNoteGraphql,
  getNoteGraphql,
  getNotesGraphql,
  getNotesLazyGraphql,
  getSubjectNotesGraphql,
  getSubjectNotesLazyGraphql,
  getSubjectNotesPageGraphql,
  pinNoteGraphql,
  removeNoteGraphql,
  restoreNoteGraphql,
  saveNoteGraphql,
  unpinNoteGraphql
};