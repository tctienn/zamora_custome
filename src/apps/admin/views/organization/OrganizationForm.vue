<template>
  <Sidebar
    v-if='organization'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt='{
      header: {
        class: "p-0",
      },
      content: {
        class: "flex gap-2"
      }
    }'
    :show-close-icon='false'>
    <template #header>
      <div class='w-full'>
        <div class='align-items-center border-300 border-bottom-1 flex justify-content-between p-3 w-full'>
          <div class='align-items-center flex gap-1 max-h-3rem'>
            <Button
              class='border-round-sm h-2rem mr-2 py-1 w-2rem'
              icon='pi pi-arrow-left'
              severity='danger'
              @click='emits("hide-dialog")'/>
          </div>
          <div class='flex justify-content-between w-full'>
            <span class='font-bold text-lg'>
              {{ headerDialog }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <div class='w-full'>
      <div
        v-if='isDetail'
        class='flex flex-column gap-3 mt-2'>
        <div class='flex gap-4 justify-content-center'>
          <div class='flex flex-column gap-2'>
            <label class='text-center'>{{ t('admin.organization.logo') }}</label>
            <LogoUpload
              :avatar-url='url'
              name-image='logo'/>
          </div>

          <div class='flex flex-column gap-2'>
            <label class='text-center'>{{ t('admin.organization.numberSign') }}</label>
            <LogoUpload
              :avatar-url='urlNumberSign'
              name-image='numberSign'/>
          </div>
        </div>
        <div><label>{{ t('admin.organization.code') }}</label>: <b>{{ organization.code }}</b></div>
        <div><label>{{ t('admin.organization.name') }}</label>: <b>{{ organization.name }}</b></div>
        <div><label>{{ t('admin.organization.parent') }}</label>: <b>{{ parentName }}</b></div>
        <div><label>{{ t('common.type') }}</label>: <b>{{ typeName }}</b></div>
        <div><label>{{ t('admin.organization.acronym') }}</label>: <b>{{ organization.acronym }}</b></div>
        <div><label>{{ t('admin.organization.workAddress') }}</label>: <b>{{ organization.workAddress }}</b></div>
        <div><label>{{ t('admin.organization.businessRegisAddress') }}</label>: <b>{{
          organization.businessRegisAddress
        }}</b></div>
        <div><label>{{ t('admin.organization.dateOfEstablishment') }}</label>: <b>{{
          organization.dateOfEstablishment ? moment(organization.dateOfEstablishment).format('DD/MM/YYYY') : ''
        }}</b></div>
        <div><label>{{ t('admin.organization.representative') }}</label>: <b>{{ organization.representative }}</b></div>
        <div><label>{{ t('admin.organization.decisionNumber') }}</label>: <b>{{ organization.decisionNumber }}</b></div>
        <div><label>{{ t('admin.organization.decisionDate') }}</label>:
          <b>{{ organization.decisionDate ? moment(organization.decisionDate).format('DD/MM/YYYY') : '' }}</b></div>
        <div><label>{{ t('admin.organization.businessRegisNumber') }}</label>: <b>{{
          organization.businessRegisNumber
        }}</b></div>
        <div><label>{{ t('admin.organization.taxCode') }}</label>: <b>{{ organization.taxCode }}</b></div>
        <div><label>{{ t('admin.organization.telephoneNumber') }}</label>: <b>{{ organization.telephoneNumber }}</b>
        </div>
        <div><label>{{ t('admin.organization.fax') }}</label>: <b>{{ organization.fax }}</b></div>
        <div><label>{{ t('admin.organization.email') }}</label>: <b>{{ organization.email }}</b></div>
        <div><label>{{ t('admin.organization.website') }}</label>: <b>{{ organization.website }}</b></div>
        <div><label>{{ t('common.description') }}</label>: <b>{{ organization.description }}</b></div>
        <div><label>{{ t('common.status') }}</label>: <b>{{ organization.status ? 'Hoạt động' : 'Vô hiệu hóa' }}</b>
        </div>
        <div><label>{{ t('admin.organization.isAudioCall') }}</label>: <b>{{
          organization.isAudioCall ? 'Có' : 'Không'
        }}</b></div>
        <div><label>{{ t('admin.organization.isVideoCall') }}</label>: <b>{{
          organization.isVideoCall ? 'Có' : 'Không'
        }}</b></div>
      </div>

      <form
        v-if='!isDetail'
        ref='form'
        class='mt-4'
        @submit.prevent='submit'>
        <div class='p-fluid'>
          <div class='flex flex-column gap-2 mb-3'>
            <label
              v-required
              for='organizationCode'>{{ t('admin.organization.code') }}</label>
            <InputText
              v-model='organization.code'
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='organization.code'
              hidden
              name='code'/>
            <input
              v-model='organization.status'
              hidden
              name='status'/>
            <small
              v-if='submitForm && !organization.code'
              class='p-error'>{{ t('admin.organization.errors.codeEmpty') }}</small>
          </div>

          <div class='flex flex-column gap-2 mb-3'>
            <label
              v-required
              for='organizationName'>{{ t('admin.organization.name') }}</label>
            <InputText
              v-model='organization.name'
              v-trim
              :autofocus='!isCreate'
              maxlength='100'
              name='name'/>
            <small
              v-if='submitForm && !organization.name'
              class='p-error'>{{ t('admin.organization.errors.nameEmpty') }}</small>
          </div>

          <div class='formgrid grid'>
            <div class='col field'>
              <label for='organizationParent'>{{ t('admin.organization.parent') }}</label>
              <TreeSelect
                v-model='selectedParent'
                class='word-break-break-word'
                :empty-message='t("common.selectEmpty")'
                :filter='true'
                input-id='organizationParent'
                :options='parentOrganizations'
                :pt="{
                  label: {
                    style: 'height: 40px',
                  },
                }"
                :show-clear='false'>
                <template #value='{ value, placeholder }: { value: TreeNode[], placeholder: String }'>
                  <div class='align-items-center flex justify-content-between relative'>
                    <span>{{ value.length > 0 ? value[0].label : placeholder }}</span>
                    <i
                      v-if='selectedParent'
                      class='absolute pi pi-times right-0'
                      style='top: 3px; cursor: pointer;'
                      @click='clearSelectedParent'></i>
                  </div>
                </template>
              </TreeSelect>
              <input
                name='parentCode'
                type='hidden'
                :value='keys(selectedParent)[0]'>
            </div>
          </div>

          <div class='formgrid grid'>
            <div class='col field'>
              <label
                v-required
                for='organizationParent'>{{ t('common.type') }}</label>
              <NamedDropdown
                v-model='organization.type'
                :empty-message='t("common.selectEmpty")'
                :filter='true'
                input-id='organizationStatus'
                name='type'
                option-label='name'
                option-value='code'
                :options='types'/>
              <small
                v-if='submitForm && !organization.type'
                class='p-error'>{{ t('admin.organization.errors.typeEmpty') }}</small>
            </div>

            <div class='col field'>
              <label>{{ t('admin.organization.acronym') }}</label>
              <InputText
                v-model='organization.acronym'
                name='acronym'/>
            </div>
          </div>

          <!--        --------------------------------------- -->

          <div class='formgrid grid'>

            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.workAddress') }}</label>
              <InputText
                v-model='organization.workAddress'
                name='workAddress'/>
            </div>
          </div>
          <div class='formgrid grid'>

            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.businessRegisAddress') }}</label>
              <InputText
                v-model='organization.businessRegisAddress'
                name='businessRegisAddress'/>
            </div>
          </div>

          <div class='formgrid grid'>
            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.dateOfEstablishment') }}</label>
              <NamedInputCalendar
                id='decisionDate'
                v-model='organization.dateOfEstablishment'
                class='w-full'
                name='dateOfEstablishment'
                :select-other-months='true'
                show-icon/>
            </div>
            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.representative') }}</label>
              <InputText
                v-model='organization.representative'
                name='representative'/>
            </div>
          </div>

          <div class='formgrid grid'>

            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.decisionNumber') }}</label>
              <InputText
                v-model='organization.decisionNumber'
                name='decisionNumber'/>
            </div>

            <div class='col field'>
              <label>{{ t('admin.organization.decisionDate') }}</label>
              <NamedInputCalendar
                id='decisionDate'
                v-model='organization.decisionDate'
                class='w-full'
                name='decisionDate'
                :select-other-months='true'
                show-icon/>
            </div>
          </div>

          <div class='formgrid grid'>

            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.businessRegisNumber') }}</label>
              <InputText
                v-model='organization.businessRegisNumber'
                name='businessRegisNumber'/>
            </div>

            <div class='col field'>
              <label>{{ t('admin.organization.taxCode') }}</label>
              <InputText
                v-model='organization.taxCode'
                name='taxCode'/>
            </div>
          </div>

          <div class='formgrid grid'>

            <div class='col field'>
              <label>{{ t('admin.organization.telephoneNumber') }}</label>
              <InputText
                v-model='organization.telephoneNumber'
                name='telephoneNumber'/>
            </div>

            <div class='col field'>
              <label>{{ t('admin.organization.fax') }}</label>
              <InputText
                v-model='organization.fax'
                name='fax'/>
            </div>
          </div>

          <div class='formgrid grid'>
            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.email') }}</label>
              <InputText
                v-model='organization.email'
                name='email'/>
            </div>

            <div class='col field'>
              <label
                for='organizationParent'>{{ t('admin.organization.website') }}</label>
              <InputText
                v-model='organization.website'
                name='website'/>
            </div>
          </div>

          <!-- ------------------------- -->
          <div class='field'>
            <label for='organizationDescription'>{{ t('common.description') }}</label>
            <Textarea
              id='organizationDescription'
              v-model='organization.description'
              v-trim
              name='description'
              rows='3'/>
          </div>
          <div class='field flex gap-2 mb-3'>
            <div class='col-6 p-0'>
              <label class=''>{{ t('admin.organization.logo') }}</label>
              <LogoUpload
                :avatar-url='url'
                class='mt-2 upload-comp'
                name-image='logo'
                @is-change='changeLogo'/>
              <input
                name='isChangeLogo'
                type='hidden'
                :value='isLogoChange'/>
            </div>

            <div class='col-6 p-0'>
              <label class=''>{{ t('admin.organization.numberSign') }}</label>
              <LogoUpload
                :avatar-url='urlNumberSign'
                class='mt-2 upload-comp'
                name-image='numberSign'
                @is-change='changeNumberSign'/>
              <input
                name='isChangeNumberSign'
                type='hidden'
                :value='isNumberSignChange'/>
            </div>
          </div>
          <div class='col-6 field flex flex-column gap-2 mt-5 p-0'>
            <div class='align-content-center mb-3'>
              <Checkbox
                v-model='organization.isAudioCall'
                binary
                name='isAudioCall'/>
              <label
                class='mb-0 ml-2'
                for='open'>Tích hợp Audio Call</label>
            </div>

            <div class='align-content-center mb-3'>
              <Checkbox
                v-model='organization.isVideoCall'
                binary
                name='isVideoCall'/>
              <label
                class='mb-0 ml-2'
                for='open'>Tích hợp Video Call</label>
            </div>
          </div>
          <div class='col-6 field p-0'>
            <label
              for='organizationStatus'>Số thứ tự</label>
            <InputNumber
              v-model='organization.order'/>
            <input
              v-model='organization.order'
              hidden
              name='order'/>
          </div>

          <div class='formgrid grid pb-6'>
            <div class='col-6 field flex gap-2'>
              <div class='field w-full'>
                <label
                  for='organizationStatus'>{{ t('common.status') }}</label>
                <div class='field flex gap-5 mb-0 mt-2'>
                  <div class='flex'>
                    <RadioButton
                      v-model='organization.status'
                      input-id='organizationStatus1'
                      name='status'
                      value='ACTIVE'/>
                    <label
                      class='ml-2'
                      for='organizationStatus1'>{{ t('common.statuses.active') }}</label>
                  </div>
                  <div class='flex'>
                    <RadioButton
                      v-model='organization.status'
                      input-id='organizationStatus2'
                      name='status'
                      value='DEACTIVATE'/>
                    <label
                      class='ml-2'
                      for='organizationStatus2'>{{ t('common.statuses.deactivate') }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
      <div
        class='border-300 border-top-1 bottom-0 fixed flex gap-3 justify-content-center left-0 py-2 surface-overlay w-full'>
        <DialogFooter/>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import { isEmpty, keys, toLower } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, onMounted, type PropType, provide, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserStatusActive } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getCategoryByGroup } from '@/apps/admin/api/graphql/category-graphql-api';
import { organizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getListOrganizationHistory } from '@/apps/admin/api/graphql/organization-history-graphql-api';
import { saveOrUpdateOrganization } from '@/apps/admin/api/rest/organizationApi';
import type { CategoryInterface } from '@/apps/admin/model/category';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getPreviewFile } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { getStatuses, listToTree } from '@/common/helpers/utils';
import type { User } from '@/common/model/User';
import LogoUpload from '@/common/views/logo/LogoUpload.vue';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object as PropType<OrganizationInterface>,
    required: true,
  },
  isDetail: {
    type: Boolean,
    default: false
  },
  organizations: {
    type: Array as PropType<OrganizationInterface[]>,
    default: [] as OrganizationInterface[]
  }
});

const emits = defineEmits(['hide-dialog', 'reload']);
let form = ref();
const typeName = computed(() => {
  return types.value.find((t) => t.code == props.item?.type)?.name;
});
const { moment } = useMoment();
const submitForm = ref(false);
const { onResult: getAllUserStatusActiveResult } = getAllUserStatusActive();
const { t } = useI18n();
const types = ref(
  [
    {
      code: 'DV',
      name: 'Đơn vị'
    }, {
      code: 'PB',
      name: 'Phòng ban'
    }
  ]
);
const listHistory = ref();
const isLogoChange = ref(false);
const isNumberSignChange = ref(false);
const managers = ref<User[]>([]);
const parentName = ref();
getAllUserStatusActiveResult((res) => {
  managers.value = res.data.getAllUserStatusActive;
});

