import { TICKET_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveBookFlight(formData: FormData) {
  return baseApi.postWithFile(`${TICKET_URL}/booking-flight`, formData);
}

export { saveBookFlight };