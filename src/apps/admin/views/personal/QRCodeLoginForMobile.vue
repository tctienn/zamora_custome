<template>
  <h5>{{ t('admin.user.userDetail.loginOnOtherDevice') }}</h5>
  <Button
    v-if='!isGenerated'
    icon='pi pi-qrcode'
    :label='t("admin.user.userDetail.generateLoginQRCode")'
    @click='generateQRCode'/>
  <div
    v-else
    class='flex flex-column gap-4'>
    <div
      v-if='qrCodeData'
      class='align-items-center flex h-full justify-content-center'>
      <img
        alt='qrcode'
        class='max-w-20rem'
        :src='qrCodeData'/>
    </div>
    <AppLoader v-else/>
    <div class='align-self-center'>
      Mã QR hết hạn sau {{ expiredAfter }}s
    </div>
    <div>
      <div>1. Mở ứng dụng Zamora trên điện thoại của bạn</div>
      <div>2. Quét mã QR này để đăng nhập</div>
    </div>
  </div>

</template>

<script lang='ts' setup>

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generateQRForMobile } from '@/common/api/rest/qr-login';
import AppLoader from '@/common/components/loader/AppLoader.vue';

const { t } = useI18n();
const isGenerated = ref(false);
const qrCodeData = ref('');
const expiredAfter = ref<number>();
let expiredInterval: NodeJS.Timeout;

watch(expiredAfter, (value) => {
  if (value === 0) {
    clearIntervalAndChangeGenerated();
  }
});

function generateQRCode() {
  isGenerated.value = true;
  generateQRForMobile().then((response) => {
    if (response) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(response);
      fileReader.onload = () => {
        qrCodeData.value = fileReader.result as string;
        expiredAfter.value = 2 * 60;
        expiredAfterDecrease();
      };
    }
  });
}

function expiredAfterDecrease() {
  expiredInterval = setInterval(() => {
    if (expiredAfter.value) {
      expiredAfter.value--;
    } else {
      clearInterval(expiredInterval);
    }
  }, 1000);
}

function clearIntervalAndChangeGenerated() {
  clearInterval(expiredInterval);
  isGenerated.value = false;
}
</script>

<style scoped>

</style>