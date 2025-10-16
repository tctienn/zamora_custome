<template>
  <Sidebar
    v-if='user'
    v-model:visible='visible'
    :dismissable='false'
    position='right'
    :pt='{
      header: {
        class: "p-0",
      },
    }'
    :show-close-icon='false'
    style='width: 50%; height: 100%'
    @hide="emits('hide-dialog')">
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
              {{
                props.item?.id
                  ? (isDetail ? t('admin.user.labelDetailUser') : t('admin.user.labelUpdateUser'))
                  : t('admin.user.labelCreateUser')
              }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <div class='mt-4 w-full'>
      <form
        v-if='!isDetail'
        ref='form'
        class='mb-6'
        @submit.prevent='submit'>
        <div class='formgrid grid'>
          <div class='col'>
            <!--            user name-->
            <div class='field'>
              <label
                v-required
                class='font-normal'
                for='fullName'>{{
                  t('admin.user.userName')
                }}</label>
              <InputText
                id='username'
                v-model='user.username'
                class='p-component p-inputtext w-full'
                :disabled='isEdit'
                name='username'/>
              <p
                v-if='visibleErrorUsernameIsEmpty'
                style='color: red; font-size: 12px'>
                {{ t('admin.user.message.usernameIsEmpty') }}
              </p>

              <input
                v-model='user.username'
                :disabled='!isEdit'
                hidden
                name='username'/>

              <InputText
                id='id'
                v-model='user.id'
                class='p-component p-inputtext w-full'
                hidden
                name='id'/>
            </div>
            <!--fullNamee-->
            <div class='col field p-0'>
              <label
                v-required
                class='font-normal'>{{
                  t('admin.user.fullName')
                }}</label>
              <div>
                <InputText
                  id='fullName'
                  v-model='user.fullName'
                  class='p-component p-inputtext w-full'
                  name='fullName'/>
                <p
                  v-if='visibleErrorFullnameIsEmpty'
                  style='color: red; font-size: 12px'>
                  {{ t('admin.user.message.fullnameIsEmpty') }}
                </p>
              </div>
            </div>
            <!--            birthDay and gender-->
            <div class='flex gap-4'>
              <div class='col field p-0'>
                <label class='font-normal'>{{ t('admin.user.gender') }}</label>
                <div class='field flex gap-5 mb-0 mt-2'>
                  <div class='flex'>
                    <RadioButton
                      v-model='user.gender'
                      input-id='gender1'
                      name='gender'
                      :value='1'/>
                    <label
                      class='ml-2'
                      for='gender1'>Nam</label>
                  </div>
                  <div class='flex'>
                    <RadioButton
                      v-model='user.gender'
                      input-id='gender2'
                      name='gender'
                      :value='0'/>
                    <label
                      class='ml-2'
                      for='gender2'>Nữ</label>
                  </div>
                </div>
              </div>
              <div class='col-6 field p-0 pl-4'>
                <label
                  class='font-normal'
                  for='fullName'>{{
                    t('admin.user.birthDay')
                  }}</label>
                <div>
                  <NamedInputCalendar
                    id='birthDay'
                    v-model='user.birthDay'
                    class='w-full'
                    name='birthDay'
                    :select-other-months='true'
                    show-icon/>
                </div>
                <p
                  v-if='visibleErrorBirthDay'
                  style='color: red; font-size: 12px'>
                  {{ t('admin.user.message.validateBirthDay') }}
                </p>
              </div>
            </div>
            <!--phone and email-->
            <div class='flex gap-4'>
              <div class='col-6 field p-0'>
                <label class='font-normal'>{{ t('admin.user.phone') }}</label>
                <div>
                  <InputText
                    id='phone'
                    v-model='user.phone'
                    class='p-component p-inputtext w-full'
                    name='phone'/>
                </div>
              </div>

              <div class='col field p-0'>
                <label
                  v-required
                  class='font-normal'>{{
                    t('admin.user.email')
                  }}</label>
                <div>
                  <InputText
                    id='email'
                    v-model='user.email'
                    class='p-component p-inputtext w-full'
                    :disabled='isEdit'
                    name='email'/>
                  <p
                    v-if='visibleErrorEmailIsEmpty'
                    style='color: red; font-size: 12px'>
                    {{ t('admin.user.message.emailIsEmpty') }}
                  </p>
                  <p
                    v-if='visibleErrorEmailInvalid'
                    style='color: red; font-size: 12px'>
                    {{ t('admin.user.message.emailInvalid') }}
                  </p>
                  <input
                    v-model='user.email'
                    :disabled='!isEdit'
                    hidden
                    name='email'/>
                </div>
              </div>
            </div>

            <div class='field'>
              <label class='font-normal'>Thuộc phòng ban</label>
              <div>
                <TreeSelect
                  v-model='selectedParent'
                  class='w-full'
                  :empty-message="t('common.selectEmpty')"
                  :filter='true'
                  input-id='organizationParent'
                  :options='parentOrganizations'
                  :placeholder="t('admin.organization.parent')"
                  selection-mode='multiple'
                  style='max-width: 48vw'>
                  <template
                    #value='{ value }: { value: TreeNode[]; placeholder: String }'>
                    <div
                      v-if='value.length > 0'
                      class='flex'>
                      <div
                        v-for='v of value'
                        :key='v.key'>
                        <Chip :label='v.label'/>
                      </div>
                    </div>
                    <div v-else>
                      {{ t('admin.organization.parent') }}
                    </div>
                  </template>
                </TreeSelect>
              </div>
            </div>

            <div class='field'>
              <label
                v-required
                class='font-normal'>{{ t('admin.user.role') }}</label>
              <div>
                <MultiSelect
                  v-model='user.roles'
                  class='w-full'
                  display='chip'
                  :max-selected-labels='5'
                  option-label='name'
                  option-value='code'
                  :options='listRole'
                  :placeholder="t('admin.user.selectRole')"/>
                <p
                  v-if='visibleErrorRolesIsEmpty'
                  style='color: red; font-size: 12px'>
                  {{ t('admin.user.message.rolesIsEmpty') }}
                </p>
              </div>
            </div>

            <!--            <h5>Thông tin thêm</h5>-->

            <div class='field'>
              <label class='font-normal'>{{ t('admin.user.position') }}</label>
              <div>
                <MultiSelect
                  v-model='user.position'
                  class='w-full'
                  display='chip'
                  :filter='true'
                  :max-selected-labels='5'
                  option-label='name'
                  option-value='code'
                  :options='listPosition'
                  :placeholder="t('admin.user.choosePosition')"/>
              </div>
            </div>

            <div class='field'>
              <label class='font-normal'>{{ t('admin.user.simCA') }}</label>
              <div>
                <InputText
                  id='simCa'
                  v-model='user.simCa'
                  class='p-component p-inputtext w-full'
                  name='simCa'/>
              </div>
            </div>

            <div class='flex justify-content-between'>
              <div class='field'>
                <label class='font-normal'>{{ t('admin.user.avatar') }}</label>
                <LogoUpload
                  :avatar-url='url'
                  name-image='avatar'
                  @is-change='changeAvatar'/>
                <input
                  name='isAvatarChange'
                  type='hidden'
                  :value='isAvatarChange'/>
              </div>

              <div class='field'>
                <label class='font-normal'>{{ t('admin.user.mainSign') }}</label>
                <LogoUpload
                  :avatar-url='urlMainSign'
                  name-image='mainSign'
                  @is-change='changeMainSign'/>
                <input
                  name='isMainSignChange'
                  type='hidden'
                  :value='isMainSignChange'/>
              </div>

              <div class='field'>
                <label class='font-normal'>{{
                  t('admin.user.flashingSignature')
                }}</label>
                <LogoUpload
                  :avatar-url='urlFlashingSignature'
                  name-image='flashingSignature'
                  @is-change='changeFlashingSignature'/>
                <input
                  name='isFlashingSignatureChange'
                  type='hidden'
                  :value='isFlashingSignatureChange'/>
              </div>
            </div>
            <!--status member-->
            <div class='field'>
              <label class='font-normal'>{{ t('admin.user.statusActivity') }}</label>
              <div class='field flex gap-5 mb-0 mt-2'>
                <div class='flex'>
                  <RadioButton
                    v-model='user.locked'
                    input-id='gender1'
                    name='locked'
                    :value='false'/>
                  <label
                    class='ml-2'
                    for='gender1'>{{ t('common.statuses.active') }}</label>
                </div>
                <div class='flex'>
                  <RadioButton
                    v-model='user.locked'
                    input-id='status2'
                    name='locked'
                    :value='true'/>
                  <label
                    class='ml-2'
                    for='status2'>{{ t('common.statuses.deactivate') }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div
        v-if='!isDetail'
        class='border-300 border-top-1 fixed flex gap-2 justify-content-center p-0 p-2 surface-overlay w-full'
        style='bottom: 0; left: 0'>
        <DialogFooter/>
      </div>

      <div
        v-if='isDetail'
        class='flex flex-column gap-3'>
        <div><label>{{ t('admin.user.userName') }}</label>: <b>{{ user.username }}</b></div>
        <div><label>{{ t('admin.user.fullName') }}</label>: <b>{{ user.fullName }}</b></div>
        <div><label>{{ t('admin.user.email') }}</label>: <b>{{ user.email }}</b></div>
        <div><label>{{ t('admin.user.phone') }}</label>: <b>{{ user.phone }}</b></div>
        <div><label>{{ t('admin.organization.objectName') }}</label>: <b>{{ user.organizationName?.join(', ') }}</b>
        </div>
        <div><label>{{ t('admin.user.active') }}</label>: <b>{{ user.locked ? 'Vô hiệu hóa' : 'Hoạt động' }}</b></div>
        <div><label>{{ t('admin.user.position') }}</label>: <b>{{ user.positionName?.join(', ') }}</b></div>
        <div><label>{{ t('admin.user.simCA') }}</label>: <b>{{ user.simCa }}</b></div>
        <div><label>{{ t('admin.user.birthDay') }}</label>: <b>{{
          user.birthDay ? moment(user.birthDay).format('DD/MM/YYYY') : ''
        }}</b>
        </div>
        <div><label>{{ t('admin.user.gender') }}</label>:
          <b>{{ t('hrm.profile.general.genderOptions.' + (user.gender == 1 ? 'male' : 'female')) }}</b></div>

        <div class='flex justify-content-between'>
          <div class='field'>
            <label class='font-normal'>{{ t('admin.user.avatar') }}</label>
            <LogoUpload
              :avatar-url='url'
              :is-detail='true'
              name-image='avatar'/>
          </div>

          <div class='field'>
            <label class='font-normal'>{{ t('admin.user.mainSign') }}</label>
            <LogoUpload
              :avatar-url='urlMainSign'
              :is-detail='true'
              name-image='mainSign'/>
          </div>

          <div class='field'>
            <label class='font-normal'>{{
              t('admin.user.flashingSignature')
            }}</label>
            <LogoUpload
              :avatar-url='urlFlashingSignature'
              :is-detail='true'
              name-image='flashingSignature'/>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import { assign, get, isEmpty, isUndefined } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFormatEmail } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getAllPositionGraphql } from '@/apps/admin/api/graphql/position/position-graphql';
