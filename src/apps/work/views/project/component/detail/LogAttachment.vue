<template>
  <div class='border-bottom-1 flex'>
    <div
      class='align-content-center flex h-3rem pl-2 surface-0 text-white w-full'>
      <div class='align-content-center'>
        <AppIcon
          class='text-600'
          name='admin_panel_settings'
          size='2'/>
      </div>
      <div class='align-content-center font-semibold text-600'> {{ t('work.project.accessLog') }}: {{
        logs.length
      }}
      </div>
    </div>
  </div>
  <div
    class='border-300 h-full justify-content-center overflow-auto surface-0'>
    <div
      v-for='log in logs'
      :key='log.id'
      class='surface-0'>
      <div class='p-2'>
        <div class='flex gap-2'>
          <div>
            <AppUser
              avatar-size='3'
              :user-id='log.createdBy'/>
          </div>
          <div class='align-items-center flex-column'>
            <div>
              {{ moment(log.createdTime).format('HH:mm DD/MM/YYYY') }}
            </div>
            <div class='flex'>
              <div
                :class='`font-semibold ${lowerCase(log.action) === "delete" ? "text-red-500" : ""}`'>
                {{
                  t(`work.project.attachment.status.${lowerCase(log.action)}`)
                }}
              </div>
              :
              {{
                getMessage(log.action, log.oldValue, log.newValue)
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { lowerCase } from 'lodash';
import moment from 'moment/moment';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { ActionType, type ProjectLog } from '@/apps/work/model/projectLog';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';

const props = defineProps({
  logs: {
    type: Array as PropType<ProjectLog[]>,
    default: [] as ProjectLog[]
  },
  typeChart: {
    type: String,
    default: 'pie'
  }
});

const { t } = useI18n();

function truncateString(str: string, maxLength = 20): string {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

function getMessage(action: ActionType, oldValue?: string, newValue?: string) {
  const objOldValue = oldValue ? JSON.parse(oldValue) : '';
  const objNewValue = newValue ? JSON.parse(newValue) : '';

  if (action == ActionType.RENAME) {
    return truncateString(`${t('work.project.renameFile')} ${objOldValue?.['name']} ${t('work.project.from')} ${objNewValue?.['name']}`);
  } else if (action == ActionType.UPLOAD) {
    return truncateString(objNewValue?.['name']);
  } else {
    return truncateString(objOldValue?.['name']);
  }
}
</script>

<script lang='ts'>
export default { name: 'LogAttachment' };
</script>

<style scoped>

</style>