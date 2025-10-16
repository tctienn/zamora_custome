<template>
  <div
    class='border-1 border-round p-3 surface-border'>
    <div class='align-items-center flex font-semibold justify-content-between mb-3'>
      <div class='align-items-center flex gap-3'>
        <span class='text-xl'>{{ t("document.flowAction.listReceiver") }}</span>
        <span
          v-show='chosenUserDeptRole.length>0'
          :class='`number-user`'> {{ chosenUserDeptRole.length }}</span>
      </div>
      <AppIcon
        v-tooltip.top="t('document.flowAction.deleteAll')"
        class='cursor-pointer'
        name='delete_sweep'
        size='1.8'
        @click='deleteAll'>
      </AppIcon>
    </div>
    <Divider class='m-2'></Divider>
    <DataTable
      :row-class='()=>"tableRow"'
      row-hover
      scroll-height='calc(100vh - 27rem)'
      scrollable
      :value='chosenUserDeptRole'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>
          {{ t("document.flowAction.emptySelection") }}
        </span>
      </template>
      <Column
        body-class='col-5'
        :header='t("document.flowAction.userOrDeptReceive")'>
        <template #body='{ data: dataTemp }'>
          <div class='align-items-center flex gap-2'>
            <div>
              <AppUserDeptRole
                avatar-size='3'
                info-visible
                :infos="['roleName','deptName']"
                name-visible
                :user-dept-role='dataTemp'/>
            </div>
          </div>
        </template>
      </Column>
      <Column
        body-class='col-2'
        :header='t("document.flowAction.main")'>
        <template #body='{ data: dataTemp }'>
          <RadioButton
            class='flex'
            :model-value='dataTemp?.action'
            style='margin:auto'
            value='main'
            @update:model-value='mainHandleUpdate($event, dataTemp)'></RadioButton>
        </template>
      </Column>
      <Column
        body-class='col-2'
        :header='t("document.flowAction.coop")'>
        <template #body='{ data: dataTemp }'>
          <RadioButton
            class='flex'
            :model-value='dataTemp?.action'
            style='margin:auto'
            value='cooperative'
            @update:model-value='handleUpdateRadio($event, dataTemp)'></RadioButton>
        </template>
      </Column>
      <Column
        v-if='!hideReceiveToKnow'
        body-class='col-2'
        :header='t("document.flowAction.receiveToKnow")'>
        <template #body='{ data: dataTemp }'>
          <RadioButton
            class='flex'
            :model-value='dataTemp?.action'
            style='margin:auto'
            value='receiveToKnow'
            @update:model-value='handleUpdateRadio($event, dataTemp)'></RadioButton>
        </template>
      </Column>
      <Column
        body-class='col-1'>
        <template #body='{data:dataTemp}'>
          <AppIcon
            v-tooltip.top="t('common.delete')"
            class='actionButton cursor-pointer'
            name='delete'
            size='1.7'
            @click='deleteUser(dataTemp.id)'>
          </AppIcon>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';

defineProps({
  hideReceiveToKnow: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const chosenUserDeptRole = defineModel<(UserDeptRoleInput & {
  id: string,
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined
})[]>('chosenUserDeptRole', { default: [] });

function deleteAll() {
  chosenUserDeptRole.value = [];
}

function deleteUser(id: string) {
  chosenUserDeptRole.value = chosenUserDeptRole.value.filter(e => e.id !== id);
}

function mainHandleUpdate(value: 'main' | 'cooperative' | 'receiveToKnow', data: UserDeptRoleInput & { id: string }) {
  chosenUserDeptRole.value.forEach(e => {
    if (e.action === 'main') {
      e.action = undefined;
    }
    if (e.id === data.id) {
      e.action = 'main';
    }
  });
}

function handleUpdateRadio(value: 'main' | 'cooperative' | 'receiveToKnow', data: UserDeptRoleInput & { id: string }) {
  const element = chosenUserDeptRole.value.find(e => e.id === data.id);
  if (element) {
    element.action = value;
  }
}
</script>

<style scoped>
:deep(.tableRow) {
  .actionButton {
    opacity: 0;
  }
}

:deep(.tableRow:hover) {
  .actionButton {
    opacity: 1;
  }
}
</style>