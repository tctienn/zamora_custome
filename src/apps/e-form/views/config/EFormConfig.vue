<template>
  <div
    class='form-builder'>
    <!-- Header -->
    <div class='border-noround card header'>
      <div class='flex justify-content-between'>
        <div class='flex gap-4'>
          <div class='text-xl'>
            <span
              v-if='version.eFormName'
              class='font-semibold'>{{
                version.eFormName
              }}</span>
            <span v-if='version.eFormName'> - </span>
            {{ version.name }}
          </div>
          <div
            v-if='version.status'
            class='align-content-center align-self-baseline border-round px-2 py-1 text-center text-white'
            :class='"action-" + version.status'>
            {{ t('e-form.form.status.' + camelcase(version.status || '')) }}
          </div>
        </div>

        <Button
          v-if='v$.$errors.length'
          icon='pi pi-exclamation-circle'
          :label='`${v$.$errors.length} problems`'
          severity='danger'
          @click='op?.toggle($event)'/>
        <ButtonGroup v-else>
          <Button
            v-if='version.status === VersionStatus.DRAFT'
            icon='pi pi-save'
            :label='t("common.save")'
            @click='saveForm'/>
          <Button
            v-if='version.status === VersionStatus.PUBLISHED || version.status === VersionStatus.ACTIVE'
            icon='pi pi-copy'
            :label='t("e-form.form.actions.clone")'
            @click='cloneVersion'/>
          <Button
            v-if='version.status === VersionStatus.DRAFT'
            icon='pi pi-upload'
            :label='t("e-form.form.actions.publish")'
            severity='success'
            @click='publish'/>
          <Button
            v-if='version.status === VersionStatus.PUBLISHED'
            icon='pi pi-check-circle'
            :label='t("e-form.form.actions.activate")'
            severity='success'
            @click='activate'/>
        </ButtonGroup>

        <OverlayPanel ref='op'>
          <div class='flex flex-column gap-2'>
            <div
              v-for='(error, index) in v$.$errors'
              :key='index'>
              {{ error.$message }}
            </div>
          </div>
        </OverlayPanel>
      </div>
    </div>

    <div class='main'>
      <!-- Sidebar: Tool list -->
      <EFormElementsList
        :disabled='version.status !== VersionStatus.DRAFT'
        @add-element='addElement'
        @drag='onDragStart'/>

      <EFormFormBuilder
        ref='formRef'
        v-model='config.elements'
        :disabled='version.status !== VersionStatus.DRAFT'
        :drop-enabled='dropEnabled'
        edit-mode
        :total-columns='totalGridColumns'
        @drop='onDrop'
        @drop-handle='onDropIndex'
        @show-preview='visiblePreview = true'
        @show-relationship-config='showRelationshipConfig'
        @update:config='onUpdateConfigMode'/>
      <RelationshipConfig
        v-model:relationships='config.relationships'
        v-model:visible='visibleRelationshipConfig'
        :elements='elementsHaveValue'/>
      <FormConfigSidebar
        v-model:visible='visibleElementConfig'
        header='Cấu hình Element'>
        <TabView>
          <TabPanel header='General'>
            <FieldConfigPanel
              v-model='currentElement'
              :class='{"p-disabled": version.status !== VersionStatus.DRAFT }'/>
          </TabPanel>

          <TabPanel header='Advanced'>
            <AdvancedConfigPanel
              v-model='currentElement'
              :class='{"p-disabled": version.status !== VersionStatus.DRAFT }'/>
          </TabPanel>
        </TabView>
      </FormConfigSidebar>

      <EFormDisplayWithCheckDialog
        v-model:visible='visiblePreview'
        :model-value='config'/>

    </div>
  </div>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import camelcase from 'camelcase';
