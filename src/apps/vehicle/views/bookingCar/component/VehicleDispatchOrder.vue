<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :show-close-icon='false'
    style='width: 68vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click="emits('hide-dialog')"/>
          Lập lệnh điều xe
        </div>
      </div>
    </template>
    <div class='flex gap-2 h-full relative w-full'>
      <form
        ref='form'
        class='w-full'>
        <div
          style='width: 48vw; padding-bottom: 45px'>
          <div class='font-bold text-blue-600 text-lg'>
            Thông tin phiếu đặt xe
          </div>
          <div class='bg-blue-50 border-1 border-blue-300 border-dashed mt-2 p-3 w-full'>
            <div class='mb-1'>
              <div>Phiếu đặt xe số</div>
              <div
                v-tooltip.right='"Xem chi tiết phiếu"'
                class='bg-yellow-50 border-1 border-dashed border-yellow-300 cursor-pointer font-bold mt-1 mt-2 p-2 text-blue-600 text-center text-lg w-15rem'>
                {{ bookingCar.numTicket }}
              </div>
            </div>
            <div class='formgrid grid'>
              <div class='col-4 flex my-2'>
                <AppUser
                  avatar-size='3'
                  :user-id='bookingCar.userBooking'/>
                <div class='ml-3'>
                  <div>{{ t(`vehicle.bookingCar.userBooking`) }}
                  </div>
                  <div class='font-bold mt-1'>{{ usersMoreInfo[bookingCar.userBooking]?.fullName }}</div>
                </div>
              </div>

              <div class='col-5 flex my-2'>
                <AppUser
                  avatar-size='3'
                  :user-id='bookingCar.userId'/>
                <div class='ml-3'>
                  <div>{{ t(`vehicle.bookingCar.users`) }}</div>
                  <div class='font-bold mt-1'>{{ usersMoreInfo[bookingCar.userId]?.fullName }}</div>
                </div>
              </div>

              <div class='col-3 flex my-2'>
                <div>Số yêu cầu đã tạo</div>
              </div>

              <div class='col-4 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.position`) }}</div>
                <div class='font-bold mt-1'>{{ usersMoreInfo[bookingCar.userBooking]?.positionName }}</div>
              </div>

              <div class='col-4 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.position`) }}</div>
                <div class='font-bold mt-1'>{{ usersMoreInfo[bookingCar.userId]?.positionName }}</div>
              </div>

              <div class='col-4 flex flex-column my-2'>
                <div>Số điện thoại</div>
                <div class='font-bold mt-1'>{{ bookingCar.userPhone }}</div>
              </div>

              <div class='col-4 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.dept`) }}</div>
                <div class='font-bold mt-1'>{{
                  usersMoreInfo[bookingCar.userBooking]?.departments
                    ?.map((department: any) => department.name).join(', ')
                }}
                </div>
              </div>

              <div class='col-5 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.dept`) }}</div>
                <div class='font-bold mt-1'>{{
                  usersMoreInfo[bookingCar.userId]?.departments
                    ?.map((department: any) => department.name).join(', ')
                }}
                </div>
              </div>

              <div class='col-4 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.departureDate`) }}
                </div>
                <div
                  class='font-bold mt-1'>{{
                  moment(bookingCar.departureDate).format('dddd, HH:mm DD/MM/YYYY').replace(/^\w/, (c) => c.toUpperCase())
                }}
                </div>
              </div>

              <div class='col-5 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.expectedReturnDate`) }}
                </div>
                <div
                  class='font-bold mt-1'>{{
                  moment(bookingCar.expectedReturnDate).format('dddd, HH:mm DD/MM/YYYY').replace(/^\w/, (c) => c.toUpperCase())
                }}
                </div>
              </div>

              <div class='col-4 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.onSitePlace`) }}
                </div>
                <div class='font-bold mt-1'>{{ bookingCar.onSitePlace }}
                </div>
              </div>

              <div class='col-5 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.numberUsers`) }}
                </div>
                <div class='font-bold mt-1'>{{ bookingCar.numberUsers }}
                </div>
              </div>

              <div class='col-4 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.departurePoint`) }}
                </div>
                <div class='font-bold mt-1'>{{ bookingCar.departurePoint }}
                </div>
              </div>

              <div class='col-5 flex flex-column my-2'>
                <div>{{ t(`vehicle.bookingCar.destination`) }}
                </div>
                <div class='font-bold mt-1'>{{ bookingCar.destination }}
                </div>
              </div>
            </div>
          </div>

          <div class='font-bold mt-3 text-blue-600 text-lg'>
            Thông tin điều xe
          </div>
          <div class='border-1 border-dashed border-orange-300 mt-2 p-3 w-full'>
            <div class='formgrid grid'>
              <div class='col-6 field'>
                <label
                  v-required
                  class='font-bold'>{{
                    t(`vehicle.vehicleDispatchOrder.numDispatchOrder`)
                  }}</label>
                <div v-if='!isDetail'>
                  <InputText
                    v-model='bookingCar.numDispatchOrder'
                    class='p-component p-inputtext w-full'
                    maxlength='255'
                    name='numDispatchOrder'/>
                  <ValidateErrorMessage :errors='v$.numDispatchOrder.$errors'/>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{ bookingCar.numDispatchOrder }}
                </div>
              </div>
              <div class='col-6 field'>
                <label
                  v-required>{{
                    t(`vehicle.vehicleDispatchOrder.createdDate`)
                  }}</label>
                <div v-if='!isDetail'>
                  <Calendar
                    v-model='bookingCar.numDispatchOrderCreatedDate'
                    class='w-full'
                    icon-display='input'
                    show-icon/>
                  <ValidateErrorMessage :errors='v$.numDispatchOrderCreatedDate.$errors'/>
                </div>
                <div
                  v-else
                  class='font-bold'>
                  {{ moment(bookingCar.numDispatchOrderCreatedDate).format('DD/MM/YYYY') }}
                </div>
              </div>

              <div class='col-8 field'>
                <label
                  class='font-bold'>{{
                    t(`vehicle.driver.driverSource`)
                  }}</label>
                <div class='flex flex-wrap gap-7 p-2'>
                  <div class='align-items-center flex'>
                    <RadioButton
                      v-model='bookingCar.driverSource'
                      input-id='ingredient1'
                      :value='DriverSource.INTERNAL'/>
                    <label
                      class='ml-2'
                      for='ingredient1'>{{ t(`vehicle.driver.INTERNAL`) }}</label>
                  </div>
                  <div class='align-items-center flex'>
                    <RadioButton
                      v-model='bookingCar.driverSource'
                      input-id='ingredient2'
                      :value='DriverSource.OUTSOURCED'/>
                    <label
                      class='ml-2'
                      for='ingredient2'>{{ t(`vehicle.driver.OUTSOURCED`) }}</label>
                  </div>
                </div>
              </div>

              <div class='col-6 field'>
                <label v-required>{{
                  t(`vehicle.vehicleDispatchOrder.vehicle`)
                }}</label>
                <div class='flex gap-2'>
                  <Dropdown
                    v-model='bookingCar.licensePlate'
                    class='p-component w-full'
                    name='licensePlate'
                    option-label='licensePlate'
                    option-value='licensePlate'
                    :options='enrichedVehicles'>
                    <template #option='slotProps'>
                      <div class='flex flex-column gap-2'>
                        <div class='align-items-center flex gap-6'>
                          <div>{{ slotProps.option.licensePlate }}</div>
                          <div>{{ slotProps.option.numberOfSeats }} chỗ</div>
                          <AppIcon
                            v-if='slotProps.option.hasAirportSecurityCard'
                            v-tooltip.top="'Có thẻ an ninh vào sân bay'"
                            class='cursor-pointer'
                            name='local_airport'
                            size='1.5'/>
                        </div>
                        <div
                          v-if='slotProps.option.departureDate'
                          class='text-sm'>Lịch chạy: {{
                            moment(slotProps.option.departureDate)
                              .format('dddd, HH:mm DD/MM/YYYY')
                              .replace(/^\w/, (c) => c.toUpperCase())
                          }} -
                          {{
                            slotProps.option.expectedReturnDate && moment(slotProps.option.expectedReturnDate)
                              .format('dddd, HH:mm DD/MM/YYYY')
                              .replace(/^\w/, (c) => c.toUpperCase())
                          }}
                        </div>
                      </div>
                    </template>
                  </Dropdown>
                  <Button
                    icon='pi pi-check-circle'/>
                </div>
              </div>

              <div class='col-6 field'>
                <label v-required>Lái xe nhận lệnh</label>
                <div class='flex gap-2'>
                  <Dropdown
                    v-model='bookingCar.driver'
                    class='p-component w-full'
                    name='driver'
                    option-label='fullname'
                    option-value='userId'
                    :options='drivers'
                    @change='(e) => bookingCar.driverPhone = usersMoreInfo[bookingCar.driver]?.phone'>
                  </Dropdown>
                  <Button
                    icon='pi pi-check-circle'/>
                </div>
              </div>

              <div class='col-3 field'>
                <label>Hãng xe</label>
                <div class='font-bold'>
                  {{ bookingCar.licensePlate && getVehicleByLicensePlate(bookingCar.licensePlate)?.vehicleBranch }}
                </div>
              </div>
              <div class='col-3 field'>
                <label>Dòng xe</label>
                <div class='font-bold'>
                  {{ bookingCar.licensePlate && getVehicleByLicensePlate(bookingCar.licensePlate)?.vehicleType }}
                </div>
              </div>
              <div class='col-6 field'>
                <label>Điện thoại</label>
                <InputText
                  v-model='bookingCar.driverPhone'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  name='driverPhone'/>
              </div>
              <div class='col-3 field'>
                <label>Màu xe</label>
                <div class='font-bold'>
                  {{ bookingCar.licensePlate && getVehicleByLicensePlate(bookingCar.licensePlate)?.color }}
                </div>
              </div>
              <div class='col-3 field'>
                <label>Chỗ ngồi</label>
                <div class='font-bold'>
                  {{ bookingCar.licensePlate && getVehicleByLicensePlate(bookingCar.licensePlate)?.numberOfSeats }}
                </div>
              </div>

              <div class='col-12 field'>
                <label>Ghi chú</label>
                <Textarea
                  v-model='bookingCar.noteDispatchOrder'
                  class='w-full'
                  cols='30'
                  name='noteDispatchOrder'
                  rows='3'/>
              </div>
            </div>
          </div>
        </div>

        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
          style='width: 98%'>
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
            label='Lưu và chuyển'
            @click='submit'/>
        </div>
      </form>
      <div
        class='fixed ml-2'
        style='right: 10px'>
        <div class='align-items-center border-1 border-gray-300 flex font-bold justify-content-between p-2 surface-200'>
          <div class='align-items-center flex gap-2'>
            <i class='pi pi-clock'></i> Bảng theo dõi quy trình xử lý
          </div>
          <AppIcon
            class='cursor-pointer'
            name='lan'
            size='1.5'/>
        </div>
        <div
          class='border-1 border-gray-300 border-top-none p-3'
          style='width: 18vw; height: 83.5vh'>
          <ViewFlowStep
            v-if='task'
            :id='task?.workId'
            ref='viewFlowStepRef'/>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import {
  findBookingCarByOrganizationId,
  getBookingCarById,
  saveDispatchOrder
} from '@/apps/vehicle/api/graphql/booking-car';
import { findFreeDriversByOrganizationId } from '@/apps/vehicle/api/graphql/driver';
import {
  findParameterConfig,
  getVehicleDispatchOrderCode,
  increaseVehicleDispatchOrderStartValue
} from '@/apps/vehicle/api/graphql/parameter-config';
import { getAllVehicleByOrganizationId } from '@/apps/vehicle/api/graphql/vehicle';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import { DriverSource } from '@/apps/vehicle/model/driver';
import ViewFlowStep from '@/apps/vehicle/views/bookingCar/component/ViewFlowStep.vue';
import { getTaskByObjectId, nextNodesIgnoreStatus } from '@/apps/work-flow/api/graphql/task';
import { createNextTasks } from '@/apps/work-flow/api/graphql/work';
import type { Task } from '@/apps/work-flow/model/process/work';
import { handleCompleteTask } from '@/apps/work-flow/views/process/task-menu';
import AppUser from '@/common/components/app/AppUser.vue';
import { DateTimeFormat, DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
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
});
const emits = defineEmits(['hide-dialog']);
const isDisable = ref(false);
const { moment } = useMoment();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const visibleForm = ref(props.visibleDialog);
const { t } = useI18n();
const bookingCar = ref<IBookingCar>({} as IBookingCar);

