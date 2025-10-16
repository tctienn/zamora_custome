<template>
  <div>
    <div class='flex justify-content-between'>
      <div class='align-items-center'>
        <h4>{{ props.title }}</h4>
      </div>
      <div class='align-items-center flex gap-1 mb-2'>
        <InputText
          v-model='search'
          :placeholder='"Tìm kiếm"'
          @keydown.enter="emits('on-search',search||'')">

        </InputText>

        <!--      <ButtonIcon-->
        <!--        v-tooltip.top='t("work.project.createFolder")'-->
        <!--        icon='create_new_folder'-->
        <!--        icon-size='2'-->
        <!--        text-->
        <!--        @click='emits("create-folder")'/>-->

        <AppIcon
          v-if='!disableModify'
          v-tooltip.top='t("work.project.uploadFile")'
          class='border-round cursor-pointer hover:surface-hover p-1'
          name='post_add'
          size='2'
          @click='emits("upload-file")'/>

        <AppIcon
          v-if='!disableModify'
          v-tooltip.top='t("work.task.detail.document.uploadFromMyBox")'
          class='border-round cursor-pointer hover:surface-hover p-1'
          name='cloud_upload'
          size='2'
          @click='emits("ecm-upload")'/>

        <AppIcon
          v-if='!disableModify'
          v-tooltip.top='t("work.task.detail.document.chooseFromDocument")'
          class='border-round cursor-pointer hover:surface-hover p-1'
          name='upload_file'
          size='2'
          @click='emits("document-upload")'/>

        <AppIcon
          v-tooltip.top='t("work.task.detail.document.filter.this")'
          class='border-round cursor-pointer hover:surface-hover p-1'
          name='filter_alt'
          size='2'
          @click='filterAction'/>

        <ButtonGroup>
          <ButtonIcon
            icon='menu'
            :outlined='!(viewType == "list")'
            @click='viewType= "list"'/>
          <ButtonIcon
            icon='view_cozy'
            :outlined='!(viewType == "grid")'
            @click='viewType="grid"'/>
        </ButtonGroup>
      </div>
    </div>
    <Menu
      ref='menuFilterRef'
      :model='menuFilter'
      popup>
      <template #item='{item: item}'>
        <div>
          <MenuItem
            :icon='item.icon'
            :label='item.label'
            :style-icon='{
              opacity: item.key == filter ? 1 : 0
            }'/>
        </div>
      </template>
    </Menu>
  </div>
</template>

<script lang='ts' setup>
import type Menu from 'primevue/menu';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { OriginType } from '@/apps/work/model/taskAttachment';
import MenuItem from '@/common/components/custom/MenuItem.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
});
const emits = defineEmits<{
  (e: 'create-folder',): void,
  (e: 'upload-file'): void,
  (e: 'ecm-upload'): void,
  (e: 'document-upload'): void,
  (e: 'on-search', searchTerm: string): void,
  (e: 'filter-file', filter: string): void,
}>();
const disableModify = inject('disableModify', ref<boolean>());
const { t } = useI18n();
type ViewType = 'list' | 'grid'
const viewType = defineModel<ViewType>('viewType', { default: 'list' });

const search = ref<string>();
type FilterType = 'ALL' | OriginType
const filter = ref<FilterType>('ALL');
const menuFilter = ref([
  {
    label: t('work.task.detail.document.filter.all'),
    key: 'ALL',
    icon: 'check',
    command: () => {
      filter.value = 'ALL';
      emits('filter-file', 'ALL');
    }

  },
  {
    label: t('work.task.detail.document.filter.upload'),
    key: 'UPLOAD',
    icon: 'check',
    command: () => {
      filter.value = OriginType.UPLOAD;
      emits('filter-file', OriginType.UPLOAD);
    }
  },
  {
    label: t('work.task.detail.document.filter.document'),
    key: 'DOCUMENT',
    icon: 'check',
    command: () => {
      filter.value = OriginType.DOCUMENT;
      emits('filter-file', OriginType.DOCUMENT);
    }
  },
  {
    label: t('work.task.detail.document.filter.ecm'),
    key: 'ECM',
    icon: 'check',
    command: () => {
      filter.value = OriginType.ECM;
      emits('filter-file', OriginType.ECM);
    }
  },
  {
    label: t('work.task.detail.document.filter.comment'),
    key: 'COMMENT',
    icon: 'check',
    command: () => {
      filter.value = OriginType.COMMENT;
      emits('filter-file', OriginType.COMMENT);
    }
  },
  {
    label: t('work.task.detail.document.filter.report'),
    key: 'REPORT',
    icon: 'check',
    command: () => {
      filter.value = OriginType.REPORT;
      emits('filter-file', OriginType.REPORT);
    }
  },
  {
    label: t('work.task.detail.document.filter.evaluate'),
    key: 'EVALUATE',
    icon: 'check',
    command: () => {
      filter.value = OriginType.EVALUATE;
      emits('filter-file', OriginType.EVALUATE);
    }
  }
]);
const menuFilterRef = ref<InstanceType<typeof Menu> | null>(null);

function filterAction(event: Event) {
  menuFilterRef.value?.toggle(event);

}

</script>

<style scoped>

</style>