import { type GanttLocale, type GanttStatic, type GridColumn, type Scales } from 'dhtmlx-gantt';
import Avatar from 'primevue/avatar';
import PrimeVue from 'primevue/config';
import { type App, createApp, type VNode } from 'vue';

import AppAvatar from '@/common/components/app/AppAvatar.vue';
import UserGroupDialog from '@/common/components/dialog/UserGroupDialog.vue';
import type { GanttColumnConfig, GanttScaleConfig } from '@/common/components/gantt/type';
import I18n from '@/common/i18n';

//localization
function getLocaleVi(): GanttLocale {
  return {
    date: {
      month_full: ['Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
        'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'],
      month_short: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7',
        'T8', 'T9', 'T10', 'T11', 'T12'],
      day_full: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm',
        'Thứ Sáu', 'Thứ Bảy'],
      day_short: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    },
    labels: {
      new_task: 'Công việc mới',
      icon_save: 'Lưu',
      icon_cancel: 'Hủy bỏ',
      icon_details: 'Chi tiết',
      icon_edit: 'Chỉnh sửa',
      icon_delete: 'Xóa',
      gantt_save_btn: 'Nhãn mới',
      gantt_cancel_btn: 'Nhãn mới',
      gantt_delete_btn: 'Nhãn mới',
      confirm_closing: '', // Thay đổi của bạn sẽ bị mất, bạn có chắc không?
      confirm_deleting: 'Công việc sẽ bị xóa vĩnh viễn, bạn có chắc không?',
      section_description: 'Mô tả',
      section_time: 'Khoảng thời gian',
      section_type: 'Loại',

      /* grid columns */
      column_wbs: 'WBS',
      column_text: 'Tên công việc',
      column_start_date: 'Thời gian bắt đầu',
      column_duration: 'Thời gian kéo dài',
      column_add: '',

      /* link confirmation */
      link: 'Liên kết',
      confirm_link_deleting: 'sẽ bị xóa',
      link_start: ' (bắt đầu)',
      link_end: ' (kết thúc)',

      type_task: 'Công việc',
      type_project: 'Dự án',
      type_milestone: 'Cột mốc',

      minutes: 'Phút',
      hours: 'Giờ',
      days: 'Ngày',
      weeks: 'Tuần',
      months: 'Tháng',
      years: 'Năm',

      /* message popup */
      message_ok: 'OK',
      message_cancel: 'Hủy bỏ',

      /* constraints */
      section_constraint: 'Ràng buộc',
      constraint_type: 'Loại ràng buộc',
      constraint_date: 'Ngày ràng buộc',
      asap: 'Sớm nhất có thể',
      alap: 'Muộn nhất có thể',
      snet: 'Bắt đầu không sớm hơn',
      snlt: 'Bắt đầu không muộn hơn',
      fnet: 'Kết thúc không sớm hơn',
      fnlt: 'Kết thúc không muộn hơn',
      mso: 'Phải bắt đầu vào',
      mfo: 'Phải kết thúc vào',

      /* resource control */
      resources_filter_placeholder: 'nhập để lọc',
      resources_filter_label: 'ẩn trống',

      section_deadline: 'Hạn chót',
      section_baselines: 'Cơ sở dữ liệu'
    }
  };
}

export function setLocaleVi(gantt: GanttStatic) {
  gantt.i18n.addLocale('vi', getLocaleVi());
  gantt.i18n.setLocale('vi');
}

export function configColumns(columns: GanttColumnConfig[], gantt: GanttStatic) {
  const rs: GridColumn[] = columns.map(e => {
    return {
      ...e,
      onrender(task, node) {
        return e.templateTSX && e.templateTSX(task, node);
      },
    };
  });
  gantt.config.columns = rs;
}

export function configScales(scales: GanttScaleConfig[], gantt: GanttStatic) {
  const rs = scales.map(e => ({ ...e }));

  if (rs.length === 0) {
    throw new Error('Scales array cannot be empty');
  }
  gantt.config.scales = rs as Scales;
}

export function configExternalRender(gantt: GanttStatic, apps: App[]) {
  gantt.config.external_render = {
    isElement: (element) => {
      return element?.__v_isVNode;
    },
    // Render the Vue component into the DOM
    renderElement: (element: VNode, container) => {
      const app = createApp({
        render() {
          return element;
        }
      }); // Create Vue app from component
      app.use(I18n);
      app.use(PrimeVue);
      // eslint-disable-next-line vue/multi-word-component-names
      app.component('Avatar', Avatar);
      app.component('AppAvatar', AppAvatar);
      app.component('UserGroupDialog', UserGroupDialog);
      if (container.firstElementChild) {
        app.mount(container.firstElementChild); // Mount the component into the container
      }
      apps.push(app);
    }
  };
}
