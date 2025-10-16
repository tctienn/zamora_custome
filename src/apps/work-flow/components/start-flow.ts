import { useDialog } from 'primevue/usedialog';
import { type Ref } from 'vue';

import StartWorkFlowDialog from '@/apps/work-flow/components/StartWorkFlowDialog.vue';

export const useStartFlow = (flowType: FlowTypePredefined, objectId: Ref<string | undefined>) => {
  const dialog = useDialog();

  function showStartFlowDialog() {
    dialog.open(StartWorkFlowDialog, {
      props: {
        modal: true,
        position: 'top',
        style: { width: '50rem', },
        pt: { content: { class: 'p-0' } }
      },
      data: {
        flowType,
        objectId: objectId.value
      }
    });
  }

  return { showStartFlowDialog };
};

export enum FlowTypePredefined {
  HRM_LEAVE_APPLICATION = 'com.revotech.hrmservice.business.attendance.entity.LeaveApplication',
  MEETING_MEETING = 'com.revotech.meetingservice.business.meeting.model.Meeting',
  VEHICLE_BOOKING_CAR = 'com.revotech.vehicle.business.booking_car.model.BookingCar',
  HRM_EVALUATE_REPORT = 'com.revotech.hrmservice.business.evaluateEmployee.entity.EvaluateEmployeeSummaryReport'
}