import { getRolesByStatus } from '@/apps/admin/api/graphql/role-graphql-api';
import { createUpdateUser } from '@/apps/admin/api/rest/userApi';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { UserInterface } from '@/apps/admin/model/User';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { ACTIVITY_STATUSES } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { getPreviewFile } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { listToTree } from '@/common/helpers/utils';
import LogoUpload from '@/common/views/logo/LogoUpload.vue';

const props = defineProps({
  item: {
    type: Object as PropType<UserInterface>,
    default: null,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  isDetail: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['hide-dialog', 'reload']);
const isSubmit = ref(false);
const visibleErrorUsernameIsEmpty = ref(false);
const visibleErrorBirthDay = ref(false);
const visibleErrorEmailIsEmpty = ref(false);
const visibleErrorEmailInvalid = ref(false);
const visibleErrorFullnameIsEmpty = ref(false);
const visibleErrorRolesIsEmpty = ref(false);
const isEdit = ref(false);
const listPosition = ref();
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
const urlMainSign = computed(() => getPreviewFile(props.item.mainSign ?? ''));
let isFlashingSignatureChange = ref(false);
const { t } = useI18n() || {};
let listRole = ref([]);

const url = computed(() => getPreviewFile(props.item?.avatar ?? ''));
const organizations = ref([]);
const selectedParent = ref<any>();
const parentOrganizations = ref([]);
let isMainSignChange = ref(false);
const { onResult: getFormatEmailResult } = getFormatEmail();
const formatEmail = ref<string>('');
const { moment } = useMoment();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []);
  parentOrganizations.value = listToTree(
    organizations.value.map((organization: OrganizationInterface) => ({
      key: organization.code,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  );
});
const { onResult: getRolesByStatusOnResult } = getRolesByStatus(
  ACTIVITY_STATUSES.ACTIVE,
);
const form = ref();
const user = ref<UserInterface>(props.item);

getFormatEmailResult((res) => {
  formatEmail.value = res.data?.getFormatEmail;
  if (!user.value.id) {
    user.value = {
      ...user.value,
      email: `@${formatEmail.value}`
    };
  }
});

getRolesByStatusOnResult((response) => {
  listRole.value = get(response, 'data.getRolesByStatus', []);
});

function changeFlashingSignature() {
  isFlashingSignatureChange.value = true;
}

getRolesByStatusOnResult((response) => {
  listRole.value = get(response, 'data.getRolesByStatus', []);
});

const userFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    class: 'border-round-sm',
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog'),
  },
  actionButton: {
    icon: 'pi pi-check',
    label: t('common.save'),
    class: 'border-round-sm',
    text: false,
    type: 'button',
    command: () => submit(),
  },
};