const validateRules = {
  numDispatchOrder: {
    required: helpers.withMessage(
      t('vehicle.vehicleDispatchOrder.error.requiredNumDispatchOrder'),
      required,
    ),
  },
  numDispatchOrderCreatedDate: {
    required: helpers.withMessage(
      t('vehicle.vehicleDispatchOrder.error.requiredCreatedDate'),
      required,
    ),
  },
};
const vehicles = ref([]);
const bookingCars = ref([]);
const drivers = ref();
const v$ = useVuelidate(validateRules, bookingCar);
const form = ref<HTMLFormElement>();
if (props.id) {
  const { onResult: bookingCarOnResult } = getBookingCarById(props.id);
  bookingCarOnResult((res) => {
    bookingCar.value = {
      ...res.data.getBookingCarById,
      departureDate: new Date(res.data.getBookingCarById.departureDate),
      expectedReturnDate: new Date(
        res.data.getBookingCarById.expectedReturnDate,
      ),
      numDispatchOrderCreatedDate: new Date(
        res.data.getBookingCarById.numDispatchOrderCreatedDate,
      ),
    };
    if (!res.data.getBookingCarById.numDispatchOrderCreatedDate) {
      bookingCar.value.numDispatchOrderCreatedDate = new Date();
      bookingCar.value.driverSource = DriverSource.INTERNAL;
    }

    const { onResult: findParameterConfigResult } = findParameterConfig();
    findParameterConfigResult((res) => {
      if (res.data.findParameterConfig.value.bookingCar.enabled) {
        const { onResult } = getVehicleDispatchOrderCode();
        onResult((res) => {
          bookingCar.value.numDispatchOrder = res.data.getVehicleDispatchOrderCode;
        });
      }
    });

    const { onResult: getAllVehicleByOrganizationIdResult } = getAllVehicleByOrganizationId(
      bookingCar.value.organizationParentId, bookingCar.value.id
    );
    getAllVehicleByOrganizationIdResult((res) => {
      vehicles.value = res.data.getAllVehicleByOrganizationId;
    });
    const { onResult: findBookingCarByOrganizationIdResult } = findBookingCarByOrganizationId(
      bookingCar.value.organizationParentId
    );
    findBookingCarByOrganizationIdResult((res) => {
      bookingCars.value = res.data.findBookingCarByOrganizationId;
    });
    const { onResult: findFreeDriversByOrganizationIdResult } = findFreeDriversByOrganizationId(bookingCar.value.organizationParentId, bookingCar.value.id);
    findFreeDriversByOrganizationIdResult((res) => {
      drivers.value = res.data.findFreeDriversByOrganizationId;
    });
  });
}
const getVehicleByLicensePlate = (licensePlate: string): any => {
  return vehicles.value.find((vehicle: any) => vehicle.licensePlate === licensePlate);
};

