import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function labelSaveGraphql() {
  return useMutation(
    gql`
            mutation labelSave($labelInput: LabelInput){
                labelSave(labelInput: $labelInput){
                    id
                    labelColor
                    labelTitle
                }
            }
        `, { clientId: WORK_CLIENT_ID }
  );
}

function getAllLabelGraphql() {
  return useQuery(
    gql`
            query getAllLabel{
                getAllLabel{
                    id
                    labelColor
                    labelTitle
                }
            }
        `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function removeLabelByIdGraphql() {
  return useMutation(
    gql`
            mutation removeLabelById($id: String){
                removeLabelById(id: $id)
            }
        `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getAllLabelGraphql, labelSaveGraphql, removeLabelByIdGraphql };