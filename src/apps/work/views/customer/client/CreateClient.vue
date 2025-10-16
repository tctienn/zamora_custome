<template>
  <div class='mb-2'>
    <h6 class='margin_small-header text-lg'>{{ t('work.client.createClient') }}</h6>
  </div>
  <div class='p-fluid'>
    <div class='formgrid grid'>
      <!--      <div class='col field'>-->
      <!--        <label-->
      <!--          v-required-->
      <!--          for='objectCode'>{{ t('work.client.clientCode') }}</label>-->
      <!--        <InputText-->
      <!--          id='objectCode'-->
      <!--          v-model='formClient.clientCode'-->
      <!--          autofocus-->
      <!--          hidden-->
      <!--        />-->
      <!--        <small-->
      <!--          v-if='submitFormClient == true && !formClient.clientCode'-->
      <!--          class='p-error'>{{ t('work.client.message.clientCodeEmpty') }}</small>-->
      <!--      </div>-->

      <div class='col-6 field'>
        <label
          v-required
          for='clientName'>{{ t('work.client.clientName') }}</label>
        <InputText
          id='clientName'
          v-model='formClient.clientName'/>
        <small
          v-if='submitFormClient && !formClient.clientName'
          class='p-error'>{{ t('work.client.message.clientNameEmpty') }}</small>
      </div>
    </div>

    <!--    <div class='mb-2'>-->
    <!--      <h6 class='margin_small-header text-lg'>{{ t('work.client.address') }}</h6>-->
    <!--    </div>-->
    <div class='formgrid grid'>
      <div class='col field'>
        <span>
          <label
            for='currentStreet'>{{ t('work.client.street') }}</label>
          <InputText
            id='currentStreet'
            v-model='formClient.home'
            :placeholder='t("work.client.fillInput",{item:t("work.client.street")})'/>
        </span>
      </div>
      <div class='col field'>
        <span>
          <label
            for='currentCity'>{{ t('work.client.cityDistrictWard') }}</label>
          <AutoComplete
            id='currentCity'
            v-model='formClient.city'
            class='flex-1'
            :placeholder='t("work.client.fillInput",{item:t("work.client.cityDistrictWard")})'
            :suggestions='cityDistrictWardList'
            @complete='handleChangeCity'/>
        </span>
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          for='residence'>{{ t('work.client.fullAddress') }}</label>
        <InputText
          id='residence'
          v-model='formClient.address'
          disabled
          name='residence'/>
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          v-required
          for='objectCode'>{{ t('work.client.groupClient') }}</label>
        <NamedDropdown
          id='type'
          v-model='formClient.groupClient'
          class='w-full'
          filter
          name='type'
          option-label='name'
          option-value='code'
          :options='categoriesCustomer'/>
        <small
          v-if='submitFormClient && !formClient.groupClient'
          class='p-error'>{{ t('work.client.message.groupClientEmpty') }}</small>
      </div>

      <div class='col field'>
        <label
          v-required
          for='objectName'>{{ t('work.client.field') }}</label>
        <Dropdown
          v-model='formClient.field'
          :empty-message='t("common.selectEmpty")'
          :filter='true'
          input-id='applicationStatus'
          option-label='name'
          option-value='code'
          :options='listField'
          :placeholder='t("work.client.chooseField")'/>
        <small
          v-if='submitFormClient && !formClient.field'
          class='p-error'>{{ t('work.client.message.fieldEmpty') }}</small>
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          v-required
          for='objectCode'>{{ t('work.client.taxCode') }}</label>
        <InputText
          id='objectCode'
          v-model='formClient.taxCode'/>
        <small
          v-if='submitFormClient && !formClient.taxCode'
          class='p-error'>{{ t('work.client.message.taxCodeEmpty') }}</small>
      </div>

      <div class='col field'>
        <label
          for='objectName'>{{ t('work.client.foundingDate') }}</label>
        <Calendar
          v-model='formClient.foundingDate'
          name='foundingDate'
          :select-other-months='true'
          show-icon/>
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          for='objectCode'>{{ t('work.client.scale') }}</label>
        <InputText
          id='objectCode'
          v-model='formClient.scale'/>
      </div>

      <div class='col field'>
        <label
          for='objectName'>{{ t('work.client.email') }}</label>
        <InputText
          id='objectName'
          v-model='formClient.email'/>
        <small
          v-if='submitFormClient && formClient.email && !formClient.email.match(mailFormatRegex)'
          class='p-error'>{{ t('work.client.message.emailInvalid') }}</small>
      </div>
    </div>

    <div class='formgrid grid'>
      <div class='col field'>
        <label
          for='objectCode'>{{ t('work.client.phone') }}</label>
        <InputText
          id='objectCode'
          v-model='formClient.phone'/>
        <small
          v-if='submitFormClient && formClient.phone && !formClient.phone.match(telephoneNumberRegex)'
          class='p-error'>{{ t('work.client.message.phoneInvalid') }}</small>
      </div>

      <div class='col field'>
        <label
          for='objectName'>{{ t('work.client.note') }}</label>
        <InputText
          id='objectName'
          v-model='formClient.note'/>
      </div>
    </div>
    <div class='formgrid grid'>
      <div class='col field'>
        <label
          for='objectCode'>{{ t('work.client.contact') }}</label>
        <InputText
          id='objectCode'
          v-model='formClient.contact'/>
      </div>

      <div class='col field'>
        <label
          for='objectName'>{{ t('work.client.position') }}</label>
        <InputText
          id='objectName'
          v-model='formClient.position'/>
      </div>
    </div>
    <div class='formgrid grid'>
      <div class='col field'>
        <label
          for='objectCode'>{{ t('work.client.contactPhone') }}</label>
        <InputText
          id='objectCode'
          v-model='formClient.contactPhone'/>
        <small
          v-if='submitFormClient && formClient.contactPhone && !formClient.contactPhone.match(telephoneNumberRegex)'
          class='p-error'>{{ t('work.client.message.phoneInvalid') }}</small>
      </div>

      <div class='col field'>
        <label
          for='objectName'>{{ t('work.client.contactEmail') }}</label>
        <InputText
          id='objectName'
          v-model='formClient.contactEmail'/>
        <small
          v-if='submitFormClient && formClient.contactEmail && !formClient.contactEmail.match(mailFormatRegex)'
          class='p-error'>{{ t('work.client.message.emailInvalid') }}</small>
      </div>
    </div>
  </div>

  <div class='flex flex-row justify-content-center py-1'>
    <Button
      icon='pi pi-times'
      label='close'
      severity='danger'
      text
      @click='router.go(-1)'>
      {{ t('common.close') }}
    </Button>
    <Button
      v-if='formClient.id != null'
      icon='pi pi-check'
      :label='t("common.update")'
      text
      @click='fnUpdateClient'>
      {{ t('common.update') }}
    </Button>
    <Button
      v-else
      icon='pi pi-check'
      label='save'
      text
      @click='fnSaveClient'>
      {{ t('common.save') }}
    </Button>
  </div>

  <Divider/>

  <Menu
    ref='menu'
    :model='actions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { assign, isEmpty } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getCategoriesByGroupGraphql,
  getCategoryByGroupCodePublicGraphql
} from '@/apps/admin/api/graphql/category-graphql-api';
import type { CategoryInterface } from '@/apps/admin/model/category';
import { createClient, updateClient, } from '@/apps/work/api/graphql/client-tenant-graphql-api';
import { FIELD } from '@/apps/work/constants';
import citiesJson from '@/apps/work/constants/cities.json';
import type { ClientInterface } from '@/apps/work/model/client';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import router from '@/common/router';