import { cloneDeep } from 'lodash';
import type OverlayPanel from 'primevue/overlaypanel';
import { computed, provide, reactive, type Ref, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

import {
  activateVersion,
  cloneEFormVersion,
  eFormVersionInfo,
  getEFormVersionConfig,
  publishVersion,
  saveEFormVersionConfig
} from '@/apps/e-form/api/graphql/e-form-version';
import { ElementType } from '@/apps/e-form/components/element';
import { defaultConfigElements } from '@/apps/e-form/components/element-config';
import EFormDisplayWithCheckDialog from '@/apps/e-form/components/form/EFormDisplayWithCheckDialog.vue';
import EFormElementsList from '@/apps/e-form/components/form/EFormElementsList.vue';
import EFormFormBuilder from '@/apps/e-form/components/form/EFormFormBuilder.vue';
import AdvancedConfigPanel from '@/apps/e-form/components/panel/AdvancedConfigPanel.vue';
import FieldConfigPanel from '@/apps/e-form/components/panel/FieldConfigPanel.vue';
import FormConfigSidebar from '@/apps/e-form/components/panel/FormConfigSidebar.vue';
import RelationshipConfig from '@/apps/e-form/components/panel/relationship/RelationshipConfig.vue';
import { type EFormVersion, type EFormVersionInfo, VersionStatus } from '@/apps/e-form/model/e-form';
import { type EFormConfigModel, type ElementConfig, haveValue } from '@/apps/e-form/model/form-config';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const route = useRoute();
const router = useRouter();
let versionId = route.params.versionId?.toString() || '';
const {
  result,
  refetch
} = getEFormVersionConfig(versionId);
const {
  result: versionResult,
  refetch: versionRefetch,
} = eFormVersionInfo(versionId);
const version = computed(() => versionResult.value?.eFormVersionInfo as EFormVersionInfo || {});
const config = reactive<EFormConfigModel>({});

watch(result, (newValue) => {
  if (newValue) {
    Object.assign(config, correctConfig(cloneDeep(newValue.getEFormVersionConfig) || {}));
  }
}, { immediate: true });

function correctConfig(config: EFormConfigModel) {
  const keysToRemove = ['otherProperties', 'otherPropertiesMap'];

  function removeOtherProperties(obj: any) {
    if (Array.isArray(obj)) {
      obj.forEach(removeOtherProperties);
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (keysToRemove.includes(key)) {
          delete obj[key];
        } else {
          removeOtherProperties(obj[key]);
        }
      });
    }
  }

  removeOtherProperties(config);
  return config;
}

const currentIndexConfigElement = ref<number>();
const currentElement = computed((): ElementConfig | undefined => currentIndexConfigElement.value !== undefined ? config.elements?.at(currentIndexConfigElement.value) : undefined);

const { t } = useI18n();
const v$: Ref<Validation> = useVuelidate();
const visibleElementConfig = ref(false);
const visibleRelationshipConfig = ref(false);
const visiblePreview = ref(false);
const elementsHaveValue = computed(() => config.elements?.filter((e: ElementConfig) => haveValue.includes(e.type)) || []);
const totalGridColumns = 12;
const formRef = ref<InstanceType<typeof EFormFormBuilder>>();
const op = ref<InstanceType<typeof OverlayPanel>>();
const dropEnabled = ref(false);
let draggingElement: ElementConfig | null = null;

const onUpdateConfigMode = (index: number) => {
  currentIndexConfigElement.value = index;
  visibleElementConfig.value = true;
};

function showRelationshipConfig() {
  visibleRelationshipConfig.value = true;
}

function onDragStart(type: ElementType) {
  draggingElement = defaultConfigElements[type] ?? null;
  dropEnabled.value = true;
}

function onDrop() {
  if (draggingElement) {
    formRef.value?.dropElement(draggingElement);
    draggingElement = null;
    dropEnabled.value = false;
  }
}

function onDropIndex(index?: number) {
  if (draggingElement) {
    formRef.value?.dropElement(draggingElement, index);
    draggingElement = null;
    dropEnabled.value = false;
  }
}

function addElement(type: ElementType) {
  const element = defaultConfigElements[type];
  if (element) {
    formRef.value?.dropElement(element);
  }
}

const saveForm = () => {
  saveEFormVersionConfig().mutate({
    id: versionId,
    config: config
  }).then(() => {
    toastSuccess();
  }).catch(() => {
    toastError();
  });
};

function cloneVersion() {
  cloneEFormVersion().mutate({ id: versionId, }).then((res) => {
    const newVersion = res?.data?.cloneEFormVersion as EFormVersion || {};
    toastSuccess();
    if (newVersion.id) {
      router.push({
        name: 'EFormConfig',
        params: { versionId: newVersion.id }
      });
    }
  }).catch(() => {
    toastError();
  });
}

function publish() {
  publishVersion().mutate({ id: versionId, }).then(() => {
    versionRefetch();
    toastSuccess();
  }).catch(() => {
    toastError();
  });
}

function activate() {
  activateVersion().mutate({ id: versionId, }).then(() => {
    versionRefetch();
    toastSuccess();
  }).catch(() => {
    toastError();
  });
}

onBeforeRouteUpdate((to) => {
  if (to.matched.find(m => m.name === 'EFormConfig')) {
    const newVersionId = to.params.versionId?.toString() || '';
    if (newVersionId !== versionId) {
      versionId = newVersionId;
      refetch({ id: versionId });
      versionRefetch({ id: versionId });
    }
  }
});

provide('elements', toRef(() => config.elements));
</script>

<style scoped>
.form-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  padding: 1rem;
  text-align: center;
}

.main {
  flex: 1;
  gap: 1rem;
  display: flex;
}

.form-canvas > div {
  display: grid;
  grid-template-columns: repeat(v-bind(totalGridColumns), 1fr);
  gap: 0.5rem;
}
</style>
