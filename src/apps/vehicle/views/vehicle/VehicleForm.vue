<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :position="isSidebar && !isDetail ? 'right' : undefined"
    :show-close-icon='false'
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
              ? t('vehicle.common.titleForm')
              : t(`vehicle.common.${id ? 'update' : 'create'}`) +
                ' ' +
                t('vehicle.common.titleForm')
          }}
        </div>
      </div>
    </template>
    <div>
      <form
        ref='form'
        @submit.prevent='submitVehicle'>
        <div class='formgrid grid mb-4'>
          <div class='col-6 field'>
            <label
              v-required
              class='font-bold'>{{
                t(`vehicle.common.licensePlate`)
              }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicle.licensePlate'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='licensePlate'/>
              <ValidateErrorMessage :errors='v$.licensePlate.$errors'/>
            </div>
            <div v-else>
              {{ vehicle.licensePlate }}
            </div>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              class=''>{{
                t(`vehicle.common.vehicleBranch`)
              }}</label>
            <div v-if='!isDetail'>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicleBranch'
                class='w-full'
                :is-show-clear='true'
                name='vehicleBranch'
                option-label='name'
                option-value='name'
                :options='listVehicleBranch'/>
              <ValidateErrorMessage
                v-if='!vehicleBranch'
                :errors='v$.vehicleBranch.$errors'/>
            </div>
            <div v-else>
              {{ getVehicleBranchByCode(vehicle.vehicleBranch) }}
            </div>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              class=''>{{
                t(`vehicle.common.nameVehicle`)
              }}</label>
            <div v-if='!isDetail'>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.vehicleType'
                class='w-full'
                :disable-flow='!vehicleBranch'
                :is-show-clear='true'
                name='vehicleType'
                option-label='name'
                option-value='name'
                :options='listVehicleModel'/>
              <ValidateErrorMessage :errors='v$.vehicleType.$errors'/>
            </div>
            <div v-else>
              {{ vehicle.vehicleType }}
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>{{
              t(`vehicle.common.yearOfManufacture`)
            }}</label>
            <div v-if='!isDetail'>
              <InputNumber
                v-model='vehicle.yearOfManufacture'
                class='w-full'
                input-id='integeronly'
                :use-grouping='false'/>
              <input
                v-model='vehicle.yearOfManufacture'
                hidden
                name='yearOfManufacture'/>
            </div>
            <div v-else>
              {{ vehicle.yearOfManufacture }}
            </div>
          </div>

          <div class='col-6 field'>
            <label
              class=''>{{
                t(`vehicle.common.frameNumber`)
              }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicle.frameNumber'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='frameNumber'/>
            </div>
            <div v-else>
              {{ vehicle.frameNumber }}
            </div>
          </div>

          <div class='col-6 field'>
            <label
              class=''>{{
                t(`vehicle.common.engineNumber`)
              }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicle.engineNumber'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='engineNumber'/>
            </div>
            <div v-else>
              {{ vehicle.engineNumber }}
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>{{
              t(`vehicle.common.numberOfSeats`)
            }}</label>
            <div>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.numberOfSeats'
                class='w-full'
                name='numberOfSeats'
                :options='listNumberOfSeats'/>
              <div v-else>
                {{ vehicle.numberOfSeats }}
              </div>
              <input
                v-model='vehicle.numberOfSeats'
                hidden
                name='numberOfSeats'/>
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>{{ t('vehicle.common.fuelType') }}</label>
            <div>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.fuelType'
                class='w-full'
                name='fuelType'
                option-label='label'
                option-value='value'
                :options='fuelTypes'/>
              <div v-else>
                {{
                  t(
                    `vehicle.common.${vehicle.fuelType?.toLowerCase()}`,
                  )
                }}
              </div>
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>Hộp số</label>
            <div>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.transmission'
                class='w-full'
                name='transmission'
                option-label='label'
                option-value='value'
                :options='transmissions'/>
              <div v-else>
                {{
                  t(
                    `vehicle.common.${vehicle.transmission?.toLowerCase()}`,
                  )
                }}
              </div>
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>Xuất xứ</label>
            <div>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.origin'
                class='w-full'
                name='origin'
                :options='origins'/>
              <div v-else>
                {{
                  vehicle.origin
                }}
              </div>
            </div>
          </div>

          <div class='col-6 field'>
            <label
              class=''>{{
                t(`vehicle.common.color`)
              }}</label>
            <AutoComplete
              v-if='!isDetail'
              v-model='vehicle.color'
              class='w-full'
              dropdown
              :suggestions='colors'
              @complete='searchColor'/>
            <div v-else>
              {{ vehicle.color }}
            </div>
            <input
              v-model='vehicle.color'
              hidden
              name='color'/>
          </div>

          <div class='col-6 field'>
            <label
              class=''>Số chứng nhận đăng ký</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='vehicle.registrationCertificateNumber'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='registrationCertificateNumber'/>
            </div>
            <div v-else>
              {{ vehicle.registrationCertificateNumber }}
            </div>
          </div>

          <div class='col-6 field'>
            <label>Ngày đăng kiểm gần nhất</label>
            <div v-if='!isDetail'>
              <Calendar
                id='calendar-24h'
                v-model='vehicle.inspectionDate'
                class='w-full'
                icon-display='input'
                show-icon/>
            </div>
            <div v-else>
              {{
                moment(vehicle.inspectionDate)
                  .format('DD/MM/YYYY')
              }}
            </div>
          </div>

          <div class='col-6 field'>
            <label>Hạn đăng kiểm</label>
            <div v-if='!isDetail'>
              <Calendar
                id='calendar-24h'
                v-model='vehicle.registrationPeriod'
                class='w-full'
                icon-display='input'
                show-icon/>
            </div>
            <div v-else>
              {{
                moment(vehicle.registrationPeriod)
                  .format('DD/MM/YYYY')
              }}
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>{{ t('vehicle.common.usagePurpose') }}</label>
            <div>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.usagePurpose'
                class='w-full'
                name='usagePurpose'
                option-label='label'
                option-value='value'
                :options='usagePurposes'/>
              <div v-else>
                {{
                  t(
                    `vehicle.common.${vehicle.usagePurpose?.toLowerCase()}`,
                  )
                }}
              </div>
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>{{ t('vehicle.common.vehicleStatus') }}</label>
            <div>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.vehicleStatus'
                class='w-full'
                name='vehicleStatus'
                option-label='label'
                option-value='value'
                :options='vehicleStatuses'/>
              <div v-else>
                {{
                  t(
                    `vehicle.common.${vehicle.vehicleStatus?.toLowerCase()}`,
                  )
                }}
              </div>
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>{{ t(`vehicle.common.norder`) }}</label>
            <div>
              <InputNumber
                v-if='!isDetail'
                v-model='vehicle.norder'
                class='w-full'
                input-id='integeronly'/>
              <div v-else>
                {{ vehicle.norder }}
              </div>
              <input
                v-model='vehicle.norder'
                hidden
                name='norder'/>
            </div>
          </div>

          <div class='col-6 field'>
            <label class=''>{{ t('vehicle.common.status') }}</label>
            <div>
              <NamedDropdown
                v-if='!isDetail'
                v-model='vehicle.status'
                class='w-full'
                name='status'
                option-label='label'
                option-value='value'
                :options='statuses'/>
              <div v-else>
                {{
                  t(
                    `common.statuses.${vehicle.status ? 'active' : 'deactivate'}`,
                  )
                }}
              </div>
            </div>
          </div>

          <div class='col-12 field'>
            <label class=''>Đơn vị</label>
            <TreeSelect
              v-if='!isDetail'
              v-model='deptId'
              class='w-full'
              display='chip'
              v-bind='$attrs'
              :options='organizations'
              :pt="{
                labelContainer: {
                  style: 'width: 0vw',
                },
              }"
              selection-mode='single'>
            </TreeSelect>
          </div>

          <div class='col-4 field'>
            <div class='align-items-center flex gap-2 mb-3 mt-2'>
              <InputSwitch v-model='vehicle.hasAirportSecurityCard'/>
              Cấp thẻ an ninh vào sân bay
            </div>
          </div>

          <div class='col-12 field'>
            <label class='block font-bold mb-2'>Ảnh giấy chứng nhận đăng ký xe ô tô</label>
            <div class='flex gap-3'>
              <!-- Ảnh mặt trước -->
              <div class='w-4'>
                <div
                  v-if='!registrationFront'
                  class='align-items-center border-round cursor-pointer flex h-8rem justify-content-center surface-200 w-full'
                  @click='imgFrontRef?.click()'>
                  {{ $t('common.upload') }} (Mặt trước)
                </div>
                <div
                  v-else
                  class='image-container w-full'>
                  <img
                    alt='Mặt trước'
                    class='cursor-pointer img max-h-10rem object-fit-contain w-full'
                    :src='registrationFront'
                    @click='imgFrontRef?.click()'/>
                  <ButtonIcon
                    v-if='!isDetail'
                    v-tooltip.top="t('common.delete')"
                    class='absolute delete-btn right-1 top-1 z-10'
                    icon='delete'
                    icon-size='1.5'
                    rounded
                    @click.stop="removeRegistration('front')"/>
                </div>
                <input
                  ref='imgFrontRef'
                  accept='image/*'
                  hidden
                  name='registrationCertificateFrontImg'
                  type='file'
                  @change="(e) => changeImage(e, 'front')"/>
              </div>
              <!-- Ảnh mặt sau -->
              <div class='w-4'>
                <div
                  v-if='!registrationBack'
                  class='align-items-center border-round cursor-pointer flex h-8rem justify-content-center surface-200 w-full'
                  @click='imgBackRef?.click()'>
                  {{ $t('common.upload') }} (Mặt sau)
                </div>
                <div
                  v-else
                  class='image-container w-full'>
                  <img
                    alt='Mặt sau'
                    class='cursor-pointer img max-h-10rem object-fit-contain w-full'
                    :src='registrationBack'
                    @click='imgBackRef?.click()'/>
                  <ButtonIcon
                    v-if='!isDetail'
                    v-tooltip.top="t('common.delete')"
                    class='absolute delete-btn right-1 top-1 z-10'
                    icon='delete'
                    icon-size='1.5'
                    rounded
                    @click.stop="removeRegistration('back')"/>
                </div>
                <input
                  ref='imgBackRef'
                  accept='image/*'
                  hidden
                  name='registrationCertificateBackImg'
                  type='file'
                  @change="(e) => changeImage(e, 'back')"/>
              </div>
            </div>
          </div>

          <div class='col-12 field'>
            <div class='align-items-center flex flex justify-content-between'>
              <label class='font-bold'>{{
                t('vehicle.common.imgVehicle')
              }}</label>
              <ButtonIcon
                v-if='!isDetail'
                v-tooltip="'Chọn ' + t('vehicle.common.imgVehicle')"
                icon='add_circle'
                icon-size='1.5'
                rounded
                style='margin-left: auto'
                text
                @click='triggerFileInput'/>
              <input
                ref='fileInput'
                accept='image/*'
                hidden
                multiple
                name='images'
                type='file'
                @change='handleFileChange'/>
            </div>
          </div>
          <input
            v-model='vehicle.idFilesDelete'
            hidden
            name='idFilesDelete'/>

          <Carousel
            v-if='imgsVehicle.length > 0'
            v-model:page='imgIndex'
            :circular='false'
            class='mb-4'
            container-class='w-full'
            :num-scroll='1'
            :num-visible='3'
            :value='imgsVehicle'>
            <template #item='{ data, index }'>
              <div class='image-container relative'>
                <ButtonIcon
                  v-if='!isDetail'
                  v-tooltip.top="t('common.delete')"
                  class='absolute delete-btn right-1 top-1 z-10'
                  icon='delete'
                  icon-size='1.5'
                  rounded
                  @click='removeImage(index)'/>
                <img
                  :alt="data?.name || ''"
                  class='h-10rem object-fit-contain w-full'
                  :src="data?.url || ''"/>
              </div>
            </template>
          </Carousel>
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
        </div>
      </form>
    </div>
  </component>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getVehicleById, maxNOrder } from '@/apps/vehicle/api/graphql/vehicle';
import { getAllVehicleBranch, getAllVehicleModelByBranch } from '@/apps/vehicle/api/graphql/vehicle-branch';
import { createVehicle, updateVehicle } from '@/apps/vehicle/api/rest/vehicle';
import { type IVehicle, UsagePurposes, VehicleStatus } from '@/apps/vehicle/model/vehicle';
import type { IVehicleBranch, IVehicleModel } from '@/apps/vehicle/model/vehicleBranch';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl, generatePreviewFileUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { listToTree } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

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
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const vehicle = ref<IVehicle>({} as IVehicle);
const imgsVehicle = ref<any[]>([]);
const imgIndex = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);
const deptId = ref();

