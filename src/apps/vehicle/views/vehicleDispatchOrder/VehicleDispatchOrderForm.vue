<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="
      isDetail
        ? t('vehicle.vehicleDispatchOrder.titleForm')
        : t(`vehicle.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('vehicle.vehicleDispatchOrder.titleForm')
    "
    :position="isSidebar && !isDetail ? 'right' : undefined"
    style='width: 60vw'
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'
        @submit.prevent='submitVehicleDispatchOrder'>
        <div class='formgrid grid mb-4'>
          <div class='col-2 field'>
            <label
              v-required>{{
                t(`vehicle.vehicleDispatchOrder.numDispatchOrder`)
              }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicleDispatchOrder.numDispatchOrder'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='numDispatchOrder'/>
              <ValidateErrorMessage :errors='v$.numDispatchOrder.$errors'/>
            </div>
            <div v-else>
              {{ vehicleDispatchOrder.numDispatchOrder }}
            </div>
          </div>
          <div class='col-3 field'>
            <label
              v-required>{{
                t(`vehicle.vehicleDispatchOrder.createdDate`)
              }}</label>
            <div v-if='!isDetail'>
              <Calendar
                v-model='vehicleDispatchOrder.createdDate'
                class='w-full'
                icon-display='input'
                show-icon/>
              <ValidateErrorMessage :errors='v$.createdDate.$errors'/>
            </div>
            <div v-else>
              {{
                moment(vehicleDispatchOrder.createdDate).format('DD/MM/YYYY')
              }}
            </div>
          </div>
          <div class='col-3 field'>
            <label
              v-required>{{
                t(`vehicle.vehicleDispatchOrder.numTicket`)
              }}</label>
            <div v-if='!isDetail'>
              <NamedDropdown
                v-if='!isDetail'
                v-model='numTicket'
                class='w-full'
                :disabled='props.numTicketBC'
                name='numTicket'
                option-label='numTicket'
                option-value='numTicket'
                :options='listNumTicket'/>
              <ValidateErrorMessage :errors='v$.numTicket.$errors'/>
            </div>
            <div v-else>
              {{ vehicleDispatchOrder.numTicket }}
            </div>
          </div>
          <div class='col-2 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.bookingDate`)
            }}</label>
            <div v-if='!isDetail'>
              <Calendar
                v-model='vehicleDispatchOrder.bookingDate'
                class='w-full'
                disabled
                icon-display='input'
                show-icon/>
            </div>
            <div v-else>
              {{
                moment(vehicleDispatchOrder.bookingDate).format('DD/MM/YYYY')
              }}
            </div>
          </div>
          <div class='col-2 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.numberUsers`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrder.numberUsers'
              class='w-full'
              disabled
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrder.numberUsers }}
            </div>
            <input
              v-model='vehicleDispatchOrder.numberUsers'
              hidden
              name='numberUsers'/>
          </div>

          <div class='col-4 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.userBooking`)
            }}</label>
            <div v-if='!isDetail'>
              <NamedSelectUser
                v-model='vehicleDispatchOrder.userBooking'
                class='w-full'
                disabled
                name='userBooking'
                style='height: 40px'/>
            </div>
            <div v-else>
              <AppUser
                avatar-size='2.5'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible
                :user-id='vehicleDispatchOrder.userBooking'></AppUser>
            </div>
          </div>
          <div class='col-4 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.position`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='position'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='position'/>
            </div>
            <div v-else>
              {{ position }}
            </div>
          </div>
          <div class='col-4 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.dept`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='dept'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='departurePoint'/>
            </div>
            <div v-else>
              {{ dept }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.users`)
            }}</label>
            <NamedMultiSelectUser
              v-if='!isDetail'
              v-model:list-user='vehicleDispatchOrder.users'
              class='p-component w-full'
              disabled
              name='users'/>
            <div v-else>
              <AppGroupAvatar
                v-if='vehicleDispatchOrder.users'
                avatar-size='2.5'
                :user-ids='vehicleDispatchOrder.users'/>
            </div>
          </div>

          <div
            v-if='!isDetail'
            class='col-12 my-3'>
            <div class='flex flex-wrap gap-6'>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='vehicleDispatchOrder.bookingVehicleType'
                  input-id='ingredient1'
                  name='bookingVehicleType'
                  :value='BookingVehicleType.COMPANY_VEHICLE'/>
                <label
                  class='ml-2'
                  for='ingredient1'>{{
                    t(`vehicle.vehicleDispatchOrder.companyVehicle`)
                  }}</label>
              </div>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='vehicleDispatchOrder.bookingVehicleType'
                  input-id='ingredient2'
                  name='bookingVehicleType'
                  :value='BookingVehicleType.EXTERNAL_VEHICLE'/>
                <label
                  class='ml-2'
                  for='ingredient2'>{{
                    t(`vehicle.vehicleDispatchOrder.externalVehicle`)
                  }}</label>
              </div>
            </div>
          </div>

          <template
            v-if='
              vehicleDispatchOrder.bookingVehicleType ===
                BookingVehicleType.EXTERNAL_VEHICLE
            '>
            <div class='col-6 field'>
              <label
                v-required>{{
                  t(`vehicle.vehicleDispatchOrder.externalVehicleBranch`)
                }}</label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='vehicleDispatchOrder.externalVehicleBranch'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  name='externalVehicleBranch'/>
              </div>
              <div v-else>
                {{ vehicleDispatchOrder.externalVehicleBranch }}
              </div>
            </div>
            <div class='col-6 field'>
              <label
                v-required>{{
                  t(`vehicle.vehicleDispatchOrder.externalVehicleCard`)
                }}</label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='vehicleDispatchOrder.externalVehicleCard'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  name='externalVehicleCard'/>
              </div>
              <div v-else>
                {{ vehicleDispatchOrder.externalVehicleCard }}
              </div>
            </div>
            <div class='col-12 field'>
              <label>{{
                t(`vehicle.vehicleDispatchOrder.externalVehicle`)
              }}</label>
              <Textarea
                v-if='!isDetail'
                v-model='vehicleDispatchOrder.externalVehicleInfo'
                class='w-full'
                cols='30'
                rows='4'/>
              <div v-else>
                {{ vehicleDispatchOrder.externalVehicleInfo }}
              </div>
            </div>
          </template>

          <template v-else>
            <div class='col-6 field'>
              <label
                v-required>{{
                  t(`vehicle.vehicleDispatchOrder.vehicle`)
                }}</label>
              <div v-if='!isDetail'>
                <NamedDropdown
                  v-model='vehicleDispatchOrder.vehicleId'
                  class='w-full'
                  is-show-clear
                  name='vehicleBranch'
                  option-label='vehicleType'
                  option-value='id'
                  :options='listVehicle'/>
              </div>
              <div v-else>
                {{
                  listVehicle.find(
                    (item) => item.id === vehicleDispatchOrder.vehicleId,
                  )?.vehicleType
                }}
              </div>
            </div>
            <div class='col-6'></div>
            <div class='col-3 field'>
              <label>{{
                t(`vehicle.common.licensePlate`)
              }}</label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='vehicleDispatchOrder.licensePlate'
                  class='p-component p-inputtext w-full'
                  disabled
                  maxlength='255'
                  name='licensePlate'/>
              </div>
              <div v-else>
                {{ vehicleDispatchOrder.licensePlate }}
              </div>
            </div>
            <div class='col-3 field'>
              <label>{{
                t(`vehicle.vehicleBranch.titleForm`)
              }}</label>
              <div v-if='!isDetail'>
                <NamedDropdown
                  v-if='!isDetail'
                  v-model='vehicleDispatchOrder.vehicleBranch'
                  class='w-full'
                  disabled
                  name='vehicleBranch'
                  option-label='name'
                  option-value='code'
                  :options='listVehicleBranch'/>
              </div>
              <div v-else>
                {{ vehicleDispatchOrder.vehicleBranch }}
              </div>
            </div>
            <div class='col-2 field'>
              <label>{{
                t(`vehicle.common.numberOfSeats`)
              }}</label>
              <div>
                <InputNumber
                  v-if='!isDetail'
                  v-model='vehicleDispatchOrder.numberOfSeats'
                  disabled
                  input-id='integeronly'/>
                <div v-else>
                  {{ vehicleDispatchOrder.numberOfSeats }}
                </div>
                <input
                  v-model='vehicleDispatchOrder.numberOfSeats'
                  hidden
                  name='numberOfSeats'/>
              </div>
            </div>
            <div class='col-4 field'>
              <label>{{
                t(`vehicle.vehicleDispatchOrder.moreInfo`)
              }}</label>
              <div>
                <ButtonIcon
                  icon='edit_square'
                  :label='t(`vehicle.vehicleDispatchOrder.getInfo`)'
                  outlined
                  @click='showForm = true'/>
              </div>
            </div>
            <div class='col-4 field'>
              <label>{{ t(`vehicle.common.driver`) }}</label>
              <div v-if='!isDetail'>
                <NamedSelectUser
                  v-model='vehicleDispatchOrder.driver'
                  class='w-full'
                  name='driver'
                  :placeholder="'Chọn người lái xe'"/>
              </div>
              <div v-else>
                <AppUser
                  avatar-size='2.5'
                  info-visible
                  :infos="['positionName', 'departments', 'username']"
                  name-visible
                  :user-id='vehicleDispatchOrder.driver'></AppUser>
              </div>
            </div>
            <div class='col-4 field'>
              <label>{{
                t(`vehicle.vehicleDispatchOrder.phone`)
              }}</label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='vehicleDispatchOrder.driverPhoneNumber'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  name='driverPhoneNumber'/>
              </div>
              <div v-else>{{ vehicleDispatchOrder.driverPhoneNumber }}</div>
            </div>
            <div class='col-4 field'>
              <label>{{
                t(`vehicle.vehicleDispatchOrder.review`)
              }}</label>
              <div v-if='!isDetail'>
                <NamedDropdown
                  v-if='!isDetail'
                  class='w-full'
                  :is-show-clear='true'
                  name='review'
                  option-label='name'
                  option-value='code'
                  :options='[]'/>
              </div>
              <div v-else></div>
            </div>
          </template>

          <div class='col-4 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.onSitePlace`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicleDispatchOrder.onSitePlace'
                class='p-component p-inputtext w-full'
                disabled
                maxlength='255'
                name='onSitePlace'/>
            </div>
            <div v-else>
              {{ vehicleDispatchOrder.onSitePlace }}
            </div>
          </div>
          <div class='col-8 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.departurePoint`)
            }}</label>
            <div v-if='!isDetail'>
              <AutoComplete
                v-model='vehicleDispatchOrder.departurePoint'
                class='w-full'
                disabled
                dropdown
                maxlength='255'
                name='departurePoint'
                :suggestions='locationFiltered'
                @complete='search'/>
            </div>
            <div v-else>
              {{ vehicleDispatchOrder.departurePoint }}
            </div>
          </div>
          <div class='col-8 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.destination`)
            }}</label>
            <div v-if='!isDetail'>
              <AutoComplete
                v-model='vehicleDispatchOrder.destination'
                class='w-full'
                disabled
                dropdown
                maxlength='255'
                name='destination'
                :suggestions='locationFiltered'
                @complete='search'/>
            </div>
            <div v-else>
              {{ vehicleDispatchOrder.destination }}
            </div>
          </div>
          <div class='col-4'></div>
          <div class='col-4 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.departureDate`)
            }}</label>
            <div v-if='!isDetail'>
              <Calendar
                id='calendar-24h'
                v-model='vehicleDispatchOrder.departureDate'
                class='w-full'
                disabled
                hour-format='24'
                icon-display='input'
                show-icon
                show-time/>
            </div>
            <div v-else>
              {{
                moment(vehicleDispatchOrder.departureDate)
                  .format('dddd, HH:mm DD/MM/YYYY')
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>
          <div class='col-4 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.expectedReturnDate`)
            }}</label>
            <div v-if='!isDetail'>
              <Calendar
                id='calendar-24h'
                v-model='vehicleDispatchOrder.expectedReturnDate'
                class='w-full'
                disabled
                hour-format='24'
                icon-display='input'
                show-icon
                show-time/>
            </div>
            <div v-else>
              {{
                moment(vehicleDispatchOrder.departureDate)
                  .format('dddd, HH:mm DD/MM/YYYY')
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>
          <div class='col-8 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.reson`)
            }}</label>
            <Textarea
              v-if='!isDetail'
              v-model='vehicleDispatchOrder.reson'
              class='w-full'
              cols='30'
              rows='4'/>
            <div v-else>
              {{ vehicleDispatchOrder.reson }}
            </div>
          </div>
          <div class='col-4 field'>
            <label>{{
              t(`vehicle.vehicleDispatchOrder.note`)
            }}</label>
            <Textarea
              v-if='!isDetail'
              v-model='vehicleDispatchOrder.note'
              class='w-full'
              cols='30'
              rows='4'/>
            <div v-else>
              {{ vehicleDispatchOrder.note }}
            </div>
          </div>
          <div class='col-4 my-3'></div>
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
            :disabled='isDisable'
            icon='pi pi-save'
            :label="t('common.save')"
            type='submit'/>
          <Button
            v-if='isDetail'
            icon='pi pi-download'
            :label="t('common.download')"
            @click='downloadVehicleDispatchOrder'/>
        </div>
      </form>
    </div>
  </component>
  <MoreInfoDialog
    v-if='showForm'
    :is-detail='isDetail'
    :vehicle-dispatch-order-more-info='vehicleDispatchOrder'
    :visible-dialog='showForm'
    @data='getMoreInfo'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getBookingCarByNumTicket, getNumTicketNotExistInDispatchOrder, } from '@/apps/vehicle/api/graphql/booking-car';
