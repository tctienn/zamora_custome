<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='`${t("ecm.group.membersInGroup")}: ${group.name}`'
    style='width: 75%;'
    @hide='emits("hide-dialog")'>

    <div class='column-gap-2 flex flex-row'>
      <Panel
        v-for='level in Object.keys(groupMembers)'
        :key='level'
        class='flex-1'
        :header='t(`admin.userGroup.types.${camelCase(level)}`)'>
        <div class='flex flex-column h-fit max-h-30rem overflow-y-scroll row-gap-3'>
          <div
            v-for='user in groupMembers[level]'
            :key='user.id'>
            <AppUser
              info-visible
              name-visible
              :user-id='user.id'/>
          </div>
        </div>
      </Panel>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { camelCase, groupBy } from 'lodash';
import { inject, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppUser from '@/common/components/app/AppUser.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import type { Group } from '@/common/model/group';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
});

const emits = defineEmits(['hide-dialog']);

const { t } = useI18n();

const memberDialogFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};
provide('dialogFooterButtons', memberDialogFooterButtons);

const group = inject('group', ref<Group>({} as Group));

const groupMembers = groupBy(group.value.users, 'level');

const visible = ref(props.dialogVisible);

</script>

<script lang='ts'>
export default { name: 'EcmGroupMemberDialog' };
</script>