<template>
  <div
    class='flex gap-2 justify-content-between row-log w-full'>
    <div class='log-row w-full'>
      <div v-sanitize-html='messageLog.fullMessage'></div>
      <!--      {{messageLog['admins']}}-->
      <div
        v-if="messageLog['description']"
        class='flex w-full'>
        <div class='w-6'>
          {{ t('work.projectLog.from') }}
          <div
            v-sanitize-html="(messageLog['description'] as Difference)?.oldValue"
            class='description'/>
        </div>
        <div class='w-6'>
          {{ t('work.projectLog.to') }}
          <div
            v-sanitize-html="(messageLog['description'] as Difference)?.newValue"
            class='description'/>
        </div>
      </div>
    </div>
    <div class='mr-3'>
      {{ moment(detail.createdTime).format('HH:mm') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ILog } from '@/apps/work/model/projectLog';
import { type Difference, genMessageLog } from '@/apps/work/views/project/component/detail/log/LogUtils';
import type { MessageLog } from '@/apps/work/views/project/component/detail/log/MessageFactory';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  detail: {
    type: Object as PropType<ILog>,
    required: true
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const messageLog = ref<MessageLog>(genMessageLog(props.detail));

</script>

<script lang="ts">
export default { name: 'LogRowDetail' };
</script>

<style lang="scss" scoped>
:deep(.description img) {
  max-width: 50rem !important;
  max-height: 50rem !important;
  object-fit: cover;

}

//.row-log:hover {
//  background-color: #E9ECEFFF
//}

.log-row {
  position: relative;

  &:before {
    content: '•';
    color: rgba(0, 0, 0, 0.5);
    position: absolute;
    left: -1rem;
    top: -.35rem;
    font-size: 1.5rem;
  }
}

</style>