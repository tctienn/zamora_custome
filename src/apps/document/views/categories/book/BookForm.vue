<template>
  <Sidebar
    v-if='book'
    v-model:visible='visible'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    class='overflow-hidden'
    :header='headerDialog'
    position='right'
    @hide="emits('hide-dialog')">
    <form
      ref='form'
      v-disabled='{ disabled: isDetail }'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-12 field'>
            <label
              v-required
              for='bookName'>{{
                t("document.book.name")
              }}</label>
            <InputText
              v-model='book.bookName'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !book.bookName'
              class='p-error'>{{
                t("document.book.errors.nameEmpty")
              }}</small>
          </div>

          <div class='col-12 field'>
            <label for='bookName'>{{ t("document.book.type") }}</label>
            <NamedDropdown
              id='bookType'
              v-model='book.bookType'
              name='bookType'
              option-label='label'
              option-value='value'
              :options='getBookType'/>
          </div>

          <div class='col-5 field'>
            <label for='bookName'>{{ t("document.book.prefix") }}</label>
            <InputText
              v-model='book.prefix'
              v-trim
              name='prefix' />
          </div>

          <div class='col-5 field'>
            <label for='bookName'>{{ t("document.book.currentNumber") }}</label>
            <InputNumber
              v-model='book.currentNumber'
              input-id='integeronly' />
            <input
              v-model='book.currentNumber'
              hidden
              name='currentNumber' />
          </div>

          <div class='col-12 field my-2'>
            <div class='flex gap-8 py-2'>
              <div class='align-items-center flex gap-2'>
                <RadioButton
                  v-model='structureType'
                  name='structureType'
                  value='ADMINISTRATIVE'/>
                <span>{{ t("document.book.ADMINISTRATIVE") }}</span>
              </div>
              <div class='align-items-center flex gap-2'>
                <RadioButton
                  v-model='structureType'
                  name='structureType'
                  value='PARTY'/>
                <span>{{ t("document.book.PARTY") }}</span>
              </div>
              <div class='align-items-center flex gap-2'>
                <RadioButton
                  v-model='structureType'
                  name='structureType'
                  value='UNION'/>
                <span>{{ t("document.book.UNION") }}</span>
              </div>
            </div>
          </div>

          <div class='col-12 field'>
            <label
              v-required
              for='bookName'>{{
                t("document.book.dept")
              }}</label>
            <TreeSelect
              v-model='deptId'
              class='mt-1 w-full'
              :empty-message="t('common.selectEmpty')"
              :filter='true'
              input-id='organizationParent'
              :options='organizations'>
              <template
                #value='{ value }: { value: TreeNode[]; placeholder: String }'>
                <div class='flex justify-content-between'>
                  <span>{{
                    value.length > 0
                      ? value[0].label
                      : t("admin.user.chooseOrganization")
                  }}</span>
                </div>
              </template>
            </TreeSelect>
            <small
              v-if='submitForm && !book.deptId'
              class='p-error'>{{
                t("document.book.errors.deptIdEmpty")
              }}</small>
          </div>

          <div class='col-12 grid my-2'>
            <div class='col-6 py-2'>
              <div class='align-items-center flex gap-3'>
                <InputSwitch
                  v-model='book.isDefault'
                  name='isDefault' />
                <label>
                  {{ t("document.book.isDefault") }}
                </label>
              </div>
            </div>

            <div class='col-6 py-2'>
              <div class='align-items-center flex gap-3'>
                <InputSwitch
                  v-model='book.isAuto'
                  name='isAuto' />
                <label>
                  {{ t("document.book.isAuto") }}
                </label>
              </div>
            </div>

            <div class='col-6 py-2'>
              <div class='align-items-center flex gap-3'>
                <InputSwitch
                  v-model='book.isGenerateByBook'
                  name='isGenerateByBook'/>
                <label>
                  {{ t("document.book.isGenerateByBook") }}
                </label>
              </div>
            </div>

            <div class='col-6 py-2'>
              <div class='align-items-center flex gap-3'>
                <InputSwitch
                  v-model='book.isGenerateByDoctype'
                  name='isGenerateByDoctype'/>
                <label>
                  {{ t("document.book.isGenerateByDoctype") }}
                </label>
              </div>
            </div>
          </div>

          <div class='col-3 field mt-2'>
            <label>{{ t(`meeting.meetingRoom.norder`) }}</label>
            <div>
              <InputNumber
                v-model='book.bookOrder'
                input-id='integeronly' />
              <input
                v-model='book.bookOrder'
                hidden
                name='bookOrder' />
            </div>
          </div>

          <div class='col-3 field mt-2'>
            <label
              v-required
              for='bookYear'>{{
                t("document.restDay.year")
              }}</label>
            <InputNumber
              v-model='book.bookYear'
              input-id='integeronly'
              :use-grouping='false'/>
            <input
              v-model='book.bookYear'
              hidden
              name='year' />
            <small
              v-if='submitForm && !book.bookYear'
              class='p-error'>{{
                t("document.restDay.errors.yearEmpty")
              }}</small>
          </div>
        </div>
      </div>
      <div
        class='bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='loading'
          type='submit'/>
      </div>
    </form>
  </Sidebar>