if (props.item) {
  organizationGraphql(props.item.parentCode ?? '').onResult((res) => {
    parentName.value = res.data.organization.name;
  });
}

function changeLogo() {
  isLogoChange.value = true;
}

function changeNumberSign() {
  isNumberSignChange.value = true;
}

const organizationFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    severity: 'danger',
    class: 'border-round-sm',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: props.isDetail ? null : {
    icon: 'pi pi-save',
    label: t('common.save'),
    text: false,
    class: 'border-round-sm',
    type: 'submit',
    command: () => submit()
  }
};
provide('dialogFooterButtons', organizationFormFooterButtons);

const visible = ref(props.visibleDialog);
const organization = ref<OrganizationInterface>(props.item as OrganizationInterface);
const isCreate = isEmpty(organization.value['id']);

const url = computed(() => getPreviewFile(props.item?.logo ?? ''));
const urlNumberSign = computed(() => getPreviewFile(props.item?.numberSign ?? ''));

const headerDialog = isCreate
  ? t('admin.organization.title.add')
  : props.isDetail ? t('admin.organization.title.detail')
    : t('admin.organization.title.edit');

const parentOrganizations = ref([]);
const selectedParent = ref();

watchEffect(() => {
  selectedParent.value = isCreate ? null : organization.value.parentCode ? { [organization.value.parentCode]: true } : null;
  if (!isCreate) {
    const { onResult: getListOrganizationHistoryOnResult } = getListOrganizationHistory(organization.value['id']);
    getListOrganizationHistoryOnResult((res) => {
      listHistory.value = res.data.getListOrganizationHistory;
    });
  } else {
    organization.value.status = 'ACTIVE';
  }
  parentOrganizations.value = listToTree((props.organizations || []).filter(
    (org: { id: string, code: string, name: string }) => !isCreate ? org.id !== organization.value['id'] : true
  ).map((organization: OrganizationInterface) => ({
    key: organization.code,
    label: organization.name,
    data: organization.code,
    parentId: organization.parentCode,
    children: []
  })), {
    id: 'key',
    parentId: 'parentId',
    children: 'children'
  });
});

