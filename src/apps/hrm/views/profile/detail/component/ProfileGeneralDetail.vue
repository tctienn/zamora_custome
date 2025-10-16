<template>
  <div class='flex formgrid grid'>
    <div class='col-12 flex'>
      <div class='col-3'>
        <img
          v-if='!previewAvatar'
          alt='Profile Image'
          class='cursor-pointer w-full'
          src='@/common/assets/images/avatar-default.png'/>
        <img
          v-else
          alt='Profile Image'
          class='cursor-pointer object-fit-contain w-full'
          :src='generateAvatarUrl(previewAvatar) as string'
          style='max-height: 12rem'>
      </div>
      <div class='col-4 flex flex-column'>
        <div class='font-bold my-2'>{{ t('hrm.profile.general.code') }}:
          <span
            class='border-1 border-round-2xl ml-2 px-3 py-1'
            :class='status === "LEAVE" ? "bg-pink-50 border-red-400 text-red-400" : "bg-green-50 border-green-400 text-green-400"'>
            {{ model.code }}
          </span>
        </div>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'fullName') }"
          :label='t("hrm.profile.general.fullName")'
          :value='model.fullName'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'birthDay') }"
          :label='t("hrm.profile.general.birthDay")'
          :value='moment(model.birthDay).format("DD/MM/YYYY")'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'gender') }"
          :label='t("hrm.profile.general.gender")'
          :value="t('hrm.profile.general.genderOptions.' + camelCase(model.gender))"/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'otherName') }"
          :label='t("hrm.profile.general.otherName")'
          :value='model.otherName'/>
      </div>
      <div class='col-4 flex flex-column'>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'managerCode') }"
          :label='t("hrm.profile.general.managerCode")'
          :value='model.managerCode'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'timeKeepingCode') }"
          :label='t("hrm.profile.general.timeKeepingCode")'
          :value='model.timeKeepingCode'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'nationality') }"
          :label='t("hrm.profile.general.nationality")'
          :value='model.nationality'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'nation') }"
          :label='t("hrm.profile.general.nation")'
          :value='model.nation'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'religion') }"
          :label='t("hrm.profile.general.religion")'
          :value='model.religion'/>
      </div>
    </div>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'birthPlace') }"
      :label='t("hrm.profile.general.birthPlace")'
      :value='model.birthPlace'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'homeTown') }"
      :label='t("hrm.profile.general.homeTown")'
      :value='model.homeTown'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'permanentResidentStreet') }"
      :label='t("hrm.profile.general.permanentResidentStreet")'
      :value='(model.permanentResidentStreet || "") + ", " + (model.permanentResident || "")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'maritalStatus') }"
      :label='t("hrm.profile.general.maritalStatus")'
      :value="model.maritalStatus && t('hrm.profile.general.maritalStatusOptions.' + camelCase(model.maritalStatus))"/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'startDate') }"
      :label='t("hrm.profile.general.startDate")'
      :value='model.startDate ? moment(model.startDate).format("DD/MM/YYYY") : ""'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'joinDate') }"
      :label='t("hrm.profile.general.joinDate")'
      :value='model.joinDate ? moment(model.joinDate).format("DD/MM/YYYY") : ""'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'militaryService') }"
      :label='t("hrm.profile.general.militaryService")'
      :value="model.militaryService && t('hrm.profile.general.militaryServiceOptions.' + camelCase(model.militaryService))"/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'hobby') }"
      :label='t("hrm.profile.general.hobby")'
      :value='model.hobby'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'isMember') }"
      :label='t("hrm.profile.general.isMember")'
      :value='model.isMember ? t("common.yes") : t("common.no")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'profileCode') }"
      :label='t("hrm.profile.general.profileCode")'
      :value='model.profileCode'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'isParty') }"
      :label='t("hrm.profile.general.isParty")'
      :value='model.isParty ? t("common.yes") : t("common.no")'/>
  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeGeneral } from '@/apps/hrm/model/employee';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const props = defineProps({
  status: {
    type: String,
    default: null
  },
});
const { moment } = useMoment();
const model = defineModel({
  type: Object as PropType<EmployeeGeneral>,
  default: {} as EmployeeGeneral
});

const hrmStore = useHrmProfileStore();
const { changedProperties } = storeToRefs(hrmStore);
const changedPropertiesValue = computed(() => changedProperties.value);
const { t } = useI18n();
const previewAvatar = ref(model.value.avatar);
</script>

<style scoped>

</style>