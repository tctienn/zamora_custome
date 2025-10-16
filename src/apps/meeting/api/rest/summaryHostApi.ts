import type { SummaryMonthHostProjection, SummaryWeekHostProjection } from '@/apps/meeting/model/summary-host';
import { MEETING_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function summaryMonth(year: number) {
  return baseApi.get<SummaryMonthHostProjection[]>(`${MEETING_URL}/meeting/summary-month/${year}`);
}

function summaryWeek(year: number) {
  return baseApi.get<SummaryWeekHostProjection[]>(`${MEETING_URL}/meeting/summary-week/${year}`);
}

export { summaryMonth, summaryWeek };