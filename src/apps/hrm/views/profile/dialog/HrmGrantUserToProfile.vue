<template>
  <Dialog
    v-model:visible='visible'
    :header='t("hrm.profile.employeeActionOptions.grantToUser")'
    modal
    style='width: 35rem'>
    <Dropdown
      v-model='userIdRef'
      auto-filter-focus
      class='w-full'
      filter
      :filter-fields='["fullName", "email"]'
      option-value='id'
      :options='allUsers'
      :placeholder='t("common.selectUser")'>
      <template #value='{value, placeholder}'>
        <span v-if='value'>{{ getDisplayValue(value) }}</span>
        <span v-else>{{ placeholder }}</span>
      </template>
      <template #option='{option}'>
        {{ option['fullName'] }} - {{ option['email'] }}
      </template>
    </Dropdown>
    <template #footer>
      <Button
        :label='t("common.close")'
        severity='danger'
        @click='visible = false'/>
      <Button
        :label='t("common.confirm")'
        @click='submit'/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { grantEmployeeToUser } from '@/apps/hrm/api/graphql/employee';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  employeeId: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: ''
  }
});

const { t } = useI18n();
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const userIdRef = ref(props.userId);
watch(() => props.userId, (newValue) => {
  userIdRef.value = newValue;
}, { immediate: true });

const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const needRefresh = inject('needRefresh', ref(false));

function getDisplayValue(id: string) {
  const user = allUsers.value.find((user) => user.id === id);
  if (!user) {
    return '';
  }
  return user.fullName + ' - ' + user.email;
}

function submit() {
  grantEmployeeToUser().mutate({
    employeeId: props.employeeId,
    userId: userIdRef.value
  }).then(() => {
    toastSuccess();
    needRefresh.value = true;
    visible.value = false;
  })
    .catch((err) => {
      toastError({ message: t('hrm.employee.errors.' + err.graphQLErrors[0].extensions.errorCode) });
    });
}

</script>

<style scoped>

</style>