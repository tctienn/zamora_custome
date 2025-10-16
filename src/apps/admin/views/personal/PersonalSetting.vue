<template>
  <div>
    <h5>{{ t("admin.user.userDetail.personalSetting") }}</h5>
  </div>
  <div>
    <div class='align-items-center flex gap-8 m-2'>
      <div class='align-items-center flex'>
        <div class='w-15rem'>Hiển thị ngày sinh</div>
        <InputSwitch v-model='personalSetting.showBirthday' />
      </div>

      <div
        v-if='personalSetting.showBirthday'
        class='align-items-center flex'>
        <div class='w-15rem'>Chỉ hiển thị ngày tháng</div>
        <InputSwitch v-model='personalSetting.showOnlyDate' />
      </div>
    </div>

    <div class='align-items-center flex m-2'>
      <div class='w-15rem'>Hiển thị số điện thoại</div>
      <InputSwitch v-model='personalSetting.showPhoneNumber' />
    </div>

    <div class='align-items-center flex m-2'>
      <div class='w-15rem'>Hiển thị email</div>
      <InputSwitch v-model='personalSetting.showEmail' />
    </div>

    <div class='align-items-center flex m-2'>
      <div class='w-15rem'>Cho phép thông báo</div>
      <InputSwitch v-model='personalSetting.allowNotification' />
    </div>
  </div>
  <div class='flex justify-content-center mt-3 w-full'>
    <Button
      icon='pi pi-save'
      :label="t('common.save')"
      @click='submit' />
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getPersonalSettingByUserId,
  savePersonalSetting,
} from '@/apps/admin/api/graphql/admin-customer-tenant';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { PersonalSetting } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();
const personalSetting = ref<PersonalSetting>({
  allowNotification: true,
  id: '',
  showBirthday: true,
  showEmail: true,
  showOnlyDate: false,
  showPhoneNumber: true,
  userId: '',
});
const { user } = useUserStore();
const {
  onResult: getPersonalSettingByUserIdResult,
  refetch: getPersonalSettingByUserIdRefetch,
} = getPersonalSettingByUserId(user.id || '');

getPersonalSettingByUserIdResult((res) => {
  personalSetting.value = cloneDeep(res.data.getPersonalSettingByUserId);
});

const { mutate: savePersonalSettingMutate, onDone: savePersonalSettingOnDone } =
  savePersonalSetting();

function submit() {
  savePersonalSettingMutate({ personalSetting: personalSetting.value });
}

savePersonalSettingOnDone(() => {
  toastSuccess({ message: t('Lưu thành công.') });
  getPersonalSettingByUserIdRefetch();
});
</script>

<style scoped></style>
