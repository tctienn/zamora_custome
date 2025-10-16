import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getWidgetsGraphql() {
  return useQuery(
    gql`
            query {
                widgets {
                    code
                    app
                    recordNumber
                }
            }
        `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getUserWidgetGraphql() {
  return useLazyQuery(
    gql`
            query {
                userWidget {
                    userId
                    mainWidgets {
                        code
                        order
                    }
                    sidebarWidgets {
                        code
                        order
                    }
                }
            }
        `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveUserWidgetGraphql() {
  return useMutation(
    gql`
            mutation($mainWidgetInstances: [WidgetInstanceInput]!, $sidebarWidgetInstances: [WidgetInstanceInput]!) {
                saveUserWidget(mainWidgetInstances: $mainWidgetInstances, sidebarWidgetInstances: $sidebarWidgetInstances) {
                    userId
                    mainWidgets {
                        code
                        order
                    }
                    sidebarWidgets {
                        code
                        order
                    }
                }
            }
        `, { clientId: ADMIN_CLIENT_ID });
}

export { getUserWidgetGraphql, getWidgetsGraphql, saveUserWidgetGraphql };
