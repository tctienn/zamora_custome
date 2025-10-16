<template>
  <Dialog
    v-if='userGroup'
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='headerDialog'
    @hide='emits("hide-dialog-form")'>
    <form
      ref='form'
      class='flex flex-row gap-3'
      @submit.prevent='submit'>
      <AvatarUploadOnly
        :avatar-url='item.avatar'
        class='mt-5'
        shape='rectangle'/>
      <div class='flex-grow-1 p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='userGroupName'>{{ t('admin.userGroup.userGroupName') }}</label>
            <InputText
              id='userGroupName'
              v-model='userGroup.name'
              name='name'/>
            <InputText
              id='userGroupId'
              v-model='userGroup.id'
              hidden
              name='id'/>
            <ValidateErrorMessage :errors='v$.name.$errors'/>
          </div>
        </div>

        <div
          class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='groupLeaderId'>{{ t('admin.userGroup.groupLeader') }}</label>
            <NamedDropdown
              v-model='userGroup.groupLeaderId'
              :filter='true'
              name='groupLeaderId'
              option-label='label'
              option-value='id'
              :options='users'
              :placeholder='t("admin.userGroup.groupLeader")'/>
            <ValidateErrorMessage :errors='v$.groupLeaderId.$errors'/>
          </div>
        </div>

        <div
          v-show='false'
          class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='groupType'>{{ t('admin.userGroup.groupType') }}</label>
            <NamedDropdown
              v-model='userGroup.groupType'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              name='groupType'
              option-label='label'
              option-value='value'
              :options='getGroupType()'
              :placeholder='t("admin.userGroup.groupType")'/>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='typeOfPrivacy'>{{ t('admin.userGroup.typeOfPrivacy') }}</label>
            <NamedDropdown
              v-model='userGroup.typeOfPrivacy'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              name='typeOfPrivacy'
              option-label='label'
              option-value='value'
              :options='getTypeOfPrivacy()'
              :placeholder='t("admin.userGroup.typeOfPrivacy")'/>
            <ValidateErrorMessage :errors='v$.typeOfPrivacy.$errors'/>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label
              for='userGroupDescription'>{{ t('common.description') }}</label>
            <Textarea
              id='userGroupDescription'
              v-model='userGroup.description'
              auto-resize
              name='description'/>
          </div>
        </div>
        <div class='formgrid grid'>
          <div class='col field'>
            <label>{{ t('common.status') }}</label>
          </div>
          <div class='col field'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='userGroup.status'
                aria-checked='true'
                input-id='radiobutton1'
                name='status'
                value='ACTIVE'/>
              <label
                class='ml-2'
                for='radiobutton1'>{{ t('common.statuses.active') }}</label>
            </div>
          </div>
          <div class='col field'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='userGroup.status'
                input-id='radiobutton2'
                name='status'
                value='DEACTIVATE'/>
              <label
                class='ml-2'
                for='radiobutton2'>{{ t('common.statuses.deactivate') }}</label>
            </div>
          </div>
        </div>

      </div>
    </form>
    <template #footer>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        text
        @click='emits("hide-dialog-form")'/>
      <Button
        icon='pi pi-check'
        :label='t("common.save")'
        type='submit'
        @click='form?.requestSubmit()'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get, isEmpty, toLower } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserMoreInfoNotAdminGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { saveGroup } from '@/apps/admin/api/rest/groupApi';
import type { UserGroupInterface } from '@/apps/admin/model/userGroup';
import AvatarUploadOnly from '@/common/components/custom/AvatarUploadOnly.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getGroupType, getTypeOfPrivacy } from '@/common/helpers/utils';
import { User } from '@/common/model/User';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object as PropType<UserGroupInterface>,
    required: true
  }
});

const emits = defineEmits(['hide-dialog-form', 'reload-form']);
const { onResult: getActiveUsersResult } = getAllUserMoreInfoNotAdminGraphql();

getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserMoreInfoNotAdmin', []);
  users.value = users.value.map((user) => ({
    ...user,
    label: user.fullName + ' - ' + user.username + ' - ' + user.email
  }));
});

const users = ref<User[]>([]);
const form = ref<InstanceType<typeof HTMLFormElement>>();

function submit() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const formData = new FormData(form.value);
      saveGroup(formData).then(() => {
        toastSuccess({ message: userGroup.value.id ? t('admin.user.message.updateSuccess') : t('admin.user.message.createSuccess') });
        emits('reload-form');
        emits('hide-dialog-form');
      });
    }
  });
}

const { t } = useI18n() || {};
const userGroup = ref<any>(props.item);
if (!userGroup.value.id) {
  userGroup.value.status = 'ACTIVE';
}
const visible = ref(props.visibleDialog);
const isCreate = isEmpty(userGroup.value['id']);

const headerDialog: string = isCreate
  ? t('common.createItem', { item: toLower(t('admin.userGroup.userGroupName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.userGroup.userGroupName')),
    name: userGroup.value.name
  });

const selectedUserGroup = ref();

selectedUserGroup.value = isCreate ? null : { [userGroup.value.id as string]: true };

const validateRules = {
  typeOfPrivacy: { required: helpers.withMessage(t('admin.userGroup.typeOfPrivacyEmpty'), required) },
  groupLeaderId: { required: helpers.withMessage(t('admin.userGroup.groupLeaderEmpty'), required) },
  name: { required: helpers.withMessage(t('admin.userGroup.nameEmpty'), required) }
};

const v$ = useVuelidate(validateRules, userGroup);
</script>

<script lang='ts'>
export default { name: 'GroupForm' };
</script>

<style scoped>

</style>
