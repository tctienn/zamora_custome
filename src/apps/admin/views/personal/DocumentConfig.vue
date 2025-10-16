<template>
  <div>
    <h5>Thiết lập vai trò mặc định</h5>

    <div
      v-for='(role, index) in menuRoles'
      :key='index'
      class='align-items-center flex mb-2 ml-3'>
      <RadioButton
        v-model='selected'
        :value='role.value' />
      <label class='ml-2'>{{ role.label }}</label>
    </div>
  </div>

  <div class='flex justify-content-center w-full'>
    <Button
      icon='pi pi-save'
      :label="t('common.save')"
      @click='submit' />
  </div>
</template>

<script lang="ts" setup>
import { trimEnd } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveRoleDefault } from '@/apps/admin/api/graphql/role-default';
import type { UserOrganizationRole } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const { administrativeRoles, documentRoles, userDeptRole, defaultRoleId } =
  storeToRefs(useDocumentRolesStore());
const selected = ref(defaultRoleId.value);

const menuRoles = computed(() =>
  [...administrativeRoles.value, ...documentRoles.value].map((role) => ({
    label: buildRoleLabel(role),
    value: role.id,
  })),
);

function buildRoleLabel(orgRole: UserOrganizationRole) {
  return trimEnd(
    orgRole.role?.name + ' - ' + orgRole.organization?.name,
    ' - ',
  );
}

const { mutate: saveRoleDefaultMutate, onDone: saveRoleDefaultDone } =
  saveRoleDefault();

function submit() {
  saveRoleDefaultMutate({
    roleDefault: {
      userId: userDeptRole.value.userId,
      userDeptRoleId: selected.value,
    },
  });
}

saveRoleDefaultDone(() => {
  toastSuccess({ message: t('Lưu thành công') });
});
</script>

<style scoped></style>
