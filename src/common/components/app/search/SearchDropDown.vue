<template>
  <OverlayPanel
    ref='op'
    append-to='body'
    class='border-1 border-round overflow-auto px-4 py-2 search-popup shadow-4 surface-border surface-card'
    :class='isRight && "right-0"'
    style='width: 55rem; max-height: 85vh'
    unstyled>
    <div>
      <div
        v-if='fields'
        class='form-search formgrid grid'>
        <div
          v-for='[key, field] in Object.entries(fields)'
          :key='key'
          :class="`col-${field.col} flex py-2 ${!field.isHidden ? 'p-1' : 'p-0'} ${!field.isCheckbox && 'flex-column'}`">
          <label
            v-if='!field.isCheckbox && !field.isHidden'
            class='mb-2'
            :for='key'
            :style='field.labelStyle || {}'>{{ field.label }}</label>
          <component
            :is='field.component'
            v-if='field.component'
            v-model='model[key]'
            v-bind='field.props'
            v-on='field.listener || {}'/>

          <TreeSelect
            v-else-if='field.optionsTreeSelect'
            v-model='model[key]'
            class='w-full'
            :empty-message="t('common.selectEmpty')"
            :filter='true'
            input-id='organizationParent'
            :options='field.optionsTreeSelect'
            :pt='{
              root: {
                style: {
                  "display": field.isHidden ? "none" : "flex"
                }
              }
            }'
            :selection-mode="field.isTreeSingleSelect ? 'single' : 'multiple'">
          </TreeSelect>

          <NamedDropdown
            v-else-if='field.optionsDropdown && !field.selectedEmployees'
            :id='key'
            v-model='model[key]'
            class='w-full'
            :filter='true'
            :is-hidden='field.isHidden'
            :is-multi-select='field.isMultiSelect'
            is-show-clear
            :name='key'
            option-label='name'
            option-value='id'
            :options='field.optionsDropdown'/>
          <NamedInputCalendar
            v-else-if='field.isDatePicker'
            :id='key'
            v-model='model[key]'
            class='w-full'
            icon-display='input'
            :is-hidden='field.isHidden'
            :name='key'
            :select-other-months='true'
            show-icon
            v-bind='field.props'>
            <template #additional>
              <div
                v-if='field.hasAdd'
                class='flex-1'>
                <InputGroupAddon
                  class='cursor-pointer'
                  @click.stop='toggleShowFilterDate'>
                  <InputIcon class='pi pi-filter'/>
                </InputGroupAddon>
              </div>
            </template>
          </NamedInputCalendar>
          <div
            v-else-if='field.isCheckbox'
            class='align-items-center flex gap-2 mt-2'>
            <Checkbox
              v-model='model[key]'
              :binary='true'/>
            <label :for='key'>{{ field.label }}</label>
          </div>
          <NamedSelectUser
            v-else-if='field.isChooseUser && !field.isMultiSelect'
            v-model='model[key]'
            :button-select-user='false'
            class='w-full'
            :is-hidden='field.isHidden'
            style='height: 40px'/>
          <NamedMultiSelectUser
            v-else-if='field.isChooseUser && field.isMultiSelect'
            v-model='model[key]'
            class='w-full'
            :is-hidden='field.isHidden'
            :select-max='3'
            :show-button-add='false'/>

          <Calendar
            v-else-if='field.selectedYear'
            v-model='model[key]'
            class='w-full'
            date-format='yy'
            view='year'/>

          <SplitButton
            v-else-if='field.isSplitButton'
            :disabled='fieldToAdd.length == 0'
            label='Thêm điều kiện'
            :model='fieldToAdd'/>
          <MultiSelect
            v-else-if='field.optionsDropdown && field.selectedEmployees'
            v-model='model[key]'
            class='w-full'
            :filter='true'
            option-label='fullName'
            option-value='id'
            :options='field.optionsDropdown as any[]'
            panel-class='custom-dropdown'>
            <template #option='slotProps'>
              <div class='align-items-center flex gap-2'>
                <AppAvatar
                  :avatar='generateAvatarUrl(slotProps.option.avatar)'
                  shape='square'
                  size='2.5'/>
                <div>
                  <p class='font-semibold mb-0'>{{ slotProps.option.fullName }}</p>
                  <div
                    v-if='slotProps.option.jobTitleName'
                    class='flex'>
                    <p class='mb-0 text-700 text-base'>{{ slotProps.option.jobTitleName }}</p>
                    <p class='border-l-2 mb-0 ml-2 text-700 text-base'>| {{ slotProps.option.organizationName }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </MultiSelect>

          <InputText
            v-else
            :id='key'
            v-model='model[key]'
            class='w-full'
            :hidden='field.isHidden'
            :name='key'/>
        </div>
      </div>
      <div class='flex gap-2 justify-content-end mt-2'>
        <ButtonIcon
          icon='search'
          icon-size='1'
          label='Thực hiện tìm'
          @click='handleSubmit()'/>
        <ButtonIcon
          icon='delete'
          icon-size='1'
          label='Xóa điều kiện'
          outlined
          severity='contrast'
          @click='$reset'/>
      </div>
    </div>
    <Menu
      ref='dateQuickFilterMenu'
      :model='datePresets'
      popup
      :pt="{
        action: {
          style: {
            fontWeight: '500',
            borderBottom: '1px solid #dcdcdc', // line nhẹ dưới mỗi item
            margin: '0.1rem 0.5rem',
          }
        },
      }"/>
  </OverlayPanel>
