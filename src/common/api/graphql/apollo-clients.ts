import { ApolloClient, ApolloLink, type ApolloQueryResult, fromPromise, InMemoryCache, type OperationVariables, type ServerError } from '@apollo/client/core';
import { ErrorLink, onError } from '@apollo/client/link/error';
import { provideApolloClients, useQuery } from '@vue/apollo-composable';
import type { DocumentParameter, VariablesParameter } from '@vue/apollo-composable/dist/useQuery';
import { createUploadLink } from 'apollo-upload-client';
import { ref } from 'vue';

import { refreshToken } from '@/common/api/rest/authApi';
import { toastError } from '@/common/helpers/custom-toast-service';
import i18n from '@/common/i18n';
import { logoutAndRedirectToLogin } from '@/common/service/reset_store';
import { useUserStore } from '@/common/store/user';

import * as endpoints from '../configService';

const { t } = i18n.global;

const AUTH_CLIENT_ID = 'auth';
const ADMIN_CLIENT_ID = 'admin';

const DOCUMENT_CLIENT_ID = 'document';
const SEARCH_CLIENT_ID = 'search';
const ECM_CLIENT_ID = 'ecm';
const E_FORM_CLIENT_ID = 'e-form';
const NOTIFICATION_CLIENT_ID = 'notification';
const HRM_CLIENT_ID = 'hrm';
const WIDGET_CLIENT_ID = 'widget';
const WORK_CLIENT_ID = 'work';
const MEDIA_CLIENT_ID = 'media';
const MEETING_CLIENT_ID = 'meeting';
const FLOW_CLIENT_ID = 'flow';
const VEHICLE_CLIENT_ID = 'vehicle';
const TICKET_CLIENT_ID = 'ticket';
const MISSION_CLIENT_ID = 'mission';

const mapEndpoints = new Map([
  [AUTH_CLIENT_ID, `${endpoints.AUTH_URL}/graphql`],
  [ADMIN_CLIENT_ID, `${endpoints.ADMIN_URL}/graphql`],
  [ECM_CLIENT_ID, `${endpoints.ECM_URL}/graphql`],
  [E_FORM_CLIENT_ID, `${endpoints.E_FORM_URL}/graphql`],
  [HRM_CLIENT_ID, `${endpoints.HRM_URL}/graphql`],
  [NOTIFICATION_CLIENT_ID, `${endpoints.NOTIFICATION_URL}/graphql`],
  [WIDGET_CLIENT_ID, `${endpoints.WIDGET_URL}/graphql`],
  [WORK_CLIENT_ID, `${endpoints.WORK_URL}/graphql`],
  [MEDIA_CLIENT_ID, `${endpoints.MEDIA_URL}/graphql`],
  [MEETING_CLIENT_ID, `${endpoints.MEETING_URL}/graphql`],
  [FLOW_CLIENT_ID, `${endpoints.FLOW_URL}/graphql`],
  [SEARCH_CLIENT_ID, `${endpoints.SEARCH_URL}/graphql`],
  [DOCUMENT_CLIENT_ID, `${endpoints.DOCUMENT_URL}/graphql`],
  [VEHICLE_CLIENT_ID, `${endpoints.VEHICLE_URL}/graphql`],
  [TICKET_CLIENT_ID, `${endpoints.TICKET_URL}/graphql`],
  [MISSION_CLIENT_ID, `${endpoints.MISSION_URL}/graphql`],
]);

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.variables = removeTypename(operation.variables);
  operation.setContext({ headers: getHeader() });
  return forward(operation);
});

