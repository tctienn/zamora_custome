//TODO: place widget folder in every each app folder, like ecm widgets below
import {
  EcmMyDocumentWidget,
  EcmMyGroupWidget,
} from '@/apps/ecm/views/widgets';
import {
  MediaAnnouncementWidget,
  MediaBirthdayWidget,
  MediaHonorWidget,
  MediaNewsWidget,
} from '@/apps/media/views/widgets/';
import { MeetingWeeklyWidget } from '@/apps/meeting/views/widget/';
import DashboardContactWidget from '@/common/views/dashboard/widgets/contact/DashboardContactWidget.vue';
import DashboardEventWidget from '@/common/views/dashboard/widgets/event/DashboardEventWidget.vue';
import DashboardNoteWidget from '@/common/views/dashboard/widgets/note/DashboardNoteWidget.vue';

export {
  DashboardContactWidget,
  DashboardEventWidget,
  DashboardNoteWidget,
  EcmMyDocumentWidget,
  EcmMyGroupWidget,
  MediaAnnouncementWidget,
  MediaBirthdayWidget,
  MediaHonorWidget,
  MediaNewsWidget,
  MeetingWeeklyWidget,
};
