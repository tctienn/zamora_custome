<template>
  <div class=''>
    <div class='card flex'>
      <div class='col-2'>
        <div id='sub-menu'>
          <Button
            class='p-button-secondary p-button-text text'
            icon='pi pi-chevron-left '
            icon-pos='left'
            :label="t('common.back')"
            @click='$router.back()'/>

          <Divider/>
          <div
            v-for='(item, i) of userDetails'
            :key='i'>
            <Button
              class='p-button-text sm:hover:text-primary text text-left w-full'
              :class="
                currentView === item.view
                  ? 'p-button-primary font-bold'
                  : 'p-button-secondary'
              "
              :label='t(item.key)'
              @click='changeView(item.view)'/>
          </div>
        </div>
      </div>

      <div class='col-10'>
        <div class='border-1 border-black-alpha-20 border-round h-full p-4'>
          <div class='user-detail-view'>
            <component :is='currentView'/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import ChangePassword from '@/apps/admin/views/personal/ChangePassword.vue';
import DelegateInfo from '@/apps/admin/views/personal/DelegateInfo.vue';
import Document from '@/apps/admin/views/personal/DocumentConfig.vue';
import PersonalSetting from '@/apps/admin/views/personal/PersonalSetting.vue';
import QRCodeLoginForMobile from '@/apps/admin/views/personal/QRCodeLoginForMobile.vue';
import SignConfigPage from '@/apps/admin/views/personal/SignConfigPage.vue';
import TurnOn2FA from '@/apps/admin/views/personal/TurnOn2FA.vue';
import UserInformation from '@/apps/admin/views/personal/UserInformation.vue';

const { t } = useI18n();

const userDetails = [
  {
    key: 'admin.user.userDetail.userInformation',
    view: UserInformation
  },
  {
    key: 'admin.user.userDetail.changePassword',
    view: ChangePassword,
  },
  {
    key: 'admin.user.userDetail.loginOnOtherDevice',
    view: QRCodeLoginForMobile,
  },
  {
    key: 'admin.user.userDetail.turnOn2FA',
    view: TurnOn2FA,
  },
  {
    key: 'admin.user.userDetail.document',
    view: Document,
  },
  {
    key: 'admin.user.userDetail.signConfig',
    view: SignConfigPage,
  },
  {
    key: 'admin.user.userDetail.delegateInfo',
    view: DelegateInfo,
  },
  {
    key: 'admin.user.userDetail.personalSetting',
    view: PersonalSetting,
  },
];

const currentView = shallowRef(UserInformation);

function changeView(view: any) {
  currentView.value = view || userDetails[0].view;
}
</script>

<script lang='ts'>
export default { name: 'PersonalProfile' };
</script>

<style scoped>
.text {
  color: var(--text-color);
}
</style>