function removeTypename(obj: any): any {
  const __typename = '__typename';
  if (Array.isArray(obj)) {
    return obj.map(item => removeTypename(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== __typename) {
        newObj[key] = removeTypename(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

const handleWhenTokenExpire = onError(<ErrorLink.ErrorHandler> (({
  networkError,
  operation,
  forward
}) => {
  if (networkError) {
    if ((networkError as ServerError).statusCode === 401) {
      logoutAndRedirectToLogin();
    }
    if ((networkError as ServerError).statusCode === 403) {
      return fromPromise(
        refreshToken().then(() => forward(operation))
          .catch(() => {
            logoutAndRedirectToLogin();
            return;
          })
      );
    }
  }
}));

const handleGraphQlError = onError(<ErrorLink.ErrorHandler> (({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const {
        classification,
        // errorCode,
        // errorType
      } = extensions || {};
      if (classification) {
        if (classification === 'ValidationError') {
          toastError({ message: t('common.dataInvalid') });
        }
        if (classification === 'DataFetchingException') {
          toastError({ message: t('DataFetchingException') });
        }
      }
      // if (errorCode && errorType) {
      //   toastError({ message: errorCode.toString() });
      // }
    });
  }
}));

function getHeader() {
  const userStore = useUserStore();
  const { authentication } = userStore;

  return {
    'Authorization': authentication,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'apollo-require-preflight': true
  };
}

function createApolloClient(id: string) {
  return new ApolloClient({
    link: authMiddleware
      .concat(handleWhenTokenExpire)
      .concat(handleGraphQlError)
      .concat(createUploadLink({ uri: mapEndpoints.get(id) })),
    cache: new InMemoryCache({
      typePolicies: {
        IncomingDoc: { keyFields: ['id', 'processId', 'ccId', 'commentId'], },
        OutgoingDoc: { keyFields: ['id', 'processId', 'commentId'], },
        DocSubmit: { keyFields: ['id', 'processId', 'commentId'], },
        UserLevel: { keyFields: ['id', 'groupId'] }
      }
    })
  });
}

const apolloClients = {
  default: createApolloClient(ECM_CLIENT_ID),
  admin: createApolloClient(ADMIN_CLIENT_ID),
  ecm: createApolloClient(ECM_CLIENT_ID),
  'e-form': createApolloClient(E_FORM_CLIENT_ID),
  hrm: createApolloClient(HRM_CLIENT_ID),
  notification: createApolloClient(NOTIFICATION_CLIENT_ID),
  widget: createApolloClient(WIDGET_CLIENT_ID),
  work: createApolloClient(WORK_CLIENT_ID),
  media: createApolloClient(MEDIA_CLIENT_ID),
  meeting: createApolloClient(MEETING_CLIENT_ID),
  flow: createApolloClient(FLOW_CLIENT_ID),
  document: createApolloClient(DOCUMENT_CLIENT_ID),
  search: createApolloClient(SEARCH_CLIENT_ID),
  vehicle: createApolloClient(VEHICLE_CLIENT_ID),
  ticket: createApolloClient(TICKET_CLIENT_ID),
  mission: createApolloClient(MISSION_CLIENT_ID),
};

provideApolloClients(apolloClients);

export default apolloClients;

export {
  ADMIN_CLIENT_ID,
  AUTH_CLIENT_ID,
  DOCUMENT_CLIENT_ID,
  E_FORM_CLIENT_ID,
  ECM_CLIENT_ID,
  FLOW_CLIENT_ID,
  HRM_CLIENT_ID,
  MEDIA_CLIENT_ID,
  MEETING_CLIENT_ID,
  MISSION_CLIENT_ID,
  NOTIFICATION_CLIENT_ID,
  SEARCH_CLIENT_ID,
  TICKET_CLIENT_ID,
  VEHICLE_CLIENT_ID,
  WIDGET_CLIENT_ID,
  WORK_CLIENT_ID
};

export function useApolloQuery<TResult = any, TVariables extends OperationVariables = OperationVariables>
(document: DocumentParameter<TResult, TVariables>, variables: () => VariablesParameter<TVariables>) {
  const enableLoginQuery = ref(false);
  const {
    onResult,
    loading: queryLoading,
    onError
  } = useQuery(
    document,
    variables,
    () => ({
      enabled: enableLoginQuery.value,
      notifyOnNetworkStatusChange: false
    }));
  const apolloQuery = () => new Promise<ApolloQueryResult<TResult>>((resolve, reject) => {
    enableLoginQuery.value = true;
    onResult(res => {
      if (!res.loading) {
        enableLoginQuery.value = false;

        if (!res.data) {
          reject('no data');
        }
        resolve(res);
      }
    });
    onError(err => {
      enableLoginQuery.value = false;
      console.error(err);
      reject(err);
    });
  });

  return {
    apolloQuery,
    queryLoading
  };
}