import { getAllLocationPoint } from '@/apps/vehicle/api/graphql/location-point';
import {
  findParameterConfig,
  getVehicleDispatchOrderCode,
  increaseVehicleDispatchOrderStartValue,
} from '@/apps/vehicle/api/graphql/parameter-config';
import { getVehicleById, } from '@/apps/vehicle/api/graphql/vehicle';
import { getAllVehicleBranch } from '@/apps/vehicle/api/graphql/vehicle-branch';
import {
  getVehicleDispatchOrderById,
  saveVehicleDispatchOrder,
} from '@/apps/vehicle/api/graphql/vehicle-dispatch-order';
import { exportWordVehicleDispatchOrder } from '@/apps/vehicle/api/rest/vehicle-dispatch-order';
import type { IVehicle } from '@/apps/vehicle/model/vehicle';
import type { IVehicleBranch } from '@/apps/vehicle/model/vehicleBranch';
import { BookingVehicleType, type IVehicleDispatchOrder, } from '@/apps/vehicle/model/vehicleDispatchOrder';
import MoreInfoDialog from '@/apps/vehicle/views/vehicleDispatchOrder/MoreInfoDialog.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { downloadFile } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

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
  numTicketBC: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog']);
const isDisable = ref(false);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const vehicleDispatchOrder = ref<IVehicleDispatchOrder>(
  {} as IVehicleDispatchOrder,
);
const numTicket = ref();
const validateRules = {
  numDispatchOrder: {
    required: helpers.withMessage(
      t('vehicle.vehicleDispatchOrder.error.requiredNumDispatchOrder'),
      required,
    ),
  },
  createdDate: {
    required: helpers.withMessage(
      t('vehicle.vehicleDispatchOrder.error.requiredCreatedDate'),
      required,
    ),
  },
  numTicket: {
    required: helpers.withMessage(
      t('vehicle.vehicleDispatchOrder.error.requiredNumTicket'),
      required,
    ),
  },
};
const listVehicleBranch = ref<IVehicleBranch[]>([]);
const { onResult: getAllVehicleBranchResult } = getAllVehicleBranch();
getAllVehicleBranchResult((res) => {
  listVehicleBranch.value = res.data.getAllVehicleBranch;
});

