<template>
  <Tree
    v-if='cateDataTree'
    :expanded-keys='expandedKeys'
    :pt='{
      root: {
        class: "w-full p-1 border-0"
      },
      label: {
        class: "w-full font-normal"
      }
    }'
    selection-mode='single'
    :value='cateDataTree'>
    <template
      #default='slotProp'>
      <div class='align-items-center flex font-bold justify-content-between tree-row w-full'>
        <span class='text-label'>{{ slotProp.node.label }}</span>
        <Button
          v-if='isEdit'
          v-tooltip="'Xóa'"
          class='btn-delete p-button-text text-red'
          icon='pi pi-trash'
          @click='remove(slotProp.node.label)'/>
      </div>
    </template>
  </Tree>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import {
  deleteEmployeeProfessionalSkill,
  getEmployeeProfessionalSkillsBySnapshotId
} from '@/apps/hrm/api/graphql/employee-professional-skills';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const skillsRaw = ref<any>([]);
const employeeSkills = ref<string[]>([]);

onMounted(() => {
  getAllCategory(userDeptRole.value, CATEGORY_TYPE.PROFESSIONAL_SKILLS).onResult((res) => {
    skillsRaw.value = res.data.getAllCategory;
  });

  getEmployeeProfessionalSkillsBySnapshotId(props.snapshotId).onResult((res) => {
    employeeSkills.value = res.data.getEmployeeProfessionalSkillsBySnapshotId.listProfessionalSkills;
  });

  expandAll();
});

const skills = computed(() => {
  return skillsRaw.value.filter((item: any) => employeeSkills.value.includes(item.name));
});

const cateDataTree = computed(() => buildTree(skills.value));

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

const confirm = useConfirm();
const {
  mutate: deleteEmployeeProfessionalSkillMutate,
  onDone: deleteEmployeeProfessionalSkillOnDone
} =
  deleteEmployeeProfessionalSkill();

const remove = (name: string | undefined) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: name, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleProfessionalSkill(name);
    },
  });
};

const handleProfessionalSkill = (name: string | undefined) => {
  deleteEmployeeProfessionalSkillMutate({
    snapshotId: props.snapshotId,
    professionalSkill: name
  });
};

deleteEmployeeProfessionalSkillOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  getEmployeeProfessionalSkillsBySnapshotId(props.snapshotId).onResult((res) => {
    employeeSkills.value = res.data.getEmployeeProfessionalSkillsBySnapshotId.listProfessionalSkills;
  });
});

const expandedKeys = ref<Record<string, boolean>>({});
const expandAll = () => {
  for (let node of cateDataTree.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};

const expandNode = (node: any) => {
  if (node.children && node.children.length) {
    expandedKeys.value[String(node.key)] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};
</script>

<style scoped>

.btn-delete {
  visibility: hidden;
}

.tree-row:hover {
  .btn-delete {
    visibility: visible;
  }
}

:deep(.p-treenode-children .text-label) {
  font-weight: 500;
}
</style>