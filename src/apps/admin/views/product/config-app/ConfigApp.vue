<template>
  <div class='flex flex-column gap-2'>
    <Panel :header='t("product.config.menuType")'>
      <!--      <div class='flex flex-wrap gap-4'>-->
      <!--        <div-->
      <!--          v-for='(op, i) in menuModeOptions'-->
      <!--          :key='i'-->
      <!--          class='align-items-center flex'>-->
      <!--          <RadioButton-->
      <!--            v-model='menuMode'-->
      <!--            :input-id='op'-->
      <!--            name='menuMode'-->
      <!--            :value='op'/>-->
      <!--          <label-->
      <!--            class='cursor-pointer ml-2'-->
      <!--            :for='op'>{{ t(`product.config.${op}`) }}</label>-->
      <!--        </div>-->
      <!--      </div>-->
    </Panel>

    <Panel
      :header='t("product.config.primaryColor")'>
      <!--      <div class='flex flex-wrap gap-3'>-->
      <!--        <div-->
      <!--          v-for='(theme, i) in themes'-->
      <!--          :key='i'>-->
      <!--          <a-->
      <!--            :autoFocus='selectedTheme === theme.name'-->
      <!--            class='align-items-center border-round cursor-pointer flex h-3rem hover:shadow-4 justify-content-center transition-duration-150 w-3rem'-->
      <!--            :style="{ 'background-color': theme.color }"-->
      <!--            @click='selectedTheme = theme.name'>-->
      <!--            <i-->
      <!--              v-if='theme.name === selectedTheme'-->
      <!--              class='pi pi-check text-white text-xl'></i>-->
      <!--          </a>-->
      <!--        </div>-->
      <!--      </div>-->
    </Panel>
    <div class='flex justify-content-end'>
      <ButtonIcon
        icon='save'
        :label='t("common.save")'
        @click='save'></ButtonIcon>
    </div>
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave } from 'vue-router';

import { defaultConfig } from '@/common/api/rest/admin-tenant';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useThemeStore } from '@/common/store/theme';

const { t } = useI18n();
const store = useThemeStore();
const {
  menuMode,
  theme: selectedTheme
} = storeToRefs(store);
// const {
//   menuModeOptions,
//   themes,
//   changeDefaultMenuMode,
//   changeDefaultTheme
// } = store;

function loadConfig() {
  // defaultConfig().onResult((res) => {
  //   if (res.data?.defaultConfig) {
  //     const config = res.data.defaultConfig;
  //     changeDefaultMenuMode(config.menuMode);
  //     changeDefaultTheme(config.theme);
  //   }
  // });
}

function save() {
  // saveConfig().mutate({
  //   productConfigInput: {
  //     menuMode: menuMode.value,
  //     theme: selectedTheme.value
  //   }
  // }).then((res) => {
  //   if (res?.data?.saveProductConfig) {
  //     const config = res?.data?.saveProductConfig || {};
  //     changeDefaultMenuMode(config.menuMode);
  //     changeDefaultTheme(config.theme);
  //   }
  //   toastSuccess();
  // })
  //   .catch(() => toastError());
}

onMounted(() => {
  loadConfig();
});

onBeforeRouteLeave(() => {
  console.log('onBeforeRouteLeave');
  store.reset();
});
</script>

<style scoped>

</style>
