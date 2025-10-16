<template>
  <ConfirmDialog></ConfirmDialog>
  <button
    v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: 'true' }"
    class='align-items-center flex gap-2 p-link topbar-profile-button'
    type='button'>
    <AppAvatar
      :avatar='generateAvatarUrl(user.avatar)'
      :label='user.fullName'
      shape='circle'
      size='2.5'/>
    <span class='profile-details'>
      <span class='profile-name'>{{ user.fullName }}</span>
      <span class='profile-job'>{{ user.email }}</span>
    </span>
    <i class='pi pi-angle-down'></i>
  </button>
  <ul
    class='absolute border-round hidden list-none m-0 mt-2 origin-top p-3 right-0 shadow-2 surface-overlay top-auto w-16rem w-full'>
    <li>
      <a
        v-ripple
        class='align-items-center border-round cursor-pointer flex h-3rem hover:surface-hover p-2 p-ripple transition-colors transition-duration-150 white-space-nowrap'>
        <i class='mr-3 pi pi-language'></i>
        <span class='align-items-center flex justify-content-between w-full'>{{ t('common.language') }}
          <Dropdown
            class='line-height-1'
            :model-value='language'
            :options='["en","vi"]'
            @update:model-value='onChangeLanguage'/>
        </span>
      </a>
      <a
        v-ripple
        class='align-items-center border-round cursor-pointer flex h-3rem hover:surface-hover p-2 p-ripple transition-colors transition-duration-150'>
        <i class='mr-3 pi pi-desktop'></i>
        <span
          class='align-items-center flex justify-content-between w-full'
          @click='changeTheme'>{{ t('common.theme') }}
          <i
            class='p-2'
            :class='dark ? "pi pi-moon text-blue-700" : "pi pi-sun text-yellow-700"'></i>
        </span>
      </a>

      <router-link
        v-ripple
        class='align-items-center border-round cursor-pointer flex h-3rem hover:surface-hover p-2 p-ripple transition-colors transition-duration-150'
        style='color: var(--text-color)'
        :to='{name: "Profile"}'>
        <i class='mr-3 pi pi-cog'></i>
        <span>{{ t('common.profile') }}</span>
      </router-link>
      <a
        v-ripple
        class='align-items-center border-round cursor-pointer flex h-3rem hover:surface-hover p-2 p-ripple transition-colors transition-duration-150'
        @click='confirmLogout'>
        <i class='mr-3 pi pi-sign-out'></i>
        <span>{{ t('common.signOut') }}</span>
      </a>
    </li>
  </ul>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { logout } from '@/common/api/rest/authApi';
import { useLayout } from '@/common/components/app/composables/layout';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { resetStore } from '@/common/service/reset_store';
import { useLocaleStore } from '@/common/store/locale';
import { useThemeStore } from '@/common/store/theme';
import { useUserStore } from '@/common/store/user';

const { currentLanguage: language } = storeToRefs(useLocaleStore());
const { dark } = storeToRefs(useThemeStore());
const { user, } = useUserStore();
const router = useRouter();
const { changeColorScheme } = useLayout();

const {
  t,
  locale
} = useI18n({ useScope: 'global' });
const confirm = useConfirm();

function onChangeLanguage(value: 'en' | 'vi'): void {
  language.value = value;
  locale.value = value;
}

function changeTheme() {
  dark.value = !dark.value;
  changeColorScheme(dark.value ? 'dark' : 'light');
}

function confirmLogout() {
  confirm.require({
    message: t('common.confirmSignOut'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: ()=> onLogout()
  });
}

async function onLogout() {
  logout().finally(() => {
    resetStore();
    router.replace({ name: 'LoggedOut' });
  }
  );
}

onMounted(() => {
  locale.value = language.value;
});
</script>

<style scoped>

</style>