let emit = defineEmits(['closeDialog']);

const mailFormatRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const telephoneNumberRegex = /((09|03|07|08|05)+([0-9]{8})\b)/g;

const { t } = useI18n();
const disableTab = ref(true);
const totalRecords = ref(0);
let formClient = ref<ClientInterface>({} as ClientInterface);
const menu = ref();
const listField = ref<CategoryInterface[]>([]);
let actions = ref<MenuItem[]>([]);
const cityDistrictWardList = ref<string[]>([]);
const submitFormClient = ref(false);

const { moment } = useMoment();
const {
  mutate: createClientMutate,
  onDone: createClientOnDone
} = createClient();
const {
  mutate: updateClientMutate,
  onDone: updateClientOnDone
} = updateClient();
const {
  onResult: getCategoriesByGroupOnResult,
  load: getCategoriesByGroupLoad
} = getCategoriesByGroupGraphql();

getCategoriesByGroupLoad(undefined, { groupCode: FIELD });
getCategoriesByGroupOnResult((res) => {
  listField.value = res.data.groupCategories;
});

function handleChangeCity() {
  if (formClient.value.city.length > 3) {
    const searchText = convertToNonAccent(formClient.value.city);
    const formattedStrings = [];

    for (const city of citiesJson) {
      for (const district of city.districts) {
        for (const ward of district.wards) {
          if (city.codename.includes(searchText) || district.codename.includes(searchText) || ward.codename.includes(searchText)) {
            formattedStrings.push(`${ward.name} - ${district.name} - ${city.name}`);
          }
        }
      }
    }
    cityDistrictWardList.value = formattedStrings;
  }
}

