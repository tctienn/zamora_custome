<template>
  <div class='formgrid grid'>
    <div class='col-6 flex flex-column'>
      <LabelDisplay
        :label='t("hrm.profile.CCCDPassport.cccdNumber")'
        :value='model.cccdNumber'/>
      <LabelDisplay
        :label='t("hrm.profile.CCCDPassport.issueDate")'
        :value='model.issueDate && moment(model.issueDate).format("DD/MM/YYYY")'/>
      <LabelDisplay
        :label='t("hrm.profile.CCCDPassport.issuePlace")'
        :value='model.issuePlace'/>
      <LabelDisplay
        :label='t("hrm.profile.CCCDPassport.expirationDateCCCD")'
        :value='model.expirationDateCCCD && moment(model.expirationDateCCCD).format("DD/MM/YYYY")'/>
      <LabelDisplay
        :label='t("hrm.profile.CCCDPassport.passportType")'
        :value='model.passportType'/>
      <LabelDisplay
        :label='t("hrm.profile.CCCDPassport.passportNumber")'
        :value='model.passportNumber'/>
      <LabelDisplay
        :label='t("hrm.profile.CCCDPassport.expirationDatePassport")'
        :value='model.expirationDatePassport && moment(model.expirationDatePassport).format("DD/MM/YYYY")'/>
    </div>
    <div class='col-6 gap-2 grid p-2'>
      <div
        v-if='!model.frontPhotoCCCD'
        class='align-items-center border-round col-5 cursor-pointer flex font-bold h-8rem justify-content-center surface-200'>
      </div>
      <img
        v-else
        alt='Image'
        class='col-5 cursor-pointer object-fit-contain'
        :src='generateAvatarUrl(model.frontPhotoCCCD) as string'
        style='max-height: 10rem'>
      <div
        v-if='!model.backPhotoCCCD'
        class='align-items-center border-round col-5 cursor-pointer flex font-bold h-8rem justify-content-center surface-200'>
      </div>
      <img
        v-else
        alt='Image'
        class='col-5 cursor-pointer object-fit-contain'
        :src='generateAvatarUrl(model.backPhotoCCCD) as string'
        style='max-height: 10rem'>
      <div
        v-if='!model.passportPhoto'
        class='align-items-center border-round col-5 cursor-pointer flex font-bold h-8rem justify-content-center surface-200'>
      </div>
      <img
        v-else
        alt='Image'
        class='col-5 cursor-pointer object-fit-contain'
        :src='generateAvatarUrl(model.passportPhoto) as string'
        style='max-height: 10rem'>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeCCCDPassport } from '@/apps/hrm/model/employee';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const { moment } = useMoment();
const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<EmployeeCCCDPassport>,
  default: {} as EmployeeCCCDPassport
});
</script>

<style scoped>

</style>