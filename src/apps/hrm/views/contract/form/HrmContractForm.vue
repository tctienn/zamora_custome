<template>
  <form ref='formRef'>
    <Accordion
      :active-index='[0, 1, 2]'
      multiple>
      <AccordionTab :header='t("hrm.contract.general.title")'>
        <HrmContractGeneralForm :model-value='model'/>
      </AccordionTab>
      <AccordionTab :header='t("hrm.contract.salary.title")'>
        <HrmContractSalaryForm :model-value='model?.salary'/>
      </AccordionTab>
      <AccordionTab :header='t("hrm.contract.attachment")'>
        <Button
          class='border-round-sm mb-2 min-w-max'
          icon='pi pi-upload'
          :label='t("common.upload")'
          @click='showModalAttachment = true'/>
        <HrmContractAttachFilesTable
          :attachment='model.attachments'
          :is-detail='false'
          @show-action-menus='showActionMenus'/>

      </AccordionTab>
    </Accordion>
  </form>
  <AddAttachmentModal
    v-model:visible='showModalAttachment'
    :data='fileEdited'
    @close='showModalAttachment = false'
    @update:file='handleFileUpload'/>

  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
</template>

<script lang='ts' setup>

import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createContract, updateContract } from '@/apps/hrm/api/rest/contract';
import type { EmployeeAttachment, } from '@/apps/hrm/model/attachment';
import type { Contract } from '@/apps/hrm/model/contract';
import AddAttachmentModal from '@/apps/hrm/views/contract/dialog/AddAttachmentModal.vue';
import HrmContractGeneralForm from '@/apps/hrm/views/contract/form/HrmContractGeneralForm.vue';
import HrmContractSalaryForm from '@/apps/hrm/views/contract/form/HrmContractSalaryForm.vue';
import HrmContractAttachFilesTable from '@/apps/hrm/views/contract/list/HrmContractAttachFilesTable.vue';

const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<Contract>,
  default: (): Contract => ({
    employeeId: '',
    code: '',
    type: '',
    organization: '',
    organizationName: '',
    jobTitle: '',
    jobTitleName: '',
    effectiveDate: '',
    isContractConcurrent: false,
    files: [],
    position: ''
  })
});
const formRef = ref<HTMLFormElement>();
const actionMenus = ref<MenuItem[]>([]);
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const showModalAttachment = ref(false);

// const fileEdited = ref({
//   name: '',
//   file: null as File | null,
// );
const fileEdited = ref({} as EmployeeAttachment);

function submitForm() {
  console.log(model.value, 'model');
  if (formRef.value) {
    const data = new FormData(formRef.value);

    if (Array.isArray(model.value?.attachments) && model.value?.attachments.length > 0) {
      model.value?.attachments.forEach((item, index) => {
        data.append(`attachments[${index}].name`, item.name ?? '');
        if (item.file) {
          data.append(`attachments[${index}].file`, item.file);
          if (model.value.id && item.id) {
            data.append(`attachments[${index}].id`, item.id || '');
          }
        }
      });
    }

    if (model.value.id) {
      return updateContract(model.value.id, data);
    } else {
      return createContract(data);
    }
  } else {
    return Promise.reject();
  }
}

const showActionMenus = (event: Event, index: number) => {
  actionMenus.value = [
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => {
        const file = model.value.attachments?.[index];
        if (file) {
          fileEdited.value = file;
        }
        // fileEdited.value = {
        //   name: model.value.attachments?.[index]?.name || '',
        //   file: model.value.attachments?.[index]?.file || null
        // };
        showModalAttachment.value = true;
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        if (model.value.attachments && model.value.attachments[index]) {
          model.value.attachments.splice(index, 1);
        }
        // Optionally, you can also handle the case where the file is not found
        // console.warn(`File at index ${index} not found.`);
      }
    }
  ];
  actionMenusRef.value?.toggle(event);
};

const handleFileUpload = (data: { name: string; file: File | null }) => {
  if (!model.value) {
    return;
  }

  const newAttachments: EmployeeAttachment[] = [
    ...model.value.attachments ?? [],
    {
      name: data.name,
      file: data.file ?? undefined
    }
  ];

  // Clone toàn bộ contract và gán lại
  model.value = {
    ...model.value,
    attachments: newAttachments
  };

  showModalAttachment.value = false;
};

onMounted(() => {
  if (model.value.attachments === undefined) {
    model.value.attachments = [];
  }
});
defineExpose({ submitForm });
</script>

<style scoped>

</style>
