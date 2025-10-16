<template>
  <div class='align-items-center flex justify-content-center relative w-full'>
    <Toolbar class='h-3rem max-w-60rem mb-2 px-2 py-0 relative surface-0 w-full z-10'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <ButtonIcon
            class='align-items-center border-round-sm flex justify-content-center'
            icon='arrow_back'
            severity='danger'
            size='small'
            style='width: 30px; height: 30px;'
            @click='back'/>
          
          <input
            v-model.lazy='flowName'
            class='bg-transparent border-none font-semibold input-none p-1 p-component p-inputtext text-xl w-full'
            style='text-overflow:ellipsis; min-width:70vw'>
        </div>
      </template>
      <template #end>
        <div class='align-items-center flex gap-2'>
          <div
            v-if='totalErrorCount>0'
            class='align-items-center bg-red-400 border-round cursor-pointer flex gap-2 p-2 text-white'
            @click='showProblems'>
            <AppIcon
              name='error'
              size='1.5'/>
            {{ totalErrorCount }} problems
          </div>
          <Button
            v-else
            class='border-round-sm focus:shadow-none font-medium p-2'
            icon='pi pi-save'
            :label='t("common.save")'
            :loading='isSaving'
            style='height: 30px'
            @click='saveConfig'>
          </Button>
        </div>
      </template>
    </Toolbar>
  </div>
  <OverlayPanel ref='op'>
    <div
      v-for='(errors,nodeId) in problems'
      :key='nodeId'
      class='flex flex-column gap-1'>
      <div
        v-for='(error,index2) in errors'
        :key='index2'
        class='border-left-2 border-red-400 cursor-pointer px-2 py-1 surface-hover'>
        {{ error.message }}
      </div>
    </div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Toolbar from 'primevue/toolbar';
import { useConfirm } from 'primevue/useconfirm';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { updateNameFlow } from '@/apps/work-flow/api/graphql/flow-api';
import { useNodeProblemsStore } from '@/apps/work-flow/store/node-problems';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';

const props = defineProps({
  isSaving: {
    type: Boolean,
    default: false
  }
});
const flowName = defineModel<string>('flowName', { required: true });
const { problems, totalErrorCount } = storeToRefs(useNodeProblemsStore());

const { t } = useI18n();
const saveConfig = inject('saveConfig', () => void {});
const op = ref();

function showProblems(event: Event) {
  op.value.toggle(event);
}

const route = useRoute();
const router = useRouter();
const flowId = route.params.flowId;
const { mutate, onDone, onError } = updateNameFlow();
watch(() => flowName.value, value => {
  mutate({
    id: flowId,
    name: value
  });
});
const confirm = useConfirm();

//TODO: Warning before back
function back() {
  router.back();
}

defineExpose({ showProblems });

</script>

<style scoped>
input:focus {
  outline: none;
  box-shadow: none;
}

:deep(.p-toolbar) {
  border-radius: 6px;
  position: relative;
  z-index: 10;
  margin: 0 auto;
}

:deep(.p-toolbar .p-toolbar-group-start),
:deep(.p-toolbar .p-toolbar-group-end) {
  align-items: center;
}
</style>