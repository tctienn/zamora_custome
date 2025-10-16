<template>
  <div class='named-multi-select'>
    <input
      ref='input'
      :name='$props.name'
      type='hidden'
      :value='$attrs.modelValue'>
    <MultiSelect
      v-bind='$attrs'>
      <template #option='slotProps'>
        <div class='flex gap-2'>
          <HrmAvatar
            :avatar='generateAvatarUrl(slotProps.option?.avatar)'
            class='border-round-sm cursor-pointer'
            width='2rem'/>
          <div
            class='overflow-hidden'>
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
    </MultiSelect>
  </div>

</template>

<script>
import { OrganizationType } from '@/apps/document/model/organization';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import AdministrationTree from '@/apps/work-flow/views/components/OrganizationTree/AdministrationTree.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

export default {
  name: 'NamedMultiSelectEmployee',
  components: { HrmAvatar },

  props: {
    name: {
      type: String,
      default: '',
      required: true
    },
  },

  computed: {
    AdministrationTree() {
      return AdministrationTree;
    },

    OrganizationType() {
      return OrganizationType;
    }
  },

  methods: { generateAvatarUrl },
};
</script>

<style scoped>

</style>