<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('meeting.meeting.selectSubstituteParticipant')"
    :style=" { width: '30vw'}"
    @hide="emits('hide-dialog')">
    <div>
      <div class='font-bold mb-6'>
        <div class='align-items-center flex gap-5 mb-3'>
          <div class='align-items-center flex'>
            <RadioButton
              v-model='checked'
              input-id='ingredient1'
              name='pizza'
              value='dept'/>
            <label
              class='ml-2'
              for='ingredient1'>{{ t(`vehicle.bookingCar.dept`) }}</label>
          </div>
          <div class='align-items-center flex'>
            <RadioButton
              v-model='checked'
              input-id='ingredient2'
              name='pizza'
              value='all'/>
            <label
              class='ml-2'
              for='ingredient2'>{{ t(`common.all`) }}</label>
          </div>
        </div>

        <NamedSelectUser
          v-model='substituteParticipant'
          :button-select-user='false'
          class='w-full'
          name='substituteParticipant'
          :options='checked === "dept" ? getUserInSameOrg() : undefined'
          :selected-user-ids='[substituteParticipant]'
          style='height: 40px'/>
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 100%; left: 0; z-index: 1000'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='submit'/>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { deleteSubstituteParticipant, saveSubstituteParticipant } from '@/apps/meeting/graphql/substitute-participant';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: '',
  },
  substituteParticipant: {
    type: String,
    default: null,
  }
});

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visible = ref(props.visible);
const checked = ref('dept');

const substituteParticipant = ref(props.substituteParticipant);
const { user } = useUserStore();

const listOrg = ref<OrganizationInterface[]>([]);
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();

getAllOrganizationResult((response) => {
  listOrg.value = get(response, 'data.allOrganizationPublic', []);
});

const getUserInSameOrg = () => {
  return listOrg.value
    .filter(org => org.users?.some(u => u.id === user.id))
    .flatMap(org => org.users)
    .filter(u => u.id !== user.id);
};

const {
  mutate,
  onDone
} = saveSubstituteParticipant();

const {
  mutate: deleteSubstituteParticipantMutate,
  onDone: deleteSubstituteParticipantDone
} = deleteSubstituteParticipant();

const submit = () => {
  if (substituteParticipant.value) {
    mutate({
      meetingId: props.id,
      substituteParticipant: substituteParticipant.value
    });
  } else {
    deleteSubstituteParticipantMutate({ meetingId: props.id });
  }

};

onDone(() => {
  emits('hide-dialog');
});

deleteSubstituteParticipantDone(() => {
  emits('hide-dialog');
});

</script>

<style scoped>

</style>