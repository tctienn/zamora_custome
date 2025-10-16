<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    header='Kỹ năng chuyên môn'
    style='max-height: 70vh'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='h-20rem'>
        <Tree
          v-model:selectionKeys='selectedKey'
          selection-mode='checkbox'
          :value='cateDataTree'></Tree>
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='submitForm'
          @click='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import {
  getEmployeeProfessionalSkillsBySnapshotId,
  saveEmployeeProfessionalSkills
} from '@/apps/hrm/api/graphql/employee-professional-skills';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  snapshotId: {
    type: String,
    default: null
  },
});

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const submitForm = ref(false);
const selectedKey = ref<any>();

const {
  mutate: saveEmployeeProfessionalSkillsMutate,
  onDone: saveEmployeeProfessionalSkillsDone
} =
  saveEmployeeProfessionalSkills();

const submit = () => {
  saveEmployeeProfessionalSkillsMutate({
    snapshotId: props.snapshotId,
    payload: {
      snapshotId: props.snapshotId,
      listProfessionalSkills: convertToList(selectedKey.value)
    }
  });
};

saveEmployeeProfessionalSkillsDone(() => {
  toastSuccess({ message: 'Lưu thành công.' });
  emits('hide-dialog');
});

const skills = ref([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
getAllCategory(userDeptRole.value, CATEGORY_TYPE.PROFESSIONAL_SKILLS).onResult((res) => {
  skills.value = res.data.getAllCategory;
});

getEmployeeProfessionalSkillsBySnapshotId(props.snapshotId).onResult((res) => {
  selectedKey.value = convertToObject(res.data.getEmployeeProfessionalSkillsBySnapshotId.listProfessionalSkills);
});

const cateDataTree = computed(() => {
  return buildTree(skills.value);
});

const buildTree = (data: any[]) => {
  const codeMap: Record<string, any> = {};
  const tree: any[] = [];

  data.forEach(item => {
    codeMap[item.code] = {
      key: item.name,
      label: item.name,
      data: item.name,
      children: []
    };
  });

  data.forEach(item => {
    const node = codeMap[item.code];
    if (item.parentCode && codeMap[item.parentCode]) {
      codeMap[item.parentCode].children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
};

const convertToList = (obj: Record<string, { checked: boolean; partialChecked: boolean }>) => {
  return Object.keys(obj).filter(key => obj[key].checked);
};

const convertToObject = (list: string[]) => {
  const obj: Record<string, { checked: boolean; partialChecked: boolean }> = {};
  list.forEach(item => {
    obj[item] = {
      checked: true,
      partialChecked: false
    };
  });
  return obj;
};
</script>

<style scoped>

</style>