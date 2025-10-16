import type { ExportMeetingRequestDTO } from '@/apps/meeting/model/meeting';
import { MEETING_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createMeeting(formData: FormData) {
  return baseApi.postWithFile(`${MEETING_URL}/meeting`, formData);
}

function updateMeeting(formData: FormData, id: string) {
  return baseApi.putWithFile(`${MEETING_URL}/meeting/${id}`, formData);
}

function exportExcel(request:ExportMeetingRequestDTO){
  return baseApi.download<Blob>(`${MEETING_URL}/meeting/export-excel`, request);
}

export { createMeeting, exportExcel, updateMeeting };