</template>

<script lang="ts" setup>
import { assign, get, isNull, omit } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import {
  getBookById,
  maxNOrderBook,
  saveBook,
} from '@/apps/document/api/graphql/book';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { Book, type BookInterface } from '@/apps/document/model/book';
import { OrganizationType } from '@/apps/document/model/organization';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';

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
  book: {
    type: Object as PropType<BookInterface>,
    default: {} as BookInterface,
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const book = ref<BookInterface>(props.book);
const structureType = ref();
const deptId = ref();
const loading = ref(false);

if (props.id) {
  const { onResult } = getBookById(props.book?.id || '');
  onResult((res) => {
    book.value = { ...res.data.getBookById };
    structureType.value = book.value.structureType;
    deptId.value = { [book.value.deptId]: true };
  });
} else {
  structureType.value = OrganizationType.ADMINISTRATIVE;
  const { onResult } = maxNOrderBook();
  onResult((res) => {
    book.value.bookOrder = res.data.maxOrderActiveBook;
  });
  book.value = {
    ...book.value,
    isAuto: false,
    isDefault: false,
    isGenerateByBook: false,
    isGenerateByDoctype: false,
  };
}

const { t } = useI18n();

let getBookType = ref([
  {
    label: t('document.book.docCome'),
    value: 'DOC_IN',
  },
  {
    label: t('document.book.docOut'),
    value: 'DOC_OUT',
  },
]);

let form = ref();
const submitForm = ref(false);

const visible = ref(props.visibleDialog);

const isCreate = isNull(props.id);

const headerDialog = !props.id
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.book.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.book.objectName')),
    name: book.value.bookName,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveBookMutate,
  onDone: saveBookDone,
  onError: saveBookError,
} = saveBook();
const organizations = ref([]);

function submit() {
  submitForm.value = true;
  if (!book.value.bookName || !book.value.bookYear || !deptId.value) {
    return;
  }
  assign(book.value, { id: book.value['id'] ? book.value['id'] : null });
  loading.value = true;
  saveBookMutate({
    book: {
      ...omit(book.value),
      structureType: structureType.value,
      deptId: Object.keys(deptId.value)[0],
    },
  });
}

saveBookDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.book.objectName'),
      itemName: book.value.bookName,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  book.value = new Book();
});
saveBookError((mess) => {
  if (mess.graphQLErrors) {
    loading.value = false;
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('document.book.errors.' + errorCode.toString()), });
      }
    });
  }
});

const fetchOrganizations = (type: string) => {
  if (type === 'ADMINISTRATIVE') {
    const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
    getAllOrganizationResult((response) => {
      const data = get(response, 'data.allOrganizationPublic', []);
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.code,
          parentId: organization.parentCode,
          children: [],
        })),
        {
          id: 'data',
          parentId: 'parentId',
          children: 'children',
        },
      );
    });
  } else {
    const { onResult: getOrganizationResult } = getByTypeGraphql(type);
    getOrganizationResult((res) => {
      const data = res.data.getByType;
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.id,
          parentId: organization.parentId,
          children: [],
        })),
        {
          id: 'key',
          parentId: 'parentId',
          children: 'children',
        },
      );
    });
  }
};

onMounted(() => {
  fetchOrganizations(structureType.value);
});

watch(structureType, (newValue) => {
  fetchOrganizations(newValue);
});
</script>

<style>
.p-fluid .uploadFile .p-button {
  width: unset;
}
</style>
