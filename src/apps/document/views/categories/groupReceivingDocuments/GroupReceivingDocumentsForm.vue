<template>
  <Dialog
    v-if='groupReceivingDocuments'
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form
      ref='form'
      v-disabled='{ disabled: isDetail }'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-6 field'>
            <label
              v-required
              for='groupReceivingDocumentsCode'>{{
                t("document.groupReceivingDocuments.code")
              }}</label>
            <InputText
              v-model='groupReceivingDocuments.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='groupReceivingDocuments.code'
              hidden
              name='code'/>
            <small
              v-if='submitForm && !groupReceivingDocuments.code'
              class='p-error'>{{
                t("document.groupReceivingDocuments.errors.codeEmpty")
              }}</small>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='groupReceivingDocumentsName'>{{
                t("document.groupReceivingDocuments.name")
              }}</label>
            <InputText
              v-model='groupReceivingDocuments.name'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !groupReceivingDocuments.name'
              class='p-error'>{{
                t("document.groupReceivingDocuments.errors.nameEmpty")
              }}</small>
          </div>

          <div class='col-12 field'>
            <div class='align-items-center flex justify-content-between'>
              <div class='w-20rem'>
                {{ t("document.groupReceivingDocuments.members") }}
              </div>
              <ButtonIcon
                v-tooltip.top="t('document.groupReceivingDocuments.addMembers')"
                class='flex justify-content-center w-2rem'
                icon='person_add_alt'
                icon-size='1.5'
                rounded
                text
                @click='() => (showDialog = true)'/>
            </div>

            <DataTable
              class='mt-2'
              row-hover
              scroll-height='30vh'
              scrollable
              show-gridlines
              :value='usersMoreDetails'>
              <Column
                class='text-center'
                header='#'
                style='width: 10%'>
                <template #body='slotProps'>
                  {{ slotProps.index + 1 }}
                </template>
              </Column>
              <Column header='Họ và tên'>
                <template #body='{ data: { userId, deptName } }'>
                  <div class='flex justify-content-between row-hover'>
                    <AppUserDeptRole
                      avatar-size='2.5'
                      info-visible
                      :infos="['positionName', 'deptName', 'roleName']"
                      name-visible
                      :user-dept-role="{
                        roleId: '',
                        userId: userId,
                        deptId: '',
                        deptName: deptName,
                        userName: '',
                        roleName: '',
                        type: userDeptRole.type,
                      }"/>
                  </div>
                </template>
              </Column>
              <Column
                class='col-4'
                header='Vai trò'>
                <template #body='{ data }'>
                  <div class='flex justify-content-between row-hover'>
                    <div>{{ mapRoleName.get(data.roleId) || "" }}</div>
                    <ButtonIcon
                      v-tooltip.top="t('common.delete')"
                      class='btn-delete flex justify-content-center text-red-400 w-2rem'
                      icon='delete'
                      icon-size='1.5'
                      rounded
                      text
                      @click='deleteUser(data)'/>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

          <div class='col-6 field'>
            <label>{{ t("common.status") }}</label>
            <NamedDropdown
              id='status'
              v-model='groupReceivingDocuments.status'
              name='status'
              option-label='label'
              option-value='value'
              :options='getStatuses'/>
          </div>
        </div>
      </div>
    </form>
    <template #footer>
      <div
        class='fixed flex gap-2 justify-content-center pb-2 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'
          @click='submit'/>
      </div>
    </template>
  </Dialog>
  <SelectUsersWithRoleDialog
    v-model='usersMoreDetails'
    v-model:visible='showDialog'
    @hide-dialog='showDialog = false'/>
</template>

<script lang="ts" setup>
import { assign, isNull, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllRolesPublic } from '@/apps/admin/api/graphql/role-graphql-api';
import {
  getGroupReceivingDocumentsById,
  saveGroupReceivingDocuments,
} from '@/apps/document/api/graphql/group-receiving-documents';
import { type GroupReceivingDocumentsInterface } from '@/apps/document/model/groupReceivingDocuments';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import SelectUsersWithRoleDialog from '@/common/components/dialog/SelectUsersWithRoleDialog.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);
const groupReceivingDocuments = ref<GroupReceivingDocumentsInterface>(
  {} as GroupReceivingDocumentsInterface,
);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
if (props.id) {
  const { onResult } = getGroupReceivingDocumentsById(props.id || '');
  onResult((res) => {
    groupReceivingDocuments.value = { ...res.data.getGroupReceivingDocumentsById, };
    usersMoreDetails.value = groupReceivingDocuments.value.users;
  });
} else {
  groupReceivingDocuments.value.status = true;
}
const usersMoreDetails = ref<any[]>();
const { t } = useI18n();
const showDialog = ref(false);
let form = ref();
const submitForm = ref(false);

const visible = ref(props.visibleDialog);

const isCreate = isNull(props.id);

const deleteUser = (user: any) => {
  usersMoreDetails.value = usersMoreDetails.value?.filter(
    (item: any) => item.id !== user.id,
  );
};
const { result } = getAllRolesPublic();
const mapRoleName = computed(() => {
  return new Map<string, string>(
    result?.value?.rolesPublic?.map((role: { code: string; name: string }) => [
      role.code,
      role.name,
    ]),
  );
});
const headerDialog = computed(() =>
  isNull(props.id)
    ? t('common.createItem', {
      item: lowercaseFirstLetter(
        t('document.groupReceivingDocuments.objectName'),
      ),
    })
    : t('common.editItemName', {
      item: lowercaseFirstLetter(
        t('document.groupReceivingDocuments.objectName'),
      ),
      name: groupReceivingDocuments.value?.name,
    }),
);

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveGroupReceivingDocumentsMutate,
  onDone: saveGroupReceivingDocumentsDone,
  onError: saveGroupReceivingDocumentsError,
} = saveGroupReceivingDocuments();

function submit() {
  submitForm.value = true;
  if (
    !groupReceivingDocuments.value.code
    || !groupReceivingDocuments.value.name
  ) {
    return;
  }
  assign(groupReceivingDocuments.value, {
    id: groupReceivingDocuments.value['id']
      ? groupReceivingDocuments.value['id']
      : null,
    users: usersMoreDetails.value,
  });
  saveGroupReceivingDocumentsMutate({ groupReceivingDocuments: { ...omit(groupReceivingDocuments.value) }, });
}

saveGroupReceivingDocumentsDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.groupReceivingDocuments.objectName'),
      itemName: groupReceivingDocuments.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  groupReceivingDocuments.value = {
    status: false,
    users: null,
    code: '',
    id: undefined,
    name: '',
  };
});
saveGroupReceivingDocumentsError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({
          message: t(
            'document.groupReceivingDocuments.errors.' + errorCode.toString(),
          ),
        });
      }
    });
  }
});

let getStatuses = ref([
  {
    label: t('common.statuses.active'),
    value: true,
  },
  {
    label: t('common.statuses.deactivate'),
    value: false,
  },
]);
</script>

<style>
.p-fluid .uploadFile .p-button {
  width: unset;
}

.row-hover:hover {
  .btn-delete {
    visibility: visible;
  }
}

.btn-delete {
  visibility: hidden;
}
</style>