const { onResult: getAllPositionResult } = getAllPositionGraphql();
getAllPositionResult((res) => {
  listPosition.value = get(res, 'data.allPosition', []);
});
provide('dialogFooterButtons', userFormFooterButtons);
const visible = ref(props.visibleDialog);
const isCreate = isEmpty(user.value['id']);
const urlFlashingSignature = computed(() =>
  getPreviewFile(props.item.flashingSignature ?? ''),
);
if (!isCreate) {
  selectedParent.value = props.item?.organizationCode?.reduce((acc, key) => (acc[key] = true, acc), {} as Record<string, boolean>);
}

if (props.item.id) {
  assign(user, props.item);
  user.value.gender = props.item?.gender;
  user.value.birthDay = props.item?.birthDay ? new Date(props.item?.birthDay as string) : null;
  user.value.organizationCode = props.item?.organizationCode;
  user.value.position = props.item?.position;
  selectedParent.value = props.item?.organizationCode?.reduce((acc, key) => (acc[key] = true, acc), {} as Record<string, boolean>);
  isEdit.value = true;
} else {
  user.value.locked = false;
  user.value.gender = 1;
  isEdit.value = false;
}

let getStatuses = ref([
  {
    label: t('common.statuses.active'),
    value: false
  },
  {
    label: t('common.statuses.deactivate'),
    value: true
  }
]);

