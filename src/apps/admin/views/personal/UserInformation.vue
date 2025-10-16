<template>
  <form
    ref='form'
    @submit.prevent='submit'>
    <h5>
      <slot name='title'>
        {{ t('admin.user.userDetail.userInformation') }}
      </slot>
    </h5>
    <div class='p-fluid'>
      <div class='flex-column-reverse formgrid grid xl:flex-row'>
        <div class='col-12 mt-5 xl:col-8 xl:mt-0'>
          <div class='col field'>
            <label for='fullName'>{{ t('admin.user.fullName') }}</label>
            <InputText
              id='fullName'
              v-model='user.fullName'
              name='fullName'/>

            <input
              v-model='user.username'
              hidden
              name='username'/>

            <input
              v-model='user.email'
              hidden
              name='email'/>
          </div>
          <div class='col field'>
            <label for='email'>{{ t('admin.user.telephoneNumber') }}</label>
            <InputText
              id='phone'
              v-model='user.phone'
              name='phone'/>
          </div>
          <div class='col field'>
            <label for='birthDay'>{{ t('admin.user.birthDay') }}</label>
            <NamedInputCalendar
              id='birthDay'
              v-model='user.birthDay'
              name='birthDay'
              :select-other-months='true'
              show-icon/>
          </div>
        </div>
        <div class='col-12 xl:col-4'>
          <AvatarUpload :avatar-url='user.avatar'/>
        </div>
      </div>
    </div>
    <div class='grid justify-content-center mt-5'>
      <Button
        class='mr-3 p-button-outlined p-button-plain'
        icon='pi pi-times'
        :label='t("common.cancel")'
        @click='$router.back()'/>
      <Button
        class='ml-3'
        icon='pi pi-save'
        :label='t("common.save")'
        type='submit'/>
    </div>
  </form>
</template>

<script setup lang='ts'>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findPersonal } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { updateUser } from '@/apps/admin/api/rest/userApi';
import AvatarUpload from '@/common/components/custom/AvatarUpload.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { User } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

const userStore = useUserStore();
const user = ref<User>({});
const form = ref();
const { t } = useI18n();

const { onResult: findPersonalOnResult } = findPersonal();
findPersonalOnResult(res => {
  user.value = {
    ...res.data.findPersonal,
    birthDay: new Date(res.data.findPersonal.birthDay as string)
  };
});

function submit() {
  const formData = new FormData(form.value);
  updateUser(formData).then((a: User | void) => {
    toastSuccess({ message: t('admin.user.message.updateSuccess') });
    if (a) {
      a.birthDay = new Date(a.birthDay as string);
      user.value = a;
      userStore.setUser(a);
    }
  });
}

</script>

<style scoped>
</style>