const downloadVehicleDispatchOrder = () => {
  exportWordVehicleDispatchOrder(props.id).then((value: any) => {
    if (value) {
      downloadFile(value.data, 'Lệnh điều xe.docx');
    }
  });
};

const showForm = ref(false);

function hideDialogFn() {
  showForm.value = false;
}

function getMoreInfo(data: any) {
  vehicleDispatchOrder.value = data;
}

const listVehicle = ref<IVehicle[]>([]);

const listNumTicket = ref<any[]>([]);

const vehicleId = computed(() => vehicleDispatchOrder.value.vehicleId);

watch(vehicleId, (val) => {
  if (val) {
    const { onResult: vehicleOnResult } = getVehicleById(val);
    vehicleOnResult((res) => {
      const data = res.data.getVehicleById;
      vehicleDispatchOrder.value.licensePlate = data.licensePlate;
      vehicleDispatchOrder.value.vehicleBranch = data.vehicleBranch;
      vehicleDispatchOrder.value.numberOfSeats = data.numberOfSeats;
      vehicleDispatchOrder.value.driver = data.driver;
    });
  }
});

const v$ = useVuelidate(validateRules, vehicleDispatchOrder);

const { onResult: getNumTicketNotExistInDispatchOrderResult } =
  getNumTicketNotExistInDispatchOrder();

