<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    header='Nhãn cho phòng ban'
    @hide='emits("hide-dialog")'>
    <div class='flex flex-column gap-2'>
      <label class='font-semibold'>Nhãn</label>
      <!--      <MultiSelect-->
      <!--        v-model='selectedTags'-->
      <!--        class='w-full'-->
      <!--        display='chip'-->
      <!--        option-label='labelTitle'-->
      <!--        :option-value='optionValue'-->
      <!--        :options='tags'-->
      <!--        placeholder='Chọn nhãn'>-->
      <!--      </MultiSelect>-->

      <Chips
        v-model='selectedTags'
        class='tags'/>
    </div>

    <template #footer>
      <Button
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-check'
        :label="t('common.save')"
        @click='saveLabels'/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllLabelGraphql } from '@/apps/work/api/graphql/label-api';
import type { Label } from '@/apps/work/model/taskLabel';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  selectedLabels: {
    type: Array as PropType<string[]>,
    default: () => []
  }
});

const emits = defineEmits(['hide-dialog', 'save-label']);

const visible = ref(props.visibleDialog);

const { t } = useI18n();
const tags = ref<Label[]>([]);
const selectedTags = ref<string[]>(cloneDeep(props.selectedLabels));

function showDialog() {
  selectedTags.value = cloneDeep(props.selectedLabels);
}

getAllLabelGraphql().onResult((res) => {
  tags.value = res.data.getAllLabel;
});

function saveLabels() {
  emits('save-label', selectedTags.value);
  emits('hide-dialog');
}

function optionValue(data: Label) {
  return {
    id: data.id,
    labelColor: data.labelColor,
    labelTitle: data.labelTitle
  };
}
</script>

<style scoped>
:deep(.tags > ul){
  width: 100%
}
</style>

<script lang="ts">
export default { name: 'OrganizationTag' };
</script>