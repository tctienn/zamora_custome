<template>
  <input
    ref='input'
    :name='$props.name'
    type='hidden'
    :value='$attrs.modelValue'/>

  <Dropdown
    class='w-full'
    :disabled='disableFlow'
    :editable='isEditable'
    :pt="{
      root: {
        style: {
          'display': $props.isHidden ? 'none' : 'flex'
        }
      }
    }"
    :show-clear='isShowClear'
    v-bind='$attrs'>
    <template #option='slotProps'>
      <div class='flex gap-2'>
        <HrmAvatar
          :avatar='generateAvatarUrl(slotProps.option?.avatar)'
          class='border-round-sm cursor-pointer'
          width='2rem'/>
        <div
          class='overflow-hidden'
          :class='`w-${widthOption}rem`'>
          <div class='font-bold'>
            {{ slotProps.option?.fullName }}
          </div>
          <div class='text-sm'>
            {{
              [
                slotProps.option.positionName,
                slotProps.option.jobTitleName,
                slotProps.option.organizationName
              ].filter(v => v && v.trim() !== '').join(' | ')
            }}
          </div>
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<script>
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

export default {
  name: 'NamedDropdownUserInfo',
  components: { HrmAvatar },

  props: {
    widthOption: {
      type: Number,
      default: 30
    },

    name: {
      type: String,
      default: '',
      required: true,
    },

    isEditable: {
      type: Boolean,
      default: false
    },

    isShowClear: {
      type: Boolean,
      default: false,
    },

    isMultiSelect: {
      type: Boolean,
      default: false,
    },

    disableFlow: {
      type: Boolean,
      default: false
    },

    isHidden: {
      type: Boolean,
      default: false
    }
  },

  methods: { generateAvatarUrl },
};
</script>

<style scoped>
</style>