getNumTicketNotExistInDispatchOrderResult((res) => {
  listNumTicket.value = res.data.getNumTicketNotExistInDispatchOrder;
  if (props.numTicketBC) {
    numTicket.value = props.numTicketBC;
  }
});

if (!props.id) {
  vehicleDispatchOrder.value.bookingVehicleType =
    BookingVehicleType.COMPANY_VEHICLE;
  vehicleDispatchOrder.value.createdDate = new Date();
  const { onResult: findParameterConfigResult } = findParameterConfig();
  findParameterConfigResult((res) => {
    if (res.data.findParameterConfig.value.vehicleDispatchOrder.enabled) {
      const { onResult } = getVehicleDispatchOrderCode();
      onResult((res) => {
        vehicleDispatchOrder.value.numDispatchOrder =
          res.data.getVehicleDispatchOrderCode;
      });
    }
  });
}
const initialDriver = ref();
if (props.id) {
  const { onResult: vehicleDispatchOrderOnResult } =
    getVehicleDispatchOrderById(props.id);
  vehicleDispatchOrderOnResult((res) => {
    vehicleDispatchOrder.value = {
      ...res.data.getVehicleDispatchOrderById,
      departureDate: new Date(
        res.data.getVehicleDispatchOrderById.departureDate,
      ),
      expectedReturnDate: new Date(
        res.data.getVehicleDispatchOrderById.expectedReturnDate,
      ),
    };
    initialDriver.value = res.data.getVehicleDispatchOrderById.driver;
    numTicket.value = res.data.getVehicleDispatchOrderById.numTicket;
    listNumTicket.value = [
      { numTicket: numTicket.value },
      ...listNumTicket.value,
    ];
  });
}

