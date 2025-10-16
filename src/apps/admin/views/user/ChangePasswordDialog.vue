<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='dialogChangePassword'
    :header='t("admin.user.changePassword")'
    @hide='emits("hide-dialog")'>
    <div class='p-fluid'>
      <div class='field'>
        <label
          v-required
          for='applicationDescription'>{{ t('admin.user.newPassword') }}</label>
        <Password
          id='applicationIcon'
          v-model='newPassword'
          :input-props='{"autocomplete": "new-password"}'
          :pt='{
            "panel": {
              "class": "p-2"
            },
            "info": {
              "class": "text-sm"
            }
          }'/>
        <ValidateErrorMessage :errors='v$.newPassword.$errors'/>
      </div>
      <div class='field'>
        <label
          v-required
          for='applicationDescription'>{{ t('admin.user.confirmPassword') }}</label>
        <Password
          id='applicationIcon'
          v-model='confirmPassword'
          :pt='{
            "panel": {
              "class": "p-2"
            },
            "info": {
              "class": "text-sm"
            }
          }'/>
        <ValidateErrorMessage :errors='v$.confirmPassword.$errors'/>
      </div>
    </div>
    <template #footer>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='emits("hide-dialog")'/>
      <Button
        icon='pi pi-check'
        :label='t("common.save")'
        @click='saveChangePassword'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, sameAs } from '@vuelidate/validators';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { changePassword } from '@/apps/admin/api/graphql/user-group-graphql-api';
import type { UserInterface } from '@/apps/admin/model/User';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<UserFormProps>(), {
  visibleDialog: false,
  item: undefined
});
const emits = defineEmits(['hide-dialog', 'reload']);
const {
  mutate: changePasswordMutate,
  onDone: changePasswordOnDone
} = changePassword();

interface UserFormProps {
  visibleDialog: boolean,
  item: UserInterface
}

const newPassword = ref('');
const confirmPassword = ref('');
const { t } = useI18n() || {};
const dialogChangePassword = ref(props.visibleDialog);
const validateRules = {
  newPassword: { required: helpers.withMessage(t('admin.user.userDetail.passwordIsEmpty'), required) },
  confirmPassword: {
    required: helpers.withMessage(t('admin.user.userDetail.confirmPasswordIsEmpty'), required),
    sameAsPassword: helpers.withMessage(t('admin.user.userDetail.passwordNotMatch'), sameAs(newPassword))
  },
};
const v$ = useVuelidate(validateRules, {
  newPassword,
  confirmPassword
});

function saveChangePassword() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      changePasswordMutate({
        id: props.item.id,
        rawPassword: confirmPassword.value
      });
    }
  }).catch((error) => {
    toastError({ message: error });
  });

}

changePasswordOnDone(() => {
  toastSuccess({ message: t('common.result.message.changePasswordSuccess') });
  emits('hide-dialog');
});
</script>

<script lang='ts'>
export default { name: 'ChangePasswordDialog' };
</script>

<style scoped>

</style>