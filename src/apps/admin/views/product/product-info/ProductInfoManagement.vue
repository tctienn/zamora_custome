<template>
  <div>
    <form
      ref='form'
      class='flex justify-content-center'
      @submit.prevent='saveProductInfo'>
      <table class='col-12 p-0 xl:col-8'>
        <tr>
          <td class='font-semibold'>Tiêu đề trình duyệt</td>
          <td>
            <InputText
              v-model='productInfo.browserTitle'
              class='w-full'
              maxlength='255'
              name='browserTitle'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Tên sản phẩm</td>
          <td>
            <InputText
              v-model='productInfo.productName'
              class='w-full'
              maxlength='255'
              name='productName'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Tiêu đề dòng 1</td>
          <td>
            <InputText
              v-model='productInfo.title'
              class='w-full'
              maxlength='255'
              name='title'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Tiêu đề dòng 2</td>
          <td>
            <InputText
              v-model='productInfo.subTitle'
              class='w-full'
              maxlength='255'
              name='subTitle'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Copyright</td>
          <td>
            <InputText
              v-model='productInfo.copyright'
              class='w-full'
              maxlength='255'
              name='copyright'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Mô tả</td>
          <td>
            <Textarea
              id='objectDescription'
              v-model='productInfo.description'
              v-trim
              class='w-full'
              name='description'
              :placeholder='t("common.description")'
              rows='3'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Tên viết tắt</td>
          <td>
            <InputText
              v-model='productInfo.abbreviation'
              class='w-full'
              maxlength='255'
              name='abbreviation'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Đường dây nóng</td>
          <td>
            <InputText
              v-model='productInfo.hotline'
              class='w-full'
              maxlength='255'
              name='hotline'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Website</td>
          <td>
            <InputText
              v-model='productInfo.website'
              class='w-full'
              maxlength='255'
              name='website'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Email</td>
          <td>
            <InputText
              v-model='productInfo.email'
              class='w-full'
              maxlength='255'
              name='email'/>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Logo</td>
          <td>
            <LogoUpload
              v-model='productInfo.logo'
              :avatar-url='urlLogo'
              :name-image='"logo"'
              @is-change='changeLogo'/>
            <input
              name='isLogoChange'
              type='hidden'
              :value='isLogoChange'>
          </td>
        </tr>
        <tr>
          <td class='font-semibold'>Hình nền</td>
          <td>
            <BackgroundUpload
              v-model='productInfo.background'
              :avatar-url='urlBackground'
              :name-image='"background"'
              @is-change='changeBackground'/>
            <input
              name='isBackgroundChange'
              type='hidden'
              :value='isBackgroundChange'>
          </td>
        </tr>
        <tr>
          <td></td>
          <td
            class='text-center'>
            <Button
              icon='pi pi-save'
              :label="t('common.save')"
              type='submit'/>
          </td>
        </tr>
      </table>
    </form>
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createProductInfo, getProductInfo } from '@/apps/admin/api/rest/productInfoApi';
import BackgroundUpload from '@/apps/admin/views/background/BackgroundUpload.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getPreviewFile } from '@/common/helpers/file-utils';
import type { ProductInfoInterface } from '@/common/model/productInfo';
import LogoUpload from '@/common/views/logo/LogoUpload.vue';

const { t } = useI18n();
const form = ref();
const urlBackground = computed(() => productInfo.value.background ? getPreviewFile(productInfo.value.background) : '/images/avatar/ImageDefault.jpg');
const urlLogo = computed(() => productInfo.value.logo ? getPreviewFile(productInfo.value.logo) : '/images/avatar/ImageDefault.jpg');
let isBackgroundChange = ref(false);
let isLogoChange = ref(false);
let productInfo = ref<ProductInfoInterface>({});

getProductInfo().then((x) => {
  if (x) {
    productInfo.value = x;
  }
});

function changeBackground() {
  isBackgroundChange.value = true;
}

function changeLogo() {
  isLogoChange.value = true;
}

function saveProductInfo() {
  const formData = new FormData(form.value);
  createProductInfo(formData).then(() => {
    toastSuccess();
  });
}

</script>

<style scoped>
td {
  padding: .25rem;
}
</style>