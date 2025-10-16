import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

interface ChangeStatusInput {
  status: string | null;
  id: string | null;
  reviewer: string | null;
  note: string | null;
}

function getAllTimesheetByYear(year: number | null) {
  return useQuery(
    gql`
      query GetAllTimesheetByYear($year: Int) {
        getAllTimesheetByYear(year: $year) {
          id
          name
          status
          month
          year
          organizationId
          createdDate
          employeeIds
          createdUserId
          createdPlace
        }
      }
    `,
    { year: year, },
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function getTimesheet(id: string | null) {
  return useQuery(
    gql`
      query GetTimesheet($id: String) {
        getTimesheet(id: $id) {
          id
          name
          status
          month
          year
          organizationId
          createdDate
          employeeIds
          createdUserId
          createdPlace
        }
      }
    `,
    { id: id },
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function deleteTimesheet() {
  return useMutation(
    gql`
      mutation DeleteTimesheet($id: String) {
        deleteTimesheet(id: $id)
      }
    `,
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function saveTimesheet() {
  return useMutation(
    gql`
      mutation SaveTimesheet($timesheet: TimesheetInput!) {
        saveTimesheet(timesheet:$timesheet)
      }
    `,
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function changeStatus() {
  return useMutation(
    gql`
      mutation ChangeStatus($status: String, $id: String, $reviewer: String, $note: String) {
        changeStatus(status: $status, id: $id, reviewer: $reviewer, note: $note)
      }
    `,
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

export {
  changeStatus,
  deleteTimesheet,
  getAllTimesheetByYear,
  getTimesheet,
  saveTimesheet
};