let isAvatarChange = ref(false);

function validateForm() {
  // if (!user.value) {
  //   return false;
  // }
  visibleErrorUsernameIsEmpty.value = isSubmit.value && (isUndefined(user.value.username) || isEmpty(user.value.username));
  visibleErrorEmailIsEmpty.value = isSubmit.value && (isUndefined(user.value.email) || isEmpty(user.value.email));
  visibleErrorRolesIsEmpty.value = isSubmit.value && (isUndefined(user.value.roles) || isEmpty(user.value.roles));
  visibleErrorBirthDay.value = isSubmit.value && user.value.birthDay != null
      && user.value.birthDay >= new Date().setHours(0, 0, 0, 0).toString();
  visibleErrorFullnameIsEmpty.value = isSubmit.value && (isUndefined(user.value.fullName) || isEmpty(user.value.fullName));
  return !(visibleErrorUsernameIsEmpty.value || visibleErrorEmailIsEmpty.value
      || visibleErrorEmailInvalid.value || visibleErrorFullnameIsEmpty.value || visibleErrorBirthDay.value);
}

function submit() {
  isSubmit.value = true;
  if (validateForm()) {
    const formData = new FormData(form.value);
    formData.append('locked', user.value.locked?.toString());
    formData.append('roles', user.value.roles?.toString() ?? '');
    formData.append('position', user.value.position?.toString() ?? '');
    if (selectedParent.value) {
      formData.append('organization', Object.keys(selectedParent.value).toString());
    }
    createUpdateUser(formData)
      .then(() => {
        if (props.item?.id) {
          toastSuccess({ message: t('admin.user.message.updateSuccess') });
        } else {
          toastSuccess({ message: t('admin.user.message.createSuccess') });
        }
        emits('hide-dialog');
        close();
      })
      .catch((err) => {
        toastError({ message: t('admin.user.error.' + err.code) });
      });
  }
  // emits('hide-dialog');
  isSubmit.value = false;
}

function changeAvatar() {
  isAvatarChange.value = true;
}

function changeMainSign() {
  isMainSignChange.value = true;
}

function validateEmail(email: string, domain: string): boolean {
  if (email == null || email == '') {
    return true;
  }
  const emailRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@${domain.replace('.', '\\.')}$`);
  return emailRegex.test(email);
}

watch(() => [user.value.username, user.value.fullName, user.value.email], () => validateForm());
watch(
  () => [user.value.username, user.value.fullName, user.value.email],
  () => validateForm(),
);
</script>

<script lang='ts'>
export default { name: 'UserForm' };
</script>

<style scoped>
:deep(.avatar-upload) {
  width: 10rem;
  height: 10rem;
}

:deep(.avatar-upload .avatar-border) {
  width: 10rem;
  height: 10rem;
}

:deep(.avatar-upload img) {
  width: 10rem;
  height: 10rem;
}
</style>
