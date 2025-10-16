<template>
  <div class='flex justify-content-between'>
    <div class='flex gap-1'>
      <template
        v-for='action in filterActions'
        :key='action.code'>
        <Button
          class='border-round-sm border-transparent btn-action hover:border-1 hover:border-400 hover:surface-200 py-1 surface-0 text-900'
          size='small'
          v-bind='action'></Button>
      </template>
    </div>
    <div class='flex gap-1'>
      <!--      <SubmitDocNextButtonsOutSide-->
      <!--        :doc-id='docId||undefined'-->
      <!--        :flow-id='doc?.flowId'-->
      <!--        :flow-instance-id='doc?.process?.flowInstanceId'-->
      <!--        :process-id='doc?.process?.id'-->
      <!--        size='small'/>-->
      <SubmitNextButtonsOutSide
        v-if='!noNextBtn'
        :disabled='doc?.isDisableButtonFlow'
        :doc='doc'
        :process='doc?.process'/>
    </div>
  </div>

</template>

<script lang='ts' setup>
import type { ButtonProps } from 'primevue/button';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import SubmitNextButtonsOutSide
  from '@/apps/document/views/doc/submit/component/next-buttons-outside/SubmitNextButtonsOutSide.vue';

const props = defineProps({
  doc: {
    type: Object as PropType<DocSubmit | undefined>,
    default: undefined
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => []
  },
  nodeId: {
    type: String,
    default: ''
  },
  noNextBtn: {
    type: Boolean,
    default: false
  }
});
const docId = ref<string | null | undefined>(null);

const router = useRouter();

const { t } = useI18n();
const allActions: (ButtonProps & { code: DocumentAction, requiredDoc?: boolean; })[] = [
  {
    code: DocumentAction.CREATE_DRAFT,
    label: t('document.action.createDraft'),
    severity: 'primary',
    icon: 'pi pi-plus-circle',
    onClick: () => router.push({ name: 'CreateDocumentSubmitForm' })
  }
];

const filterActions = computed(() => allActions
  .filter(action => props.menuActions.includes(action.code))
  .map(action => {
    const disabled = action.requiredDoc ? !props.doc : false;
    return {
      ...action,
      disabled
    };
  }));

watch(() => props.doc, (value) => {
  docId.value = props.doc?.id;
});

const mapSupportAction = inject('mapSupportAction', {} as Record<string, true>);
</script>

<style scoped>

</style>