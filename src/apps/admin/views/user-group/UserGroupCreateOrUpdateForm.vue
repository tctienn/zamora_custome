<template>
  <Dialog
    v-if='userGroup'
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='headerDialog'
    @hide='emits("hide-dialog-form")'>
    <form
      ref='form'
      @submit.prevent='submit'>
      <div>
        <div class='p-fluid pb-4'>
          <div class='formgrid grid'>
            <div class='col field'>
              <AvatarUpload :avatar-url='item?.avatar'/>
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

          <div class='formgrid grid'>
            <div class='col field'>
              <label
                v-required
                for='userGroupDescription'>{{ t('admin.userGroup.groupType') }}</label>
              <NamedDropdown
                v-model='userGroup.groupType'
                :empty-message='t("common.selectEmpty")'
                :filter='true'
                name='groupType'
                option-label='label'
                option-value='value'
                :options='getGroupType()'
                :placeholder='t("admin.userGroup.groupType")'/>
              <ValidateErrorMessage :errors='v$.groupType.$errors'/>
            </div>
          </div>

          <div
            v-if="userGroup.groupType == 'GROUP_RESOURCES'"
            class='formgrid grid'>
            <div class='col field'>
              <label
                v-required
                for='userGroupDescription'>{{ t('admin.userGroup.groupLeader') }}</label>
              <NamedDropdown
                v-model='userGroup.groupLeaderId'
                :filter='true'
                name='groupLeaderId'
                option-label='label'
                option-value='id'
                :options='users'
                :placeholder='t("admin.userGroup.groupLeader")'/>
            </div>
          </div>

          <div class='formgrid grid'>
            <div class='col field'>
              <label
                v-required
                for='userGroupDescription'>{{ t('admin.userGroup.typeOfPrivacy') }}</label>
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
              <InputText
                id='userGroupDescription'
                v-model='userGroup.description'
                name='description'/>
            </div>
          </div>
          <div class='formgrid grid'>

            <div class='col field'>
              <label
                for='status'>{{ t('common.status') }}</label>
              <NamedDropdown
                id='status'
                v-model='userGroup.status'
                name='status'
                option-label='label'
                option-value='value'
                :options='getStatuses'
                :placeholder='t("common.status")'/>
            </div>
            <div class='col field'>
            </div>
          </div>

        </div>
      </div>
      <div
        class='border-300 border-top-1 bottom-0 fixed flex gap-3 justify-content-center left-0 py-2 surface-overlay w-full'>
        <Button
          class='border-round-sm p-button-p-sm p-button-plain'
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='emits("hide-dialog-form")'/>
        <Button
          class='border-round-sm'
          icon='pi pi-check'
          :label='t("common.save")'
          type='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get, isEmpty, toLower } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createOrUpdateGroup } from '@/apps/admin/api/rest/groupApi';
import type { UserGroupInterface } from '@/apps/admin/model/userGroup';
import { getActiveUsersGraphql } from '@/common/api/graphql/user-graphql';
import AvatarUpload from '@/common/components/custom/AvatarUpload.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getGroupType, getTypeOfPrivacy } from '@/common/helpers/utils';
import { User } from '@/common/model/User';

interface UserGroupFormProps {
  visibleDialog: boolean,
  item: UserGroupInterface
}

const props = withDefaults(defineProps<UserGroupFormProps>(), {
  visibleDialog: false,
  item: undefined
});
const emits = defineEmits(['hide-dialog-form', 'reload-form']);
const { onResult: getActiveUsersResult } = getActiveUsersGraphql();
const users = ref<User[]>([]);
const { t } = useI18n() || {};
const userGroup = ref<UserGroupInterface>(props.item);
if (!userGroup.value.id) {
  userGroup.value.status = 'ACTIVE';
}
getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserStatusActive', []);
  users.value = users.value.map((user) => ({
    ...user,
    label: user.fullName + ' - ' + user.username + ' - ' + user.email
  }));
});
const form = ref();
const visible = ref(props.visibleDialog);
const isCreate = isEmpty(userGroup.value['id']);
const headerDialog: string = isCreate
  ? t('common.createItem', { item: toLower(t('admin.userGroup.userGroupName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.userGroup.userGroupName')),
    name: userGroup.value.name
  });

const selectedUserGroup = ref();

selectedUserGroup.value = isCreate ? null : { [userGroup.value.id]: true };

const validateRules = {
  typeOfPrivacy: { required: helpers.withMessage(t('admin.userGroup.typePrivacyEmpty'), required) },
  groupType: { required: helpers.withMessage(t('admin.userGroup.groupTypeEmpty'), required) },
  name: { required: helpers.withMessage(t('admin.userGroup.nameEmpty'), required) },
};

const v$ = useVuelidate(validateRules, userGroup.value);

function submit() {
  const formData = new FormData(form.value);
  createOrUpdateGroup(formData).then(() => {
    toastSuccess({ message: t('admin.user.message.updateSuccess') });
    emits('reload-form');
    emits('hide-dialog-form');
  });
}

let getStatuses = ref([
  {
    label: t('common.statuses.active'),
    value: 'ACTIVE'
  },
  {
    label: t('common.statuses.deactivate'),
    value: 'DEACTIVATE'
  }
]);

</script>

<script lang='ts'>
export default { name: 'UserGroupForm' };
</script>