const {
  onResult: getBookingCarByNumTicketResult,
  refetch: getBookingCarByNumTicketRefetch,
} = getBookingCarByNumTicket('');
getBookingCarByNumTicketResult((res) => {
  const data = res.data.getBookingCarByNumTicket;
  const {
    createdDate,
    norder,
    id,
    status,
    priority,
    ...rest
  } = data;
  const bookingDate = res.data.getBookingCarByNumTicket.createdDate;

  vehicleDispatchOrder.value = {
    ...vehicleDispatchOrder.value,
    ...rest,
    bookingDate: bookingDate,
    departureDate: new Date(res.data.getBookingCarByNumTicket.departureDate),
    expectedReturnDate: new Date(
      res.data.getBookingCarByNumTicket.expectedReturnDate,
    ),
  };

});

watch(numTicket, (newValue) => {
  getBookingCarByNumTicketRefetch({ numTicket: newValue });
});

const location = ref<any[]>([]);
const locationFiltered = ref<any[]>([]);

const { onResult: getAllLocationPointResult } = getAllLocationPoint();
getAllLocationPointResult((res) => {
  location.value = res.data.getAllLocationPoint.map((item: any) => item.name);
});

const search = (event: any) => {
  setTimeout(() => {
    const query = event.query.trim().toLowerCase();

    if (!query.length) {
      locationFiltered.value = [...location.value];
    } else {
      locationFiltered.value = location.value.filter((item) => {
        return item.trim().toLowerCase().includes(query);
      });
    }
  }, 100);
};
const {
  mutate: saveVehicleDispatchOrderMutate,
  onError,
  onDone: saveVehicleDispatchOrderOnDone,
} = saveVehicleDispatchOrder();
const { moment } = useMoment();

