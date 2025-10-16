<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :show-close-icon='false'
    :style='{
      width: "60vw",
    }'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click="emits('hide-dialog')"/>
          {{
            isDetail
              ? t('book-ticket.bookFlight.titleDetail')
              : t(`vehicle.common.${id ? 'update' : 'create'}`) +
                ' ' +
                t('book-ticket.bookFlight.titleForm')
          }}
        </div>
      </div>
    </template>
    <div>
      <form
        ref='formBookFlight'
        class='mb-6'>
        <div class='formgrid grid mb-4'>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.requestNumber`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='bookFlight.requestNumber'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='requestNumber'/>
              <ValidateErrorMessage :errors='v$.requestNumber.$errors'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.requestNumber }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{ t('book-ticket.bookFlight.createdDate') }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <NamedInputCalendar
                v-model='bookFlight.createdDate'
                format='DD/MM/YYYY'
                :min-date='new Date()'
                name='createdDate'
                :select-other-months='true'
                show-icon/>
              <ValidateErrorMessage :errors='v$.createdDate.$errors'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{
                moment(bookFlight.createdDate)
                  .format('dddd, HH:mm DD/MM/YYYY')
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{ t(`book-ticket.bookFlight.officerId`) }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <NamedSelectUser
                v-model='bookFlight.officerId'
                :button-select-user='false'
                class='w-full'
                name='officerId'
                style='height: 40px'/>
              <ValidateErrorMessage :errors='v$.officerId.$errors'/>

            </div>
            <div
              v-else
              class='font-bold'>
              <AppUser
                avatar-size='2.5'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible
                :user-id='bookFlight.officerId'></AppUser>
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.departmentName`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='departmentName'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='position'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ departmentName }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.officerCode`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='officerCode'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='officerCode'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ officerCode }}
            </div>
          </div>
          <div class='col-3 field'>
            <label>{{
              t(`book-ticket.bookFlight.gender`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='gender'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='gender'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ gender }}
            </div>
          </div>
          <div class='col-3 field'>
            <label>{{
              t(`book-ticket.bookFlight.positionName`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='positionName'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='positionName'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ positionName }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.unitName`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='unitName'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='unitName'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ unitName }}
            </div>
          </div>
          <div class='col-3 field'>
            <label>{{
              t(`book-ticket.bookFlight.phoneNumber`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='phoneNumber'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='phoneNumber'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ phoneNumber }}
            </div>
          </div>
          <div class='col-3 field'>
            <label>{{
              t(`book-ticket.bookFlight.email`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='email'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='email'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ email }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.goldenLotusCode`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='bookFlight.goldenLotusCode'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='goldenLotusCode'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.goldenLotusCode }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.workContentId`)
            }}</label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='bookFlight.workContentId'
                class='p-component w-full'
                filter
                option-label='content'
                option-value='id'
                :options='workContentOptions'
                show-clear/>
              <input
                v-model='bookFlight.workContentId'
                hidden
                name='workContentId'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.workContentContent }}
            </div>
          </div>
          <div
            class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.flightType`)
            }}</label>
            <div
              v-if='!isDetail'
              class='flex flex-wrap gap-6 mt-2'>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='bookFlight.flightType'
                  input-id='ingredient2'
                  name='flightType'
                  :value='FlightType.DOMESTIC'/>
                <label
                  class='ml-2'
                  for='ingredient2'>{{
                    t(`book-ticket.bookFlight.flightTypeOption.DOMESTIC`)
                  }}</label>
              </div>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='bookFlight.flightType'
                  input-id='ingredient1'
                  name='flightType'
                  :value='FlightType.INTERNATIONAL'/>
                <label
                  class='ml-2'
                  for='ingredient1'>{{
                    t(`book-ticket.bookFlight.flightTypeOption.INTERNATIONAL`)
                  }}</label>
              </div>

            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.flightType }}
            </div>
          </div>
          <div
            class='col-6 field'>
            <div
              class='field'
              :class="{ 'invisible-keep-space': bookFlight.flightType !== FlightType.INTERNATIONAL }">
              <label>{{
                t(`book-ticket.bookFlight.cityId`)
              }}</label>
              <div v-if='!isDetail'>
                <Dropdown
                  v-model='bookFlight.cityId'
                  class='p-component w-full'
                  filter
                  option-label='cityName'
                  option-value='cityId'
                  :options='cityOptions'
                  show-clear/>
                <input
                  v-model='bookFlight.cityId'
                  hidden
                  name='cityId'>
              </div>
              <div
                v-else
                class='font-bold'>
                {{ bookFlight.cityName }}
              </div>
            </div>
          </div>

          <div class='col-6 field'>
            <label>{{ t('book-ticket.bookFlight.flightDate') }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <NamedInputCalendar
                v-model='bookFlight.flightDate'
                :class="
                  bookFlight.returnFlightDate < bookFlight.flightDate
                    ? 'p-invalid'
                    : ''
                "
                format='DD/MM/YYYY'
                :min-date='new Date()'
                name='flightDate'
                :select-other-months='true'
                show-icon/>
              <ValidateErrorMessage :errors='v$.flightDate.$errors'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{
                moment(bookFlight.flightDate)
                  .format('dddd, HH:mm DD/MM/YYYY')
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{ t('book-ticket.bookFlight.returnFlightDate') }}</label>
            <div v-if='!isDetail'>
              <NamedInputCalendar
                v-model='bookFlight.returnFlightDate'
                :class="
                  bookFlight.returnFlightDate < bookFlight.flightDate
                    ? 'p-invalid'
                    : ''
                "
                format='DD/MM/YYYY'
                :min-date='new Date()'
                name='returnFlightDate'
                :select-other-months='true'
                show-icon/>
              <small
                v-if='bookFlight.returnFlightDate < bookFlight.flightDate'
                class='p-error'>
                {{ t(`book-ticket.bookFlight.validator.returnFlightDate`) }}
              </small>
            </div>
            <div
              v-else
              class='font-bold'>
              {{
                bookFlight.returnFlightDate ? moment(bookFlight.returnFlightDate)
                  .format('dddd, HH:mm DD/MM/YYYY')
                  .replace(/^\w/, (c) => c.toUpperCase()) : ''
              }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.departureAirportId`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='bookFlight.departureAirportId'
                class='p-component w-full'
                filter
                :option-disabled='(option) => option.id === bookFlight.airportDepartureReturnId'
                option-label='name'
                option-value='id'
                :options='airportOptions'
                show-clear/>
              <ValidateErrorMessage :errors='v$.departureAirportId.$errors'/>
              <input
                v-model='bookFlight.departureAirportId'
                hidden
                name='departureAirportId'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.departureAirportName }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.airportDepartureReturnId`)
            }}</label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='bookFlight.airportDepartureReturnId'
                class='p-component w-full'
                filter
                :option-disabled='(option) => option.id === bookFlight.departureAirportId'
                option-label='name'
                option-value='id'
                :options='airportOptions'
                show-clear/>
              <input
                v-model='bookFlight.airportDepartureReturnId'
                hidden
                name='airportDepartureReturnId'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.airportDepartureReturnName }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.airportToDepartureId`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='bookFlight.airportToDepartureId'
                class='p-component w-full'
                filter
                :option-disabled='(option) => option.id === bookFlight.airportToReturnId'
                option-label='name'
                option-value='id'
                :options='airportOptions'
                show-clear/>
              <ValidateErrorMessage :errors='v$.airportToDepartureId.$errors'/>
              <input
                v-model='bookFlight.airportToDepartureId'
                hidden
                name='airportToDepartureId'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.airportToDepartureName }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.airportToReturnId`)
            }}</label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='bookFlight.airportToReturnId'
                class='p-component w-full'
                filter
                :option-disabled='(option) => option.id === bookFlight.airportToDepartureId'
                option-label='name'
                option-value='id'
                :options='airportOptions'
                show-clear/>
              <input
                v-model='bookFlight.airportToReturnId'
                hidden
                name='airportToReturnId'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.airportToReturnName }}
            </div>
          </div>
          <div
            v-if='!isDetail'
            class='col-12 field'>
            <label>{{
              t(`book-ticket.bookFlight.requestType`)
            }}</label>
            <div class='flex flex-wrap gap-6 mt-2'>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='bookFlight.requestType'
                  input-id='ingredient1'
                  name='requestType'
                  :value='RequestType.BOOK_SPECIFIC_FLIGHT'/>
                <label
                  class='ml-2'
                  for='ingredient1'>{{
                    t(`book-ticket.bookFlight.requestTypeOption.BOOK_SPECIFIC_FLIGHT`)
                  }}</label>
              </div>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='bookFlight.requestType'
                  input-id='ingredient2'
                  name='requestType'
                  :value='RequestType.AGENT_CHOOSE_FLIGHT'/>
                <label
                  class='ml-2'
                  for='ingredient2'>{{
                    t(`book-ticket.bookFlight.requestTypeOption.AGENT_CHOOSE_FLIGHT`)
                  }}</label>
              </div>
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{ t('book-ticket.bookFlight.departureTime') }}</label>
            <div v-if='!isDetail'>
              <Calendar
                v-model='bookFlight.departureTime'
                :class="
                  bookFlight.returnFlightTime < bookFlight.departureTime
                    ? 'p-invalid'
                    : ''
                "
                name='departureTime'
                show-icon
                time-only/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{
                moment(bookFlight.departureTime)
                  .format('dddd, HH:mm DD/MM/YYYY')
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{ t('book-ticket.bookFlight.returnFlightTime') }}</label>
            <div v-if='!isDetail'>
              <Calendar
                v-model='bookFlight.returnFlightTime'
                :class="
                  bookFlight.returnFlightTime < bookFlight.departureTime
                    ? 'p-invalid'
                    : ''
                "
                name='returnFlightTime'
                show-icon
                time-only/>
              <small
                v-if='bookFlight.returnFlightTime < bookFlight.departureTime'
                class='p-error'>
                {{ t(`book-ticket.bookFlight.validator.returnFlightTime`) }}
              </small>
            </div>
            <div
              v-else
              class='font-bold'>
              {{
                moment(bookFlight.returnFlightTime)
                  .format('dddd, HH:mm DD/MM/YYYY')
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.outboundFlightNumber`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='bookFlight.outboundFlightNumber'
                :class="{
                  'p-component p-inputtext w-full': true,
                  'p-invalid': bookFlight.returnFlightNumber && bookFlight.outboundFlightNumber === bookFlight.returnFlightNumber
                }"
                maxlength='255'
                name='outboundFlightNumber'/>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.outboundFlightNumber }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.returnFlightNumber`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='bookFlight.returnFlightNumber'
                :class="{
                  'p-component p-inputtext w-full': true,
                  'p-invalid': bookFlight.returnFlightNumber && bookFlight.outboundFlightNumber === bookFlight.returnFlightNumber
                }"
                maxlength='255'
                name='returnFlightNumber'/>
              <small
                v-if='bookFlight.returnFlightNumber && bookFlight.outboundFlightNumber === bookFlight.returnFlightNumber'
                class='p-error'>
                {{ t(`book-ticket.bookFlight.validator.returnFlightNumber`) }}
              </small>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.returnFlightNumber }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.airlineDepartureId`)
            }}</label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='bookFlight.airlineDepartureId'
                class='p-component w-full'
                filter
                option-label='name'
                option-value='id'
                :options='airlineOptions'
                show-clear/>
              <input
                v-model='bookFlight.airlineDepartureId'
                hidden
                name='airlineDepartureId'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.airlineDepartureName }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.bookFlight.airlineReturnId`)
            }}</label>
            <div v-if='!isDetail'>
              <Dropdown
                v-model='bookFlight.airlineReturnId'
                class='p-component w-full'
                filter
                option-label='name'
                option-value='id'
                :options='airlineOptions'
                show-clear/>
              <input
                v-model='bookFlight.airlineReturnId'
                hidden
                name='airlineReturnId'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.airlineReturnName }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{ t('book-ticket.bookFlight.flightScheduleDescription') }}</label>
            <div v-if='!isDetail'>
              <Textarea
                v-model='bookFlight.flightScheduleDescription'
                class='w-full'
                cols='30'
                rows='3'/>
              <input
                v-model='bookFlight.flightScheduleDescription'
                hidden
                name='flightScheduleDescription'>
            </div>
            <div
              v-else
              class='font-bold'>
              {{ bookFlight.flightScheduleDescription }}
            </div>
          </div>

          <div
            class='align-content-center align-items-center col-12 flex justify-content-between mb-2 vertical-align-middle'>
            <label
              class='font-semibold text-xl'
              for='attach'>{{ t('book-ticket.bookFlight.attachment.title') }}</label>
            <Button
              v-if='!isDetail'
              class='p-button-plain'
              icon='pi pi-plus'
              severity='secondary'
              size='small'
              @click='showAddFileDialog=true'/>
          </div>
          <AttachmentFileList
            v-model:receiving-docs='attachedFiles'
            class='col-12'
            :is-detail='isDetail'
            :on-delete='handleDeleteFileAttachment'/>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            @click="emits('hide-dialog')"/>
          <Button
            v-if='!isDetail'
            icon='pi pi-save'
            :label="t('common.save')"
            :loading='isSubmitting'
            @click='submit'/>
        </div>
      </form>
      <AddFileModal
        v-if='showAddFileDialog'
        v-model:visible-dialog='showAddFileDialog'
        @submit='handleSubmitFile'/>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Department } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

import { getAllAirline } from '../../api/graphql/airline';
import { getAllAirport } from '../../api/graphql/airport';
import { deleteBookingFlightAttachment, getBookFlightById } from '../../api/graphql/book-flight';
import { getAllCity } from '../../api/graphql/country';
import { getAllWorkContent } from '../../api/graphql/work-content';
import { saveBookFlight } from '../../api/rest/book-flight';
import type { IAirline } from '../../model/airline';
import type { IAirport } from '../../model/airport';
import { FlightType, type IAttachmentFile, type IBookFlight, RequestType } from '../../model/bookFlight';
import type { ICity } from '../../model/country';
import type { IWorkContent } from '../../model/workContent';
import AddFileModal from './component/AddFileModal.vue';
import AttachmentFileList from './component/AttachmentFileList.vue';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  isSidebar: {
    type: Boolean,
    default: true,
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

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visibleForm = ref<boolean>(props.visibleDialog);
const bookFlight = ref<IBookFlight>({} as IBookFlight);
const isSubmitting = ref<boolean>(false);
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const formBookFlight = ref<HTMLFormElement>();

const officerId = computed((): string => bookFlight.value.officerId);
const officerCode = ref<string>();
const departmentName = ref<string>();
const positionName = ref<string>();
const unitName = ref<string>();
const gender = ref<string>();
const phoneNumber = ref<string>();
const email = ref<string>();
const attachedFiles = ref<IAttachmentFile[]>([]);
const showAddFileDialog = ref<boolean>(false);
const workContentOptions = ref<IWorkContent[]>([]);
const cityOptions = ref<ICity[]>([]);
const airportOptions = ref<IAirport[]>([]);
const airlineOptions = ref<IAirline[]>([]);
const { mutate: deleteAttachment } = deleteBookingFlightAttachment();

const validateRules = {
  requestNumber: {
    required: helpers.withMessage(
      t('book-ticket.bookFlight.required.requestNumber'),
      required,
    ),
  },
  createdDate: {
    required: helpers.withMessage(
      t('book-ticket.bookFlight.required.createdDate'),
      required,
    ),
  },
  officerId: {
    required: helpers.withMessage(
      t('book-ticket.bookFlight.required.officerId'),
      required,
    ),
  },
  flightDate: {
    required: helpers.withMessage(
      t('book-ticket.bookFlight.required.flightDate'),
      required,
    ),
  },
  departureAirportId: {
    required: helpers.withMessage(
      t('book-ticket.bookFlight.required.departureAirportId'),
      required,
    ),
  },
  airportToDepartureId: {
    required: helpers.withMessage(
      t('book-ticket.bookFlight.required.airportToDepartureId'),
      required,
    ),
  }
};
const v$ = useVuelidate(validateRules, bookFlight);

getAllWorkContent().onResult((res) => {
  workContentOptions.value = res.data.getAllWorkContent;
});
getAllCity().onResult((res) => {
  cityOptions.value = res.data.getAllCity;
});
getAllAirline().onResult((res) => {
  airlineOptions.value = res.data.getAllAirline;
});
getAllAirport().onResult((res) => {
  airportOptions.value = res.data.getAllAirport;
});

if (props.id) {
  const { onResult: getBookFlightByIdOnResult } = getBookFlightById(props.id);
  getBookFlightByIdOnResult((res) => {
    const value = get(res, 'data.getDetailBookingFlightById');
    console.log(value);
    bookFlight.value = {
      ...value,
      createdDate: new Date(value.createdDate),
      flightDate: value.flightDate ? new Date(value.flightDate) : null,
      returnFlightDate: value.returnFlightDate ? new Date(value.returnFlightDate) : null,
      departureTime: value.departureTime ? moment(value.departureTime, 'HH:mm').toDate() : null,
      returnFlightTime: value.returnFlightTime ? moment(value.returnFlightTime, 'HH:mm').toDate() : null,
    };

    if (Array.isArray(value.attachments)) {
      attachedFiles.value = value.attachments.map((att: IAttachmentFile) => ({
        quote: att.quote || '',
        attachment: {
          name: att.attachment,
          size: att.size
        },
        id: att?.id,
        downloadPath: att.downloadPath
      }));
    }
  });
} else {
  bookFlight.value.flightType = FlightType.DOMESTIC;
  bookFlight.value.requestType = RequestType.BOOK_SPECIFIC_FLIGHT;
}

watch(officerId, (id) => {
  getInfoUserBooking(id);
});

function getInfoUserBooking(id: string) {
  officerCode.value = usersMoreInfo.value[id]?.username;
  positionName.value = usersMoreInfo.value[id]?.positionName.join(', ');
  gender.value = usersMoreInfo.value[id]?.gender === 1 ? 'Nam' : 'Nữ';
  phoneNumber.value = usersMoreInfo.value[id]?.phone;
  email.value = usersMoreInfo.value[id]?.email;
  departmentName.value = usersMoreInfo.value[id]?.departments
    ?.map((department: Department) => department.name)
    .join(', ');
}

function appendAttachedFilesToFormData(formData: FormData, files: IAttachmentFile[]) {
  files.forEach((file, index) => {
    const prefix = `files[${index}]`;

    formData.append(`${prefix}.quote`, file.quote);
    if (file.attachment instanceof File) {
      formData.append(`${prefix}.attachment`, file.attachment);
    }
    if (file.id) {
      formData.append(`${prefix}.id`, file.id);
    }
  });
}

const handleSubmitFile = (fileData: IAttachmentFile) => {
  attachedFiles.value.push(fileData);
};

const handleDeleteFileAttachment = async (id: string) => {
  await deleteAttachment({ id });
};

const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && formBookFlight.value) {
        isSubmitting.value = true;
        const formData = new FormData(formBookFlight.value);
        formData.append('departureTime', bookFlight.value.departureTime ? moment(bookFlight.value.departureTime).format('HH:mm') : '');
        formData.append('returnFlightTime', bookFlight.value.returnFlightTime ? moment(bookFlight.value.returnFlightTime).format('HH:mm') : '');
        if (bookFlight.value.flightType === FlightType.DOMESTIC) {
          formData.delete('cityId');
        }
        appendAttachedFilesToFormData(formData, attachedFiles.value);
        if (props.id) {
          formData.append('id', props.id);
        }
        saveBookFlight(formData)
          .then(() => {
            const handleSuccess = props.id ? t('book-ticket.common.updateSuccess') : t('book-ticket.common.createSuccess');
            toastSuccess({ message: handleSuccess });
            emits('hide-dialog');
          })
          .catch((handleError) => {
            toastError({ message: t('book-ticket.common.submitError', { err: handleError }) });
          })
          .finally(() => {
            isSubmitting.value = false;
          });

      }
    });
};

</script>

<style scoped>
::v-deep(.p-calendar) {
  width: 100%;
}

.invisible-keep-space {
  visibility: hidden;
}
</style>