<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("admin.organization.dissolution")'
    @hide='emits("hide-dialog")'>
    <form
      ref='form'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='organizationCode'>{{ t('admin.organization.dissolutionDay') }}</label>
            <NamedInputCalendar
              id='dissolutionDate'
              v-model='dissolutionDate'
              name='dissolutionDate'
              :select-other-months='true'
              show-icon/>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='organizationCode'>{{ t('admin.organization.dissolutionReason') }}</label>
            <Textarea
              id='reason'
              name='reason'
              :placeholder='t("admin.organization.dissolutionReason")'
              rows='3'/>
          </div>
        </div>

        <div class='uploadFile'>
          <AppUpload
            ref='contractUpload'
            mode='basic'
            name='fileAttach'
            path=''
            :show-name-file='true'/>
        </div>
      </div>
    </form>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveActionIntoOrganizationHistory } from '@/apps/admin/api/rest/organizationApi';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<OrganizationFormProps>(), {
  visibleDialogDissolution: false,
  item: undefined,
});

const emits = defineEmits(['hide-dialog', 'reload']);
let form = ref();
const dissolutionDate = ref();
const { t } = useI18n();

const organizationFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'submit',
    command: () => submit()
  }
};
provide('dialogFooterButtons', organizationFormFooterButtons);

interface OrganizationFormProps {
    visibleDialogDissolution: boolean,
    item: OrganizationInterface,
}

const visible = ref(props.visibleDialogDissolution);

function submit() {
  const formData = new FormData(form.value);
  if (formData.get('dissolutionDate') == '') {
    toastError({ message: t('admin.organization.errors.dissolutionDateCanNotEmpty') });
    return;
  }

  if (formData.get('reason') == '') {
    toastError({ message: t('admin.organization.errors.reasonDissolutionCanNotEmpty') });
    return;
  }
  formData.append('organizationId', props.item.id);
  formData.append('organizationName', props.item.name);
  formData.append('type', Volatility.DISSOLUTION);
  saveActionIntoOrganizationHistory(formData).then((res) => {
    toastSuccess({ message: t('admin.organization.message.dissolutionSuccess') });
    emits('reload');
    emits('hide-dialog');
  }).catch((err) => {
    toastError({ message: t('admin.organization.errors.canNotDissolve') });
  });
}

enum Volatility {
    ESTABLISH = 'ESTABLISH',
    DISSOLUTION = 'DISSOLUTION',
    JOINING = 'JOINING',
    SEPARATE = 'SEPARATE',
    RENAME = 'RENAME',
}
</script>

<script lang='ts'>
export default { name: 'DissolutionDialog' };
</script>