<template>
  <div class='flex flex-column gap-2 w-full'>
    <DataView
      data-key='code'
      paginator
      :rows='10'
      :value='eForms'>
      <template #list='{items}'>
        <div
          v-for='(item, index) in items'
          :key='index'>
          <div class='hover:shadow-1 relative'>
            <div class='bg-black-alpha-10 flex gap-2 justify-content-between p-2'>
              <div
                class='align-content-center cursor-pointer w-full'
                @click='toggleEFormOpenStatus(item["code"])'>
                <p class=''>
                  <span class='font-semibold'>
                    <span
                      class='cursor-pointer mr-2 pi pi-angle-up text-primary-400 transition-duration-300 transition-transform'
                      :class='{"rotate-180": eFormsOpenStatus[item["code"]], "opacity-0": item["versions"]?.length === 0}'
                      @click='toggleEFormOpenStatus(item["code"])'></span>
                    <span>{{ index + 1 }}. </span>
                    <span>{{ item['name'] }}</span>
                  </span>
                  <span class='font-italic text-sm'>
                    {{
                      item['versions']?.length ?
                        `(${item['versions']?.length} ${t('e-form.form.versions')})` : ''
                    }}
                  </span>
                </p>
                <p class='font-italic'>{{ item.description }}</p>
              </div>

              <Button
                icon='pi pi-ellipsis-v'
                rounded
                text
                @click='toggleActions($event, item)'></Button>
            </div>
          </div>
          <ExpandCollapseTransition :show='eFormsOpenStatus[item["code"]]'>
            <div
              v-for='(v, i) in item["versions"]'
              :key='i'
              class='flex justify-content-between px-3 py-2'>
              <div class='align-content-center'>{{ v['name'] }}</div>
              <div class='align-content-center align-items-center flex gap-5'>
                <div
                  :class='`border-round surface-border text-center text-white py-1 px-2 action-${v["status"]} align-content-center`'>
                  {{ getStatusLabel(v['status']) }}
                </div>

                <div class='flex gap-2'>
                  <i
                    v-tooltip.left='t("common.configure")'
                    class='cursor-pointer pi pi-cog text-yellow-500'
                    @click='$router.push({name: "EFormConfig", params: {versionId: v["id"]}})'></i>
                  <i
                    v-if='v["status"] === "DRAFT"'
                    v-tooltip.left='t("common.delete")'
                    class='cursor-pointer pi pi-trash text-red-500'
                    @click='deleteEFormVersion(v as EFormVersion)'></i>
                </div>
              </div>
            </div>
          </ExpandCollapseTransition>

        </div>
      </template>
    </DataView>
    <Menu
      ref='menuRef'
      :model='actionMenus'
      popup/>

    <Menu
      ref='menuRefVersion'
      :model='actionMenusVersion'
      popup/>
    <EFormSidebar
      v-model:visible='formVisible'
      :form='currentEForm'
      :mode='formMode'/>
  </div>

</template>

<script lang='ts' setup>

import camelcase from 'camelcase';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { eFormsByGroupId } from '@/apps/e-form/api/graphql/e-form';
import { createEFormVersion, deleteEForm, deleteEFormVersionById } from '@/apps/e-form/api/graphql/e-form-version';
import ExpandCollapseTransition from '@/apps/e-form/components/transition/ExpandCollapseTransition.vue';
import type { EForm, EFormVersion } from '@/apps/e-form/model/e-form';
import EFormSidebar from '@/apps/e-form/views/config/form/EFormSidebar.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const formVisible = ref(false);
const formMode = ref<'CREATE' | 'EDIT'>('CREATE');
const defaultEForm = { isActive: true } as EForm;
const currentEForm = ref(defaultEForm);
const actionMenus = reactive<MenuItem[]>([]);
const actionMenusVersion = reactive<MenuItem[]>([]);
const menuRef = ref<Menu>();
const menuRefVersion = ref<Menu>();
const selectedGroupId = inject('selectedGroupId', ref<string>());
const confirm = useConfirm();

const {
  result,
  refetch
} = eFormsByGroupId(selectedGroupId.value);
const eForms = computed(() => result?.value?.eFormsByGroupId as EForm[] || []);

watch(selectedGroupId, (value) => refetch({ groupId: value }));

const eFormsOpenStatus = ref<{ [key: string]: boolean }>({});

function toggleEFormOpenStatus(code: string) {
  eFormsOpenStatus.value[code] = !eFormsOpenStatus.value[code];
}

watch(eForms, (value) => {
  eFormsOpenStatus.value = {};
  value.forEach((eForm) => {
    eFormsOpenStatus.value[eForm.code] = !!eForm.versions?.length;
  });
}, { immediate: true });

function toggleActions(event: Event, eForm: EForm) {
  Object.assign(actionMenus, [
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => {
        editEForm(eForm);
      }
    },
    {
      label: 'New Version',
      icon: 'pi pi-plus',
      command: () => {
        createEFormVersion().mutate({ eFormCode: eForm.code })
          .then(() => needRefresh.value = true)
          .catch(toastError);
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        confirm.require({
          message: `Bạn có muốn xóa form ${eForm.name} không?`,
          header: t('common.delete'),
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: t('common.delete'),
          acceptClass: 'p-button-danger',
          rejectLabel: t('common.cancel'),
          accept: () => {
            deleteEForm().mutate({ code: eForm.code }).then(() => {
              toastSuccess({ message: `Xóa form ${eForm.name} thành công` });
              refetch();
            });
          },
        });
        // Implement delete functionality
      }
    }
  ]);
  menuRef.value?.toggle(event);
}

function createEForm() {
  currentEForm.value = {
    ...defaultEForm,
    groupId: selectedGroupId.value
  };
  formMode.value = 'CREATE';
  formVisible.value = true;
}

defineExpose({ createEForm });

function editEForm(eForm: EForm) {
  currentEForm.value = eForm;
  formMode.value = 'EDIT';
  formVisible.value = true;
}

function getStatusLabel(value: string): string {
  return t('e-form.form.status.' + camelcase(value));
}

function deleteEFormVersion(version: EFormVersion) {
  confirm.require({
    message: 'Bạn có muốn xóa phiên bản này không?',
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      deleteEFormVersionById().mutate({ id: version.id }).then(() => {
        toastSuccess({ message: `Xóa phiên bản ${version.name} thành công` });
        refetch();
      });
    },
  });
}

const needRefresh = ref(false);
watch(needRefresh, (value) => {
  if (value) {
    refetch({ groupId: selectedGroupId.value });
    needRefresh.value = false;
  }
}, { immediate: true });
provide('needRefresh', needRefresh);

</script>

<style scoped>

</style>