function convertToNonAccent(input: string) {
  return input.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/ /g, '_');
}

function close() {
  emit('closeDialog', false);
}

function hideDialog() {
  emit('closeDialog', false);
}

function fnSaveClient() {
  submitFormClient.value = true;
  if (isEmpty(formClient.value.clientName)
      || isEmpty(formClient.value.groupClient) || isEmpty(formClient.value.field)
      || isEmpty(formClient.value.taxCode)) {
    return;
  }

  if (!isEmpty(formClient.value.email) && !formClient.value.email.match(mailFormatRegex)
      || !isEmpty(formClient.value.phone) && !formClient.value.phone.match(telephoneNumberRegex)) {
    return;
  }

  // formClient.value.foundingDate = new Date(formClient.value.foundingDate.getTime() - formClient.value.foundingDate.getTimezoneOffset() * 60 * 1000);
  createClientMutate({
    data: {
      ...formClient.value,
      foundingDate: moment(formClient.value.foundingDate).format('YYYY-MM-DDTHH:mm:ss')
    }
  });
}

function fnUpdateClient() {
  submitFormClient.value = true;
  if (isEmpty(formClient.value.clientCode) || isEmpty(formClient.value.clientName)
      || isEmpty(formClient.value.groupClient) || isEmpty(formClient.value.field)
      || isEmpty(formClient.value.taxCode)) {
    return;
  }
  // formClient.value.foundingDate = new Date(formClient.value.foundingDate.getTime() - formClient.value.foundingDate.getTimezoneOffset() * 60 * 1000);
  updateClientMutate({
    data: {
      ...formClient.value,
      foundingDate: moment(formClient.value.foundingDate).format('YYYY-MM-DDTHH:mm:ss')
    }
  });
}

createClientOnDone((res) => {
  toastSuccess({ message: t('work.client.message.createSuccess') });
  assign(formClient.value, res.data.createClient);
  formClient.value.foundingDate = new Date(res.data.createClient.foundingDate);
  disableTab.value = false;
}
);

updateClientOnDone(() => {
  toastSuccess({ message: t('work.client.message.updateSuccess') });
}
);

watch(() => ({
  street: formClient.value.home,
  wardDistrictCity: formClient.value.city
}), (value) => {
  const street = value.street.replace(/-/g, ',').trim() || '';
  const wardDistrictCity = value.wardDistrictCity || '';
  formClient.value.address = `${street} - ${wardDistrictCity}`;
});

const categoriesCustomer = ref<CategoryInterface[]>([]);

const {
  onResult: getAllCategoryByGroupCodePublicOnResult,
  onError: getAllCategoryByGroupCodePublicOnError
} = getCategoryByGroupCodePublicGraphql('CUSTOMER_TYPE');
getAllCategoryByGroupCodePublicOnResult(res => {
  categoriesCustomer.value = res.data.getCategoryByGroupCodePublic as CategoryInterface[];
});
getAllCategoryByGroupCodePublicOnError(res => {
});

</script>

<style scoped>

label {
  font-weight: bold;
}
</style>