<template>
  <Sidebar
    v-model:visible='visible'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width: 30rem'>
    <template #header>
      <div
        class='align-items-center flex justify-content-between w-full'
        style='z-index: 1000'>
        <div class='flex gap-1'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='visible=false'/>

          <div class='align-content-center font-semibold text-xl'>
            {{ t('hrm.camera.checkin.monitorTable') }}
          </div>
        </div>
      </div>
    </template>
    <div class='flex flex-column gap-3 mt-2'>
      <div class='font-bold'>
        {{ employeeName }}
      </div>

      <template v-if='firstCheckIn'>
        <div v-if='firstCheckIn?.placeName'>
          {{ t('hrm.camera.checkin.location') }}:
          {{ firstCheckIn?.placeName || t('hrm.camera.checkin.unknownLocation') }}
        </div>
        <div
          class='flex gap-2 justify-content-around'>
          <div
            v-if='firstCheckIn'
            class='align-items-center flex flex-column gap-1'>
            <HrmAvatar
              :avatar='firstCheckIn?.detectedImageUrl'
              width='10rem'/>
            <div>
              {{ t('hrm.camera.checkin.checkinTime') }}
              <span class='font-semibold'>{{ moment(firstCheckIn?.timeStamp).format('HH:mm') }}</span>
            </div>
          </div>
          <div
            v-if='lastCheckIn'
            class='align-items-center flex flex-column gap-1'>
            <HrmAvatar
              :avatar='lastCheckIn?.detectedImageUrl'
              width='10rem'/>
            <div>
              {{ isToday ? t('hrm.camera.checkin.lastAppearance') : t('hrm.camera.checkin.checkoutTime') }}
              <span class='font-semibold'>{{ moment(lastCheckIn?.timeStamp).format('HH:mm') }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        {{ t('common.noData') }}
      </template>
    </div>

  </Sidebar>
</template>

<script lang='ts' setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { listCheckInByDateAndEmployeeId } from '@/apps/hrm/api/graphql/checkin';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { Checkin } from '@/apps/hrm/model/checkin';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  selectedDate: {
    type: Date,
    default: () => new Date()
  },
  employeeId: {
    type: String,
    default: ''
  },
  employeeName: {
    type: String,
    default: ''
  }
});

const visible = defineModel('visible', {
  type: Boolean,
  default: false
});

const { t } = useI18n();
const { moment } = useMoment();

const isToday = computed(() => moment(props.selectedDate).isSame(new Date(), 'day'));

const firstCheckIn = ref<Checkin>();
const lastCheckIn = ref<Checkin>();

watch(() => [props.selectedDate, props.employeeId], (value) => {
  if (value[0] && value[1]) {
    listCheckInByDateAndEmployeeId(moment(value[0]).format(DateTimeFormat.ISO_LOCAL_DATE), value[1] as string)
      .onResult((res) => {
        const data = res.data?.listCheckInByDateAndEmployeeId || [] as Checkin[];
        if (data.length) {
          firstCheckIn.value = data[0];
          lastCheckIn.value = data[data.length - 1];
        } else {
          firstCheckIn.value = undefined;
          lastCheckIn.value = undefined;
        }
      });
  }
});

</script>

<style scoped>

</style>