import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getObjectsGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String!, $pageable: Pageable) {
            searchObjectsTemplate(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        className
                        name
                        description
                        status
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getObjectGraphql(objectId: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getObjectTemplateById(id: $id) {
                id
                name
                properties {
                    fieldName
                    name
                    dataType
                    referenceData
                    defaultValue
                    listValue
                    type
                    description
                    required
                    status
                    order
                    group
                }
            }
        }
    `,
    { id: objectId },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveObjectGraphql() {
  return useMutation(
    gql`
        mutation ($id: String!, $objectTemplateInput: ObjectTemplateInput!) {
            saveObject(id: $id, objectTemplateInput: $objectTemplateInput) {
                id
                className
                name
                description
                status
            }
        }
    `, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function updateObjectPropertyGraphql() {
  return useMutation(
    gql`
        mutation ($objectId: String!, $propertyFieldName: String, $propertyInput: PropertyInput!) {
            updateObjectProperty(objectId: $objectId, propertyFieldName: $propertyFieldName, propertyInput: $propertyInput) {
                properties {
                    fieldName
                    name
                    dataType
                    defaultValue
                    referenceData
                    type
                    description
                    listValue
                    required
                    status
                    order
                    group
                }
            }
        }
    `, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deletePropertyGraphql() {
  return useMutation(
    gql`
        mutation ($objectId: String!, $propertyFieldName: String!) {
            deleteObjectProperty(objectId: $objectId, propertyFieldName: $propertyFieldName) {
                properties {
                    fieldName
                    name
                    dataType
                    defaultValue
                    referenceData
                    type
                    description
                    status
                    order
                }
            }
        }
    `, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getEmployeeObjectPropertiesGraphql() {
  return useQuery(
    gql`
        query {
            getObjectProperties {
                fieldName
                name
                dataType
                referenceData
                defaultValue
                listValue
                type
                description
                status
                order
                required
                group
            }
        }
    `, {}, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deletePropertyGraphql, getEmployeeObjectPropertiesGraphql, getObjectGraphql, getObjectsGraphql, saveObjectGraphql, updateObjectPropertyGraphql };