function submit() {
  const fileInput = (document.getElementsByName('fileAttach')?.[0] as HTMLInputElement)?.files?.[0];
  if (fileInput) {
    const sizeFileUpload = fileInput.size;
    if (sizeFileUpload > 2 * 1024 * 1024) {
      toastError({ message: 'Kích thước file nên nhỏ hơn 2MB' });
      return;
    }
  }

  submitForm.value = true;
  if (!organization.value.code || !organization.value.name || !organization.value.type) {
    return;
  }
  const formData = new FormData(form.value);
  if (!isCreate) {
    formData.append('id', organization.value['id']);
  }
  saveOrUpdateOrganization(formData).then(() => {
    toastSuccess({
      message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
        itemType: t('admin.organization.objectName'),
        itemName: organization.value.name
      })
    });
    emits('reload');
    emits('hide-dialog');
  }).catch((err) => {
    toastError({ message: t('admin.organization.errors.' + err.code) });
  });
}

function clearSelectedParent(e: Event) {
  e.preventDefault();
  e.stopPropagation();

  selectedParent.value = null;
}

onMounted(() => {
  changeNumberSign();
});
</script>

<script lang='ts'>
export default { name: 'OrganizationForm' };
</script>

<style scoped>
.p-fluid .uploadFile .p-button {
  width: unset;
}

:deep(.avatar-upload) {
  width: 10rem;
  height: 10rem;
}

:deep(.avatar-upload img) {
  width: 10rem;
  height: 10rem;
}

:deep(.avatar-upload .avatar-border) {
  width: 10rem;
  height: 10rem;
}

:deep(.p-button.p-button-p-sm, .p-button) {
  padding-right: 0.75rem !important;
}

.upload-comp {
  align-items: flex-start !important;
}
</style>