const enrichedVehicles = computed(() => {
  return vehicles.value?.map((v: any) => {
    const booking: any = bookingCars.value.find((b: any) => b.licensePlate === v.licensePlate);
    return {
      ...v,
      departureDate: booking?.departureDate || null,
      expectedReturnDate: booking?.expectedReturnDate || null
    };
  });
});

const {
  mutate,
  onDone
} = saveDispatchOrder();

const task = ref<Task>({} as Task);
const nodes = ref();

const { onResult } = getTaskByObjectId(props.id);

onResult(async (res) => {
  task.value = res.data?.getTaskByObjectId as Task;

  if (task.value?.workId && task.value?.nodeId) {
    const {
      load,
      refetch
    } = nextNodesIgnoreStatus(task.value.workId, task.value.nodeId, 'APPROVE');
    const result = await (load?.() || refetch?.());
    if (result?.nextNodesIgnoreStatus) {
      nodes.value = result.nextNodesIgnoreStatus;
    }
  }
});

const submit = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && bookingCar.value) {
        mutate({
          bookingCar: {
            id: bookingCar.value.id,
            numDispatchOrder: bookingCar.value.numDispatchOrder,
            numDispatchOrderCreatedDate: moment(bookingCar.value.numDispatchOrderCreatedDate).format(
              DateTimeFormat.ISO_LOCAL_DATE,
            ),
            driverSource: bookingCar.value.driverSource,
            licensePlate: bookingCar.value.licensePlate,
            driver: bookingCar.value.driver,
            noteDispatchOrder: bookingCar.value.noteDispatchOrder,
            driverPhone: bookingCar.value.driverPhone,
          },
        });
        handleCompleteTask(task.value.id, 'APPROVE', '')
          .then(() => {
            createNextTasks().mutate({
              workId: task.value.workId,
              currentTaskId: task.value.id,
              assignedIds: [bookingCar.value.driver],
              currentNodeId: task.value.nodeId,
              nextNodeId: nodes.value[0].id
            });
          });
      }
    })
    .then(() => isDisable.value = false);
};

onDone(() => {
  increaseVehicleDispatchOrderStartValueMutate({});
  emits('hide-dialog');
});

const { mutate: increaseVehicleDispatchOrderStartValueMutate } =
  increaseVehicleDispatchOrderStartValue();
</script>

<style scoped>

</style>