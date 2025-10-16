import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveCapacity() {
  return useMutation(
    gql`
            mutation ($capacityInput: CapacityInput) {
                saveCapacity(capacityInput: $capacityInput) {
                    id
                    type
                    capacity
                    unit
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function findByType(type: string) {
  return useQuery(
    gql`
            query findByType($type: String){
                findByType(type: $type){
                    id
                    capacity
                    objectId
                    type
                    unit
                }
            }
        `, { type },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getOrDefaultGroupCapacityGeneral() {
  return useQuery(
    gql`
            query getOrDefaultGroupCapacityGeneral{
                getOrDefaultGroupCapacityGeneral{
                    id
                    capacity
                    objectId
                    type
                    unit
                }
            }
        `, {},
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getOrDefaultUserCapacityGeneral() {
  return useQuery(
    gql`
            query getOrDefaultUserCapacityGeneral{
                getOrDefaultUserCapacityGeneral{
                    id
                    capacity
                    objectId
                    type
                    unit
                }
            }
        `, {},
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getCapacities(data: { pageable: object }) {
  return useQuery(
    gql`
            query getCapacities($pageable: Pageable){
                getCapacities(pageable: $pageable){
                    totalCount
                    edges{
                        node{
                            id
                            capacity
                            objectId
                            type
                            unit
                            name
                            groupName
                        }
                    }
                }
            }
        `, { ...data },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function deleteCapacity() {
  return useMutation(
    gql`
            mutation ($id: String) {
                deleteCapacity(id: $id) {
                    id
                    type
                    capacity
                    unit
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

export {
  deleteCapacity,
  findByType,
  getCapacities,
  getOrDefaultGroupCapacityGeneral,
  getOrDefaultUserCapacityGeneral,
  saveCapacity
};