</template>

<script lang='ts' setup>
import moment from 'moment';
import { storeToRefs } from 'pinia';
import OverlayPanel from 'primevue/overlaypanel';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const op = ref<InstanceType<typeof OverlayPanel>>();

const isRight = defineModel('isRight', {
  type: Boolean,
  default: false
});

function toggle(event: MouseEvent) {
  op.value?.toggle(event);
  nextTick(() => correctSearchPopupPosition(event));
}

const {
  model,
  fields
} = storeToRefs(useGlobalSearchStore());
const {
  handleSubmit,
  $reset
} = useGlobalSearchStore();

function correctSearchPopupPosition(event: MouseEvent) {
  const popup = document.querySelector('.search-popup') as HTMLElement;
  if (popup) {
    const target = event.target as HTMLElement;
    popup.style.setProperty(
      'right',
      target.getBoundingClientRect().right - 500 + 'px',
    );
    popup.style.removeProperty('left');
    popup.style.setProperty('top', '3.75rem');
  }
}

let fieldToAdd = [{
  label: 'Ngày tạo',
  command: () => {
    fields.value ? fields.value['createDate'].isHidden = false : '';
    fieldToAdd = fieldToAdd.filter((field) => field.label != 'Ngày tạo');
  },
}, {
  label: 'Tên dự án',
  command: () => {
    fields.value ? fields.value['projectName'].isHidden = false : '';
    fieldToAdd = fieldToAdd.filter((field) => field.label != 'Tên dự án');
  },
},
{
  label: 'Mã dự án',
  command: () => {
    fields.value ? fields.value['projectCode'].isHidden = false : '';
    fieldToAdd = fieldToAdd.filter((field) => field.label != 'Mã dự án');
  },
},
{
  label: 'Loại dự án',
  command: () => {
    fields.value ? fields.value['projectType'].isHidden = false : '';
    fieldToAdd = fieldToAdd.filter((field) => field.label != 'Loại dự án');
  },
},
{
  label: 'Nhóm dự án',
  command: () => {
    fields.value ? fields.value['projectGroup'].isHidden = false : '';
    fieldToAdd = fieldToAdd.filter((field) => field.label != 'Nhóm dự án');
  },
},
{
  label: 'Cách tính tiến độ',
  command: () => {
    fields.value ? fields.value['recipe'].isHidden = false : '';
    fieldToAdd = fieldToAdd.filter((field) => field.label != 'Cách tính tiến độ');
  },
},
{
  label: 'Người tạo',
  command: () => {
    fields.value ? fields.value['creator'].isHidden = false : '';
    fieldToAdd = fieldToAdd.filter((field) => field.label != 'Người tạo');
  },
},
];

defineExpose({ toggle });

const dateQuickFilterMenu = ref();
const toggleShowFilterDate = (event: MouseEvent) => {
  dateQuickFilterMenu.value?.toggle(event);
};

const onQuickSelect = (range: [Date, Date] | null) => {
  if (!range) {
    return;
  }
  const [start, end] = range;
  model.value.fromDate = start;
  model.value.toDate = end;
};

const QUARTERS = [1, 2, 3, 4];
const datePresets = [
  {
    label: 'Hôm nay',
    command: () => onQuickSelect([
      moment().startOf('day').toDate(),
      moment().endOf('day').toDate()
    ])
  },
  {
    label: 'Hôm qua',
    command: () => onQuickSelect([
      moment().subtract(1, 'day').startOf('day').toDate(),
      moment().subtract(1, 'day').endOf('day').toDate()
    ])
  },
  {
    label: '7 ngày trước',
    command: () => onQuickSelect([
      moment().subtract(7, 'days').startOf('day').toDate(),
      moment().endOf('day').toDate()
    ])
  },
  {
    label: '30 ngày trước',
    command: () => onQuickSelect([
      moment().subtract(30, 'days').startOf('day').toDate(),
      moment().endOf('day').toDate()
    ])
  },
  {
    label: 'Tháng này',
    command: () => onQuickSelect([
      moment().startOf('month').toDate(),
      moment().endOf('month').toDate()
    ])
  },
  {
    label: 'Tháng trước',
    command: () => onQuickSelect([
      moment().subtract(1, 'month').startOf('month').toDate(),
      moment().subtract(1, 'month').endOf('month').toDate()
    ])
  },
  {
    label: 'Năm nay',
    command: () => onQuickSelect([
      moment().startOf('year').toDate(),
      moment().endOf('year').toDate()
    ])
  },
  {
    label: 'Năm trước',
    command: () => onQuickSelect([
      moment().subtract(1, 'year').startOf('year').toDate(),
      moment().subtract(1, 'year').endOf('year').toDate()
    ])
  },

  ...QUARTERS.map(q => ({
    label: `Quý ${q} năm nay`,
    command: () => onQuickSelect([
      moment().quarter(q).startOf('quarter').toDate(),
      moment().quarter(q).endOf('quarter').toDate()
    ])
  })),

  ...QUARTERS.map(q => ({
    label: `Quý ${q} năm trước`,
    command: () => onQuickSelect([
      moment().subtract(1, 'year').quarter(q).startOf('quarter').toDate(),
      moment().subtract(1, 'year').quarter(q).endOf('quarter').toDate()
    ])
  })),
];
</script>

<style scoped></style>
