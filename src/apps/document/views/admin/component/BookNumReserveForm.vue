<template>
  <Sidebar
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    @hide="emits('hide-dialog')">
    <form
      ref='form'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-12 field'>
            <label
              v-required
              for='requestUserId'>{{
                t("document.bookNumReserve.registerUser")
              }}</label>
            <NamedSelectUser
              v-model='bookNumReserve.requestUserId'
              :button-select-user='false'
              class='w-full'
              name='requestUserId'
              :placeholder="'Chọn'"
              style='height: 40px'/>
            <small
              v-if='submitForm && !bookNumReserve.requestUserId'
              class='p-error'>{{ t("document.bookNumReserve.errors.requestUserId") }}</small>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='bookName'>{{
                t("document.bookNumReserve.bookName")
              }}</label>
            <NamedDropdown
              :id='id'
              v-model='bookNumReserve.bookId'
              class='w-full'
              filter
              name='bookId'
              option-label='name'
              option-value='id'
              :options='books'/>
            <small
              v-if='submitForm && !bookNumReserve.bookId'
              class='p-error'>{{ t("document.bookNumReserve.errors.bookId") }}</small>
          </div>

          <div class='col-6 field'>
            <label for='bookName'>{{
              t("document.bookNumReserve.bookType")
            }}</label>
            <NamedDropdown
              :id='id'
              v-model='bookNumReserve.bookType'
              class='w-full'
              filter
              :is-show-clear='true'
              name='bookType'
              option-label='name'
              option-value='id'
              :options='docTypes'/>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='bookNum'>{{
                t("document.bookNumReserve.bookNum")
              }}</label>
            <InputText
              v-model='bookNumReserve.bookNumber'
              v-trim
              name='bookNum'/>
            <small
              v-if='submitForm && !bookNumReserve.bookNumber'
              class='p-error'>{{ t("document.bookNumReserve.errors.bookNumber") }}</small>

            <small
              v-if='submitForm && bookNumReserve.bookNumber && !validateInput(bookNumReserve.bookNumber)'
              class='p-error'>Số book nhập không hợp lệ</small>
          </div>

          <div class='col-6 field'>
            <label for='bookDate'>{{
              t("document.bookNumReserve.dateWant")
            }}</label>
            <NamedInputCalendar
              v-model='bookNumReserve.bookDate'
              class='w-full'
              icon-display='input'
              name='fromDate'
              :select-other-months='true'
              show-icon/>
          </div>

          <div class='col-12 field'>
            <label for='positionDescription'>{{
              t("document.bookNumReserve.note")
            }}</label>
            <Textarea
              id='positionDescription'
              v-model='bookNumReserve.note'
              v-trim
              name='note'
              rows='3'/>
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
          type='submit'/>
      </div>
    </form>
  </Sidebar>
</template>

<script setup lang="ts">
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllDocOutBook } from '@/apps/document/api/graphql/book';
import { getBookNumReserveById, saveBookNumReserve, } from '@/apps/document/api/graphql/book-num-reserve';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import type { BookInterface } from '@/apps/document/model/book';
import type { BookNumReserveInterface } from '@/apps/document/model/bookNumReserve';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DateTimeFormat, DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

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
  bookNumReserve: {
    type: Object as PropType<BookNumReserveInterface>,
    default: {} as BookInterface,
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const bookNumReserve = ref<BookNumReserveInterface>(props.bookNumReserve);
const { t } = useI18n();
let form = ref();
const books = ref<BookInterface[]>([]);
const docTypes = ref();
const submitForm = ref(false);
const headerDialog = props.id
  ? t('document.bookNumReserve.updateBookNumReserve')
  : t('document.bookNumReserve.createBookNumReserve');
const visible = ref(props.visibleDialog);
const { moment } = useMoment();

if (props.id) {
  const { onResult } = getBookNumReserveById(props.id || '');
  onResult((res) => {
    bookNumReserve.value = {
      ...res.data.getBookNumReserveById,
      bookNumber: res.data.getBookNumReserveById.bookNumber.join(','),
      bookDate: res.data.getBookNumReserveById.bookDate ? new Date(res.data.getBookNumReserveById.bookDate) : null
    };
  });
} else {
  bookNumReserve.value = {} as BookNumReserveInterface;
}

const { onResult: getBookResult } = getAllDocOutBook();
const { onResult: getDocTypeResult } = getAllDocType();
getBookResult((res) => {
  books.value = res.data.getAllDocOutBook.map((item: BookInterface) => ({
    name: item.bookName,
    id: item.id,
  }));
});

getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
});

const {
  mutate: saveBookNumReserveMutate,
  onDone: saveBookNumReserveDone,
  onError: saveBookNumReserveError,
} = saveBookNumReserve();

function submit() {
  submitForm.value = true;
  if (
    !bookNumReserve.value.requestUserId
      || !bookNumReserve.value.bookNumber
      || !bookNumReserve.value.bookId || !validateInput(bookNumReserve.value.bookNumber)
  ) {
    return;
  }
  saveBookNumReserveMutate({
    bookNumReserve: {
      ...bookNumReserve.value,
      bookNumber: bookNumReserve.value.bookNumber
        .replace(/\s+/g, '')
        .split(','),
      bookDate: moment(bookNumReserve.value.bookDate).format(
        DateTimeFormat.ISO_LOCAL_DATE,
      ),
    },
  });
}

saveBookNumReserveDone(() => {
  toastSuccess({ message: t('document.bookNumReserve.saveDone') });
  emits('hide-dialog');
});

function validateInput(input: string): boolean {
  const regex = /^(\d+\s*,\s*)*\d+$/;

  return regex.test(input);
}

saveBookNumReserveError((error) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t(`document.bookNumReserve.${errorCode.toString()}`), });
      }
    });
  }
});
</script>

<style scoped></style>
