<template>
  <TabMenu
    v-model:active-index='activeTab'
    class='mb-2'
    :model='menus'>
    <template #item='{item}'>
      <div
        v-ripple
        class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
        <a style='height: 1.5rem'>{{ item.label }}</a>
      </div>
    </template>
  </TabMenu>
  <CameraAccessTokenConfig v-if='activeTab === 0'/>
  <CameraPlaceManager v-if='activeTab === 1'/>
  <CameraDeviceManager v-if='activeTab === 2'/>
  <CameraPersonManager v-if='activeTab === 4'/>
  <LinkTimekeepingCode v-if='activeTab === 5'/>
</template>

<script lang='ts' setup>
import camelcase from 'camelcase';
import type { MenuItem } from 'primevue/menuitem';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CameraAccessTokenConfig from '@/apps/hrm/views/default_attendance/camera/component/CameraAccessTokenConfig.vue';
import CameraDeviceManager from '@/apps/hrm/views/default_attendance/camera/component/CameraDeviceManager.vue';
import CameraPersonManager from '@/apps/hrm/views/default_attendance/camera/component/CameraPersonManager.vue';
import CameraPlaceManager from '@/apps/hrm/views/default_attendance/camera/component/CameraPlaceManager.vue';
import LinkTimekeepingCode from '@/apps/hrm/views/default_attendance/camera/component/LinkTimekeepingCode.vue';

const activeTab = ref(0);
const { t } = useI18n();

enum CameraConfigTab {
  TOKEN = 'TOKEN',
  PLACE = 'PLACE',
  DEVICE = 'DEVICE',
  PARAMETERS = 'PARAMETERS',
  EMPLOYEES_FROM_CAMERA = 'EMPLOYEES_FROM_CAMERA',
  LINK_TIMEKEEPING_CODE = 'LINK_TIMEKEEPING_CODE',
}

const menus = reactive<MenuItem[]>(createMenus());
const tab = ref();

function createMenus(): MenuItem[] {
  return Object.keys(CameraConfigTab).map(s => ({
    label: t(`hrm.camera.cameraConfigTab.${camelcase(s)}`),
    code: s,
    command: () => {
      tab.value = CameraConfigTab[s as keyof typeof CameraConfigTab];
    }
  }));
}
</script>

<style scoped>

</style>