function submitVehicleDispatchOrder() {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && vehicleDispatchOrder.value) {
        saveVehicleDispatchOrderMutate({
          vehicleDispatchOrderInput: {
            ...vehicleDispatchOrder.value,
            numTicket: numTicket.value,
            createdDate: moment(vehicleDispatchOrder.value.createdDate).format(
              DateTimeFormat.ISO_LOCAL_DATE,
            ),
            bookingDate: moment(vehicleDispatchOrder.value.bookingDate).format(
              DateTimeFormat.ISO_LOCAL_DATE,
            ),
            departureDate: moment(
              vehicleDispatchOrder.value.departureDate,
            ).format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
            expectedReturnDate: moment(
              vehicleDispatchOrder.value.expectedReturnDate,
            ).format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
          },
        });
      }
    })
    .then(() => isDisable.value = false);
}

const { mutate: increaseVehicleDispatchOrderStartValueMutate } =
  increaseVehicleDispatchOrderStartValue();
saveVehicleDispatchOrderOnDone(() => {
  toastSuccess({ message: t('done') });
  emits('hide-dialog');
  increaseVehicleDispatchOrderStartValueMutate({});
});

onError((error) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const {
        errorCode,
        errorType
      } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t(`vehicle.vehicleDispatchOrder.${errorCode.toString()}`), });
      }
    });
  }
});

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const userId = computed((): string => vehicleDispatchOrder.value.userBooking);
const driver = computed((): string => vehicleDispatchOrder.value.driver);

const position = ref();
const dept = ref();

watch(userId, (id) => {
  store.fetchUserMoreInfo(id);
  position.value = usersMoreInfo.value[id]?.positionName;
  dept.value = usersMoreInfo.value[id]?.departments
    .map((department) => department.name)
    .join(', ');
});
const changedInitialDriver = ref(false);
watch(driver, (newValue) => {
  if (newValue !== initialDriver.value || changedInitialDriver.value) {
    changedInitialDriver.value = true;
    vehicleDispatchOrder.value.driverPhoneNumber =
      usersMoreInfo.value[newValue]?.phone;
  }
});
</script>

<style lang='scss' scoped>
:deep(.p-inputnumber-input) {
  width: 100%;
}

:deep(.p-inputtext) {
  color: black !important;
}

:deep(.p-component:disabled) {
  opacity: unset;
}

:deep(.opacity) {
  opacity: unset;
}
</style>
