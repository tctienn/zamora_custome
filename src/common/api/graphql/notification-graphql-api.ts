import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { NOTIFICATION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getNotificationGraphql(pageable: object) {
  return useLazyQuery(
    gql`
        query ($pageable: Pageable) {
            notifications(pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        userId
                        title
                        content
                        time
                        module
                        function
                        read
                        new
                        fromUserId
                    }

                }
            }
        }
    `,
    { pageable },
    {
      clientId: NOTIFICATION_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function markAllAsReadGraphql() {
  return useMutation(
    gql`
        mutation {
            markAllAsRead
        }
    `, { clientId: NOTIFICATION_CLIENT_ID });
}

function markAsRead() {
  return useMutation(
    gql`
        mutation ($id: String!) {
            markAsRead(id: $id)
        }
    `,
    { clientId: NOTIFICATION_CLIENT_ID });
}

function deleteNotificationGraphql() {
  return useMutation(
    gql`
        mutation ($id: String!) {
            deleteNotification(id: $id)
        }
    `,
    { clientId: NOTIFICATION_CLIENT_ID });
}

export {
  deleteNotificationGraphql,
  getNotificationGraphql,
  markAllAsReadGraphql,
  markAsRead
};
