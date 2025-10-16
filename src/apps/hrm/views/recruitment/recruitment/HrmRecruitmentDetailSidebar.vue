<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width: 70rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          <div class='p-sidebar-header-content'>
            {{ t(`hrm.recruitment.title`) }}
          </div>
        </div>
      </div>
    </template>
    <HrmRecruitmentDetail
      v-model='model'
      class='mt-2'/>
  </Sidebar>
</template>

<script lang='ts' setup>
import { inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Recruitment } from '@/apps/hrm/model/recruitment';

import HrmRecruitmentDetail from '../detail/recruitment/HrmRecruitmentDetail.vue';

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const model = defineModel({ type: Object as PropType<Recruitment> });
const resetData = inject('resetData', () => void {});

function hideForm() {
  visible.value = false;
  resetData();
}
</script>

<style scoped>

</style>