const registrationFront = ref<string | any>(null);
const registrationBack = ref<string | any>(null);

const imgFrontRef = ref<HTMLInputElement | null>(null);
const imgBackRef = ref<HTMLInputElement | null>(null);

const { user } = useUserStore();
const { moment } = useMoment();
const organizations = ref([]);
const listOrganizations = ref();

const changeImage = (event: Event, type: 'front' | 'back') => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const url = URL.createObjectURL(file);
    if (type === 'front') {
      registrationFront.value = url;
    } else {
      registrationBack.value = url;
    }
  }
};

const removeRegistration = (type: 'front' | 'back') => {
  if (type === 'front') {
    registrationFront.value = null;
    if (imgFrontRef.value) {
      imgFrontRef.value.value = '';
    }
  } else {
    registrationBack.value = null;
    if (imgBackRef.value) {
      imgBackRef.value.value = '';
    }
  }
};

const validateRules = {
  vehicleType: {
    required: helpers.withMessage(
      t('vehicle.common.error.requiredName'),
      required,
    ),
  },
  licensePlate: {
    required: helpers.withMessage(
      t('vehicle.common.error.requiredLicensePlate'),
      required,
    ),
  },
  vehicleBranch: {
    required: helpers.withMessage(
      t('vehicle.common.error.requiredVehicleBranch'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, vehicle);

const listVehicleBranch = ref<IVehicleBranch[]>([]);
const listVehicleModel = ref<IVehicleModel[]>([]);
const vehicleBranch = ref<string>();
const { onResult: getAllVehicleBranchResult } = getAllVehicleBranch();
getAllVehicleBranchResult((res) => {
  listVehicleBranch.value = res.data.getAllVehicleBranch;
});

const {
  onResult: getAllVehicleModelResult,
  refetch: getAllVehicleModelRefetch
} =
  getAllVehicleModelByBranch('');

getAllVehicleModelResult((res) => {
  listVehicleModel.value = res.data.getAllVehicleModelByBranch;
});

watch(vehicleBranch, newVal => {
  if (newVal) {
    getAllVehicleModelRefetch({ vehicleBranch: newVal });
  }
});

function getVehicleBranchByCode(code: string) {
  return listVehicleBranch.value?.find((v: IVehicleBranch) => v.code === code)
    ?.name;
}

if (!props.id) {
  vehicle.value.status = true;
  const { onResult } = maxNOrder();
  onResult((res) => {
    vehicle.value.norder = res.data.maxNOrderVehicle;
  });
}

if (props.id) {
  const { onResult: vehicleOnResult } = getVehicleById(props.id);
  vehicleOnResult((res) => {
    vehicle.value = {
      ...res.data.getVehicleById,
      inspectionDate: res.data.getVehicleById.inspectionDate && new Date(res.data.getVehicleById.inspectionDate),
      registrationPeriod: res.data.getVehicleById.registrationPeriod && new Date(res.data.getVehicleById.registrationPeriod),
    };
    deptId.value = { [vehicle.value.organizationId]: true };
    vehicleBranch.value = vehicle.value.vehicleBranch;
    imgsVehicle.value = vehicle.value.images.map((x) => ({
      id: x.id,
      name: x.name,
      url: generatePreviewFileUrl(x.path),
    }));

    registrationFront.value = generateAvatarUrl(vehicle.value.registrationCertificateFrontImg?.path);
    registrationBack.value = generateAvatarUrl(vehicle.value.registrationCertificateBackImg?.path);
  });
}

const statuses = ref([
  {
    value: true,
    label: t('common.statuses.active'),
  },
  {
    value: false,
    label: t('common.statuses.deactivate'),
  },
]);

const vehicleStatuses = ref([
  {
    value: VehicleStatus.WORKING_WELL,
    label: t('vehicle.common.working_well'),
  },
  {
    value: VehicleStatus.WORKING,
    label: t('vehicle.common.working'),
  },
  {
    value: VehicleStatus.WAITING_FOR_DISPOSAL,
    label: t('vehicle.common.waiting_for_disposal'),
  },
  {
    value: VehicleStatus.STOPPED,
    label: t('vehicle.common.stopped'),
  },
  {
    value: VehicleStatus.DISPOSED,
    label: t('vehicle.common.disposed'),
  },
]);
const usagePurposes = ref([
  {
    value: UsagePurposes.PRIVATE_BLD,
    label: t('vehicle.common.private_bld'),
  },
  {
    value: UsagePurposes.SHARED_PASSENGER,
    label: t('vehicle.common.shared_passenger'),
  },
  {
    value: UsagePurposes.SHARED_GOODS,
    label: t('vehicle.common.shared_goods'),
  },
]);

const fuelTypes = ref([
  {
    value: 'GASOLINE',
    label: t('vehicle.common.gasoline'),
  },
  {
    value: 'DIESEL',
    label: t('vehicle.common.diesel'),
  },
  {
    value: 'ELECTRIC',
    label: t('vehicle.common.electric'),
  },
  {
    value: 'HYBRID',
    label: t('vehicle.common.hybrid'),
  },
]);
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  listOrganizations.value = get(response, 'data.allOrganizationPublic', []);
  const tree = listToTree(
    listOrganizations.value.map((organization: OrganizationInterface) => ({
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

  tree.forEach((node: any) => {
    if (node.children) {
      node.children = node.children.map((child: any) => ({
        ...child,
        children: [],
      }));
    }
  });

  organizations.value = tree;
});

function submitVehicle() {
  isDisable.value = true;
  vehicle.value.vehicleBranch = vehicleBranch.value || '';
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid) {
        if (form.value) {
          const formData = new FormData(form.value);
          deptId.value && formData.append('organizationId', Object.keys(deptId.value).toString());
          formData.append('hasAirportSecurityCard', vehicle.value.hasAirportSecurityCard ? 'true' : 'false');
          formData.append('inspectionDate', moment(vehicle.value.inspectionDate).format(
            DateTimeFormat.ISO_LOCAL_DATE,
          ));
          formData.append('registrationPeriod', moment(vehicle.value.registrationPeriod).format(
            DateTimeFormat.ISO_LOCAL_DATE,
          ));
          if (props.id) {
            formData.append('id', props.id);
            updateVehicle(formData)
              .then(() => {
                toastSuccess({ message: t('Lưu thành công.') });
                emits('hide-dialog');
              })
              .catch((reson) =>
                toastError({ message: t(`vehicle.common.${reson.code.toString()}`), }),
              );
          } else {
            createVehicle(formData)
              .then(() => {
                toastSuccess({ message: t('Lưu thành công.') });
                emits('hide-dialog');
              })
              .catch((reson) =>
                toastError({ message: t(`vehicle.common.${reson.code.toString()}`), }),
              );
          }
        }
      }
    })
    .then(() => isDisable.value = false);
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgsVehicle.value.push({
          name: file.name,
          url: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

function removeImage(index: number) {
  if (index === imgsVehicle.value.length - 1) {
    imgIndex.value = 0;
  }
  if (imgsVehicle.value[index].id) {
    if (!vehicle.value.idFilesDelete) {
      vehicle.value.idFilesDelete = [];
    }
    vehicle.value.idFilesDelete = [
      ...vehicle.value.idFilesDelete,
      imgsVehicle.value[index].id,
    ];
  }
  imgsVehicle.value.splice(index, 1);
}

const listNumberOfSeats = ref<number[]>([2, 4, 5, 7, 9, 12, 16, 24, 29, 32, 35, 45]);
const colors = ref<string[]>([]);

const searchColor = () => {
  setTimeout(() => {
    colors.value = ['Trắng', 'Đen', 'Đỏ', 'Xám', 'Bạc', 'Vàng ánh kim', 'Nâu', 'Cam', 'Xanh lá',
      'Xanh dương'];
  }, 100);
};

const transmissions = ref([
  {
    value: 'AUTOMATIC',
    label: t('vehicle.common.automatic'),
  },
  {
    value: 'MANUAL',
    label: t('vehicle.common.manual'),
  },
]);

const origins = ref(['Việt Nam', 'Nhật', 'Mỹ', 'Thái Lan', 'Hàn Quốc', 'Trung Đông', 'Khác']);
</script>

<style lang='scss' scoped>
.image-container {
  position: relative;
}

.delete-btn {
  position: absolute;
  right: 0.7rem;
  top: 0.7rem;
  display: none;
  background-color: red;
}

.image-container:hover .delete-btn {
  display: block;
}

.image-container:hover .delete-btn {
  display: block;
}

.remove-btn {
  transition: opacity 0.3s ease;
}

.relative:hover .remove-btn {
  opacity: 1 !important;
}
</style>
