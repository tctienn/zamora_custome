import { TICKET_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveAirline(formData: FormData) {
  return baseApi.postWithFile(`${TICKET_URL}/airline`, formData);
}

export { saveAirline };