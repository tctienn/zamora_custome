<template>
  <h5>
    <slot name='title'>
      {{ t('admin.user.userDetail.turnOn2FA') }}
    </slot>
  </h5>
  <br>
  <div class='p-fluid'>
    <div class='flex-column-reverse formgrid grid xl:flex-row'>
      <div class='col-12 mt-5 xl:col-4 xl:mt-0'>
        <label>{{ t('admin.user.userDetail.onOff2FA') }}</label>
      </div>
      <div class='col-12 xl:col-4'>
        <div class='theme-wrap'>
          <span>OFF</span>

          <InputSwitch
            v-model='turnOnOff2FA'
            class='ml-2 mr-2'
            :false-value='false'
            :true-value='true'
            @change='saveSetting'/>
          <span>ON</span>
        </div>
      </div>
      <div class='col-12 xl:col-4'></div>
    </div>
    <br>
    <div
      v-if='twoFactorQRCode'
      class='flex-column-reverse formgrid grid xl:flex-row'>
      <div class='col-12 mt-5 xl:col-4 xl:mt-0'>
        <label>{{ t('admin.user.userDetail.QRCode') }}</label>
      </div>
      <div class='col-12 xl:col-4'>
        <div class='theme-wrap'>
          <img
            alt='avatar'
            :src='twoFactorQRCode'/>
        </div>
      </div>
      <div class='col-12 xl:col-4'>

      </div>
    </div>

  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { turnOffTwoFactor, turnOnTwoFactor } from '@/common/api/rest/authApi';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n() || {};
const userStore = useUserStore();
const twoFactorQRCode = ref('');

const turnOnOff2FA = ref(userStore.user.using2FA);

function saveSetting() {
  if (turnOnOff2FA.value) {
    turnOnTwoFactor().then((response: string | void) => {
      toastSuccess();
      twoFactorQRCode.value = response || '';
    }).catch(() => void {});
  } else {
    turnOffTwoFactor().then((response) => {
      toastSuccess();
      twoFactorQRCode.value = '';
    }).catch(() => void {});
  }
  userStore.user.using2FA = turnOnOff2FA.value;
}
</script>

<script lang='ts'>
export default { name: 'PersonalSetting' };
</script>

<style scoped>

</style>
