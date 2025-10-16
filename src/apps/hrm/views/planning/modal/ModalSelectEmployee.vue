<template>
  <Dialog
    v-model:visible='visible'
    class='overflow-hidden w-8'
    :header='t("hrm.planning.addEmployee")'
    modal
    :pt="{
      content: {
        class: 'w-full'
      }
    }"
    @hide='handleClose'>
    <div class='flex gap-3 select-block'>
      <div class='border-1 border-300 border-round-sm col-6 pt-1'>
        <HrmTree
          ref='treeRef'
          class='border-none tree-block'
          scroll-height='calc(100vh - 14.25rem)'
          :undefined-organization='t("hrm.profile.notAssigned")'/>
      </div>
      <div class='col-6 emp-block overflow-x-scroll p-0'>
        <div class='bg-white p-3 pb-2 sticky top-0 z-10'>
          <InputText
            v-model='searchKeyword'
            class='p-inputtext-sm w-full'
            placeholder='Tìm theo tên nhân viên'/>
        </div>
        <LoadingSkeleton v-if='loading'/>

        <template v-else>
          <div
            v-for='item in filteredEmployees'
            :key='item.id'
            class='align-items-center flex gap-2 my-3 px-3'>
            <Checkbox
              v-model='selectedItems'
              :input-id="'chk-' + item.id"
              :value='item'/>
            <AppAvatar
              :avatar='generateAvatarUrl(item.avatar)'
              :fit='true'
              :label='extractAvatarLabel(item.fullName)'
              shape='square'
              size='2.5'
              style='min-width: 2.5rem'/>
            <div>
              <label :for="'chk-' + item.id">{{ item.fullName }}</label>
              <p
                class='mb-0 text-sm'
                style='min-height: 18px'>{{ item.positionName }} <span
                  v-if='item.organizationName'>| {{ item.organizationName }}</span></p>
            </div>
          </div>
        </template>

      </div>
    </div>

    <template #footer>
      <Button
        class='border-round-sm'
        icon='pi pi-times'
        label='Hủy'
        severity='danger'
        @click='handleClose'/>
      <Button
        class='border-round-sm'
        icon='pi pi-check'
        label='Đồng ý'
        @click='submit'/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAllEmployees } from '@/apps/hrm/api/graphql/employee';
import LoadingSkeleton from '@/apps/hrm/components/LoadingSkeleton.vue';
import HrmTree from '@/apps/hrm/components/tree/HrmTree.vue';
import type { EmployeeSummary } from '@/apps/hrm/model/employee';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { extractAvatarLabel } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['update:employee', 'close']);
const { t } = useI18n();

const visible = defineModel<boolean>('visible', { default: false });
const organizationId = inject('organizationId', ref<string>());
const loading = ref(true);

const employees = ref<EmployeeSummary[]>([]);
const selectedItems = ref<any[]>([]);
const searchKeyword = ref('');
const debouncedSearch = ref('');

function removeVietnameseTones(str: string): string {
  return str.trim()
    .normalize('NFD') // chuyển ký tự có dấu thành tổ hợp (ví dụ: "ế" -> "e" + "́")
    .replace(/[\u0300-\u036f]/g, '') // xóa các dấu tổ hợp
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase(); // cho đồng nhất chữ thường
}

const filteredEmployees = computed(() => {
  let list = employees.value;
  if (selectedDeptKeys.value.length) {
    list = list.filter(e => selectedDeptKeys.value.includes(e.organizationId ?? ''));
  }

  if (debouncedSearch.value) {
    list = list.filter((e) =>
      removeVietnameseTones(e.fullName || '').includes(
        removeVietnameseTones(debouncedSearch.value)
      )
    );
  }

  return list;
});

const store = useHrmProfileStore();
const selectedDeptKeys = ref<string[]>([]);

function getAllChildKeys(tree: any[], parentKey: string) {
  const result: string[] = [];

  function findAndCollect(node: any) {
    if (node.key === parentKey) {
      collect(node);
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (findAndCollect(child)) {
          return true;
        }
      }
    }
    return false;
  }

  function collect(node: any) {
    result.push(node.key);
    if (node.children && node.children.length) {
      node.children.forEach(collect);
    }
  }

  tree.forEach((n) => findAndCollect(n));
  return result;
}

watch(organizationId, (value) => {
  if (value) {
    selectedDeptKeys.value = getAllChildKeys(store.treeUnitData, value);
  } else {
    selectedDeptKeys.value = [];
  }

});

watch(
  searchKeyword,
  debounce((val) => {
    debouncedSearch.value = val;
  }, 300) // 300ms delay
);

const submit = () => {
  emit('update:employee', selectedItems.value);
  emit('close');
};
const handleClose = () => {
  visible.value = false;
  emit('close');
  selectedItems.value = [];
};

onMounted(async () => {
  loading.value = true;
  try {
    const result = await findAllEmployees('').refetch();
    employees.value = result?.data?.findAllEmployees.filter(
      (e: EmployeeSummary) => e.status !== 'LEAVE' && e.status !== 'RETIREMENT'
    ) || [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
}

.select-block {
  background: var(--bg-white-custom);
  border-radius: 8px;
  height: 650px;
  margin: auto;
  width: 100%;
}

.tree-block, .emp-block {
  height: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
}

.emp-block {
  overflow-y: auto;
}

.tree-block {
  overflow-y: hidden;
}

.sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding-bottom: 0.5rem;
}

</style>
