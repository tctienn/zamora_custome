import type { IAnnouncement } from '@/apps/media/model/announcement';
import { MEDIA_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createAnnouncement(formData: FormData) {
  return baseApi.postWithFile(`${MEDIA_URL}/announcement/create`, formData);
}

function updateAnnouncement(formData: FormData) {
  return baseApi.postWithFile(`${MEDIA_URL}/announcement/update`, formData);
}

function getAnnouncementByIdNot(id: string | null) {
  return baseApi.get(`${MEDIA_URL}/announcement/getAnnouncementByIdNot${id ? '?id=' + id : ''}`);
}

export { createAnnouncement, getAnnouncementByIdNot, updateAnnouncement };