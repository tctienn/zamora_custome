<template>
  <Toolbar class='profile-toolbar'>
    <template #start>
      <div class='flex flex-col gap-1 toolbar-start'>
        <div class='flex gap-1 profile-title'>
          <Button
            v-if="profileStatus === 'DRAFT'"
            class='action-btn'
            icon='pi pi-trash'
            :label="t('common.delete')"
            :loading='isSubmitting'
            severity='danger'
            @click="$emit('send-to-delete')"/>
          <Button
            v-if="profileStatus === 'DRAFT'"
            class='action-btn'
            icon='pi pi-send'
            :label="t('common.sendToApprove')"
            :loading='isSubmitting'
            severity='success'
            @click="$emit('send-to-approve')"/>

          <Button
            v-if="profileStatus !== 'OLD'"
            class='action-btn text-white'
            :disabled='(hasPending || hasDraft) && profileStatus !== "DRAFT"'
            icon='pi pi-file-edit'
            :label='editButtonLabel'
            @click="$emit('edit-profile')"/>
          <Button
            class='action-btn'
            icon='pi pi-print'
            :label="t('hrm.profile.printProfile')"
            severity='secondary'
            @click="$emit('toggle-print', $event)"/>
        </div>
      </div>
    </template>

    <template #end>
      <div class='align-items-center flex toolbar-actions'>
        <Button
          v-if='hasChanged'
          :aria-label="t('hrm.profile.viewHistory')"
          icon='pi pi-chevron-down'
          icon-pos='right'
          label='Hồ sơ gốc'
          text
          @click="$emit('toggle-history', $event)"/>
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang='ts'>
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  versionProfile: string;
  profileStatus: string;
  hasPending: boolean;
  hasDraft: boolean;
  hasChanged: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  versionProfile: '',
  profileStatus: '',
  hasPending: false,
  hasDraft: false,
  hasChanged: false,
});

const emit = defineEmits<{
  'toggle-history': [event?: Event]
  'toggle-print': [event?: Event]
  'send-to-approve': []
  'send-to-delete': []
  'edit-profile': []
}>();

const { t } = useI18n();
const isSubmitting = ref(false);

const editButtonLabel = computed(() => {
  // Handle different statuses with different labels
  if (props.profileStatus === 'DRAFT') {
    return t('hrm.profile.personal.edit');
  }
  if (props.profileStatus === 'PENDING') {
    return 'Đang chờ duyệt';
  }
  if (props.hasPending) {
    return 'Đang chờ duyệt';
  }
  if (props.hasDraft) {
    return 'Có bản nháp';
  }
  return t('hrm.profile.personal.edit');
});
</script>

<style scoped>
.profile-toolbar {
  padding: 0.25rem 0.5rem;
}

.toolbar-start {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-title {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
}

.title-text {
  margin-bottom: 0;
}

.history-toggle-btn {
  padding: 0;
}

.version-text {
  margin-bottom: 0;
  font-weight: 500;
  font-size: 14px;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
}

:deep(.p-button:disabled) {
  transform: none;
}
</style>
