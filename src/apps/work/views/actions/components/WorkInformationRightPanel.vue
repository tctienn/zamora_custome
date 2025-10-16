<template>
  <div class='flex flex-column w-17rem'>
    <h5>{{ t('work.addInformation') }}</h5>
    <div class='flex flex-column gap-2 h-full justify-content-between'>
      <div class='flex flex-column'>
        <div class='flex flex-column max-h-30rem overflow-y-auto right-information-panel row-gap-2'>
          <div
            v-for='(field, index) in fields'
            :key='index'
            class='column-gap-2 flex flex-row'>
            <div
              v-if='field.type'
              class='border-1 border-round cursor-pointer hover:border-primary px-2 py-1 relative surface-border'
              :class='{"bg-primary": taskFields.includes(field.fieldName), "p-disabled": !permission.isUpdateInfo}'
              @click='toggleField(field)'>
              <span>{{ field.name }}</span>
            </div>

            <div
              v-else
              class='border-1 border-round cursor-pointer hover:border-primary px-2 py-1 relative surface-border'
              :class='{"bg-primary": taskFields.includes(field.fieldName), "p-disabled": !permission.isUpdateInfo}'
              @click='toggleField(field)'>
              <span>{{ field.name }}</span>
            </div>

            <ButtonIcon
              v-if='taskFields.includes(field.fieldName) && permission.isUpdateInfo'
              v-tooltip='t("common.remove")'
              class='align-self-center'
              icon='do_not_disturb_on'
              icon-size='1.25'
              rounded
              severity='danger'
              text
              @click='toggleField(field)'/>
          </div>
        </div>
        <div class='align-self-end'>
          <span
            class='cursor-pointer font-italic hover:underline opacity-80'
            @click='showAllFields = !showAllFields'>
            {{ toLower(t(`common.${showAllFields ? 'collapse' : 'viewMore'}`)) }}
          </span>
        </div>
      </div>

      <div
        v-if='showAction'
        class='flex flex-column gap-2'>
        <template
          v-for='(action, index) in filterActions'
          :key='index'>
          <Button
            class='py-1'
            :label='t(`work.actions.${action}`)'
            outlined
            @click='showDialog(action)'/>
        </template>
      </div>
    </div>

  </div>
</template>

<script lang='ts' setup>
import { map, take, toLower } from 'lodash';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Property, PropertyType } from '@/apps/admin/model/object/Property';
import { getObjectPropertiesGraphql } from '@/apps/work/api/graphql/object-template-api';
import { TASK_OPTIONAL_FIELD } from '@/apps/work/constants';
import { allPermissionTask, type PermissionTask } from '@/apps/work/model/permission';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastError } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  taskFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  showAction: {
    type: Boolean,
    default: () => false
  },
  permission: {
    type: Object as PropType<PermissionTask>,
    default: allPermissionTask
  },
});
const emits = defineEmits(['update-task-optional-fields', 'update-task-dynamic-fields']);

const FIELD_DISPLAY = 5;
const showAllFields = ref(false);

const { t } = useI18n();

type Field = {
  name: string
  fieldName: string
  type: PropertyType | null
}
const dynamicFields = ref<Property[]>([]);
const allFields = computed((): Field[] => [...map(TASK_OPTIONAL_FIELD, (field) => ({
  name: t(`work.${field}`),
  fieldName: field,
  type: null
})), ...dynamicFields.value]);
const fields = computed(() => showAllFields.value ? allFields.value : take(allFields.value, FIELD_DISPLAY));
const actions = computed((): { [key: string]: boolean } => {
  return {
    updateProgress: props.permission?.isUpdateResult,
    expense: props.permission?.isUpdateExpense,
    delete: props.permission?.isDelete,
    copy: props.permission?.isCopy,
    viewHistory: props.permission?.isViewHistory,
    evaluate: props.permission?.isEvaluate,
    setting: props.permission?.isConfigure,
    deadline: props.permission?.isChangeDeadline,
  };
});
const filterActions = computed(() => Object.keys(actions.value).filter(k => actions.value[k]));
const {
  onResult: getObjectPropertyOnResult,
  onError: getObjectPropertyOnError
} = getObjectPropertiesGraphql();

getObjectPropertyOnResult(res => {
  dynamicFields.value = res.data.getObjectProperties;
});

getObjectPropertyOnError(res => {
  toastError();
});

function showDialog(action: string) {
  EventBus.emit('showActionDialog', action);
}

function toggleField(field: Field) {
  if (props.permission?.isUpdateInfo) {
    field.type
      ? emits('update-task-dynamic-fields', field)
      : emits('update-task-optional-fields', field.fieldName);
  }
}
</script>

<script lang='ts'>
export default { name: 'WorkInformationRightPanel' };
</script>

<style lang='scss' scoped>
:deep(.right-information-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>