import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getRoles(defaultParam: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query getRoles($keyword : String, $pageable : Pageable){
                getRoles(keyword: $keyword, pageable : $pageable){
                    totalCount
                    edges{
                        node{
                            code
                            name
                            status
                            description
                            apps{
                              web{
                                app
                                modules{
                                    module
                                    functions{
                                        actions
                                        function
                                    }
                                }
                              }
                              mobile{
                                app
                                modules{
                                    module
                                    functions{
                                        actions
                                        function
                                    }
                                }
                              }
                            }
                        }
                    }
                }
            }
        `, { ...defaultParam }
    , {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveRolePermissionsGraph() {
  return useMutation(
    gql`
            mutation saveRolePermissions($roleInput : RoleInput){
                saveRolePermissions(roleInput: $roleInput){
                    code
                    name
                }
            }
        `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function updateAppFunction() {
  return useMutation(
    gql`
            mutation updateAppFunction($permissionInput : PermissionInput, $isMobile: Boolean){
                updateAppFunction(permissionInput: $permissionInput, isMobile: $isMobile){
                    code
                    name
                }
            }
        `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function updateRolePermissions() {
  return useMutation(
    gql`
            mutation updateRolePermissions($roleInput : RoleInput){
                updateRolePermissions(roleInput: $roleInput){
                    code
                    name
                }
            }
        `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function deleteRolePermissions() {
  return useMutation(
    gql`
            mutation deleteRolePermissions($code : String){
                deleteRolePermissions(code: $code)
            }
        `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function checkExistUser(roleCode: string) {
  return useQuery(
    gql`
            query checkExistUser($roleCode: String){
                checkExistUser(roleCode: $roleCode)
            }
        `,
    { roleCode },
    { clientId: ADMIN_CLIENT_ID },
  );
}

function getRolesByStatus(status: string) {
  return useQuery(
    gql`
            query getRolesByStatus($status: String){
                getRolesByStatus(status: $status){
                    code
                    name
                    description
                    status
                    apps{
                      web{
                        app
                        modules{
                            module
                            functions{
                                actions
                                function
                            }
                        }
                      }
                      mobile{
                        app
                        modules{
                            module
                            functions{
                                actions
                                function
                            }
                        }
                      }
                    }
                }
            }`,
    { status },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getRoleByCodeIn(roleCodes: string[]) {
  return useQuery(
    gql`
      query getRoleByCodeIn($roleCodes: [String]){
          getRoleByCodeIn(roleCodes: $roleCodes){
            code
            name
            status
            description
            apps{
              web{
                app
                modules{
                    module
                    functions{
                        actions
                        function
                    }
                }
              }
              mobile{
                app
                modules{
                    module
                    functions{
                        actions
                        function
                    }
                }
              }
            }
          }
      }`,
    { roleCodes },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllConfiguredPermissions(functionType: string) {
  return useQuery(
    gql`
            query getAllConfiguredPermissions($functionType: FunctionType){
                getAllConfiguredPermissions(functionType: $functionType){
                    app
                    modules{
                        module
                        functions{
                            function
                            actions
                        }
                    }
                }
            }`,
    { functionType },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllRoles() {
  return useQuery(
    gql`
            query {
                roles {
                    code
                    name
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

function getAllRolesPublic() {
  return useQuery(
    gql`
            query {
                rolesPublic {
                    code
                    name
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

export {
  checkExistUser,
  deleteRolePermissions,
  getAllConfiguredPermissions,
  getAllRoles,
  getAllRolesPublic,
  getRoleByCodeIn,
  getRoles,
  getRolesByStatus,
  saveRolePermissionsGraph,
  updateAppFunction,
  updateRolePermissions
};
