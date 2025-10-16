<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :pt='{
      content: {
        class: "pt-0",
      },
    }'
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
          Tổng hợp
        </div>
      </div>
    </template>
    <TabView
      :active-index='activeIndex'
      :pt='{
        root: {
          style: {marginLeft: "-1rem"},
        },
      }'
      @tab-change='(e) => activeIndex = e.index'>
      <TabPanel
        v-for='tab in tabs'
        :key='tab.title'
        :header='tab.title'>
      </TabPanel>
    </TabView>
    <iframe
      v-if='activeIndex === 1'
      class='rounded w-full'
      :src='link'
      style='height: 750px'></iframe>
    <div v-if='activeIndex === 0'>
      <div
        v-if='data'>
        <div class='grid w-full'>
          <div class='col-6 flex'>
            <div>Biển số xe</div>
            :
            <div class='font-bold ml-3'>{{ data.VehiclePlate }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Số hiệu xe</div>
            :
            <div class='font-bold ml-3'>{{ data.PrivateCode }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Tổng số phút</div>
            :
            <div class='font-bold ml-3'>{{ data.TotalMinutes }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Vĩ độ bắt đầu</div>
            :
            <div class='font-bold ml-3'>{{ data.StartLatitude }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Kinh độ bắt đầu</div>
            :
            <div class='font-bold ml-3'>{{ data.StartLongitude }}</div>
          </div>
          <div class='col-12 flex'>
            <div>Địa chỉ bắt đầu</div>
            :
            <div class='font-bold ml-3'>{{ data.StartAddress }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Vĩ độ kết thúc</div>
            :
            <div class='font-bold ml-3'>{{ data.EndLatitude }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Kinh độ kết thúc</div>
            :
            <div class='font-bold ml-3'>{{ data.EndLongitude }}</div>
          </div>
          <div class='col-12 flex'>
            <div>Địa chỉ kết thúc</div>
            :
            <div class='font-bold ml-3'>{{ data.EndAddress }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Tổng số phút hoạt động</div>
            :
            <div class='font-bold ml-3'>{{ data.ActivityTime }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Tổng số phút dừng đỗ</div>
            :
            <div class='font-bold ml-3'>{{ data.TotalTimeStop }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Dừng đỗ bật máy</div>
            :
            <div class='font-bold ml-3'>{{ data.TotalTimeStopMachineOn }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Dừng đỗ tắt máy</div>
            :
            <div class='font-bold ml-3'>{{ data.TotalTimeStopMachineOff }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Tổng km GPS</div>
            :
            <div class='font-bold ml-3'>{{ data.TotalKmGps }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Tổng km cơ</div>
            :
            <div class='font-bold ml-3'>{{ data.KmOfPulseMechanical }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Định mức nhiên liệu (lít)</div>
            :
            <div class='font-bold ml-3'>{{ data.NormsOfGasonline }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Số lần dừng đỗ</div>
            :
            <div class='font-bold ml-3'>{{ data.StopCount }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Số phút bật điều hòa</div>
            :
            <div class='font-bold ml-3'>{{ data.MinutesOfAirConditioningOn }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Vận tốc lớn nhất (km/h)</div>
            :
            <div class='font-bold ml-3'>{{ data.Vmax }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Vận tốc trung bình (km/h)</div>
            :
            <div class='font-bold ml-3'>{{ data.Varg }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Lái xe liên tục vi phạm BGT</div>
            :
            <div class='font-bold ml-3'>{{ data.DrivingContinousTimes }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Tăng tốc đột ngột</div>
            :
            <div class='font-bold ml-3'>{{ data.IncreaseSpeedSudden }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Giảm tốc đột ngột</div>
            :
            <div class='font-bold ml-3'>{{ data.DecreaseSpeedSudden }}</div>
          </div>
          <div class='col-6 flex'>
            <div>Số lần quá tốc</div>
            :
            <div class='font-bold ml-3'>{{ data.SpeedOverCount }}</div>
          </div>
        </div>
      </div>
      <div
        v-else
        class='p-3 text-center'>⏳ Đang tải dữ liệu...
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>

import axios from 'axios';
import { onMounted, ref } from 'vue';

import EnvConfig from '@/common/config';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  licensePlate: {
    type: String,
    default: '',
  },
  actualTimeEnded: {
    type: String,
    default: '',
  },
  actualDepartureTime: {
    type: String,
    default: '',
  },
});
const emits = defineEmits(['hide-dialog']);
const visibleForm = ref(props.visibleDialog);
const data = ref<any>(null);
const link = ref();
const activeIndex = ref(0);

const getGpsSummaryToday = async (vehiclePlate: string) => {
  const url = 'http://api.gps.binhanh.vn/api/gps/rptsummarybytrip';
  const url2 = 'http://api.gps.binhanh.vn/api/gps/createlinkshare';

  const actualTimeEnded = new Date(props.actualTimeEnded);
  const actualDepartureTime = new Date(props.actualDepartureTime);

  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(
      2,
      '0'
    )}:${String(d.getMinutes()).padStart(2, '0')}:${String(
      d.getSeconds()
    ).padStart(2, '0')}`;

  const body = {
    CustomerCode: EnvConfig.value('VITE_VCB_VEHICLE_CUSTOMER_CODE'),
    Key: EnvConfig.value('VITE_VCB_VEHICLE_KEY'),
    Data: [
      {
        VehiclePlate: vehiclePlate,
        StartTime: format(actualDepartureTime),
        EndTime: format(actualTimeEnded),
      },
    ]
  };

  const body2 = {
    CustomerCode: EnvConfig.value('VITE_VCB_VEHICLE_CUSTOMER_CODE'),
    Key: EnvConfig.value('VITE_VCB_VEHICLE_KEY'),
    VehiclePlates: [vehiclePlate],
    fromDate: format(actualDepartureTime),
    toDate: format(actualTimeEnded),
    ShareType: 2,
  };

  const res = await axios.post(url, body);
  const res2 = await axios.post(url2, body2);
  link.value = res2.data.Link;
  return res.data.Data[0];
};

onMounted(async () => {
  if (props.licensePlate) {
    data.value = await getGpsSummaryToday(props.licensePlate);
  }
});

const tabs = ref([
  { title: 'Thông tin', },
  { title: 'Xem Map lịch trình', },
]);

</script>

<style scoped>
:deep(.p-tabview .p-component) {
  margin-left: -1rem
}
</style>