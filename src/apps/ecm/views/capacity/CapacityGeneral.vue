<template>
  <div>

    <div class='card p-fluid'>
      <div class='formgrid grid'>
        <div class='col-2'>
          <label class='font-bold'>{{ t('ecm.capacity.capacityGeneralPerson') }}</label>
        </div>
        <div class='col-4'>
          <InputText
            v-model='idPerson'
            hidden/>
          <InputNumber
            v-model='capacityPerson'
            :placeholder='t("MB/GB/TB")'/>
        </div>
        <div class='col-1'>
          <Dropdown
            v-model='unitPerson'
            :empty-message='t("common.select")'
            option-label='name'
            option-value='code'
            :options='unit'
            :placeholder="t('common.select')"
            style='width: 100%'/>
        </div>

        <div class='col-5'>
          <Button
            :label='t("common.save")'
            style='width: 15%'
            type='button'
            @click='saveCapacityPersonFn'/>
        </div>
      </div>
      <br>
      <div class='formgrid grid'>
        <div class='col-2'>
          <label class='font-bold'>{{ t('ecm.capacity.capacityGeneralGroup') }}</label>
        </div>
        <div class='col-4'>
          <InputText
            v-model='idGroup'
            hidden/>
          <InputNumber
            id='emailConfigurationName'
            v-model='capacityGroup'
            :placeholder='t("MB/GB/TB")'/>
          <!--          <Button-->
          <!--            class='col-1 w-auto'-->
          <!--            text-->
          <!--            @click='goToManage()'>-->
          <!--            <span>{{ t('ecm.capacity.linkToManage') }}</span>-->
          <!--          </Button>-->
        </div>
        <div class='1 col'>
          <Dropdown
            v-model='unitGroup'
            :empty-message='t("common.select")'
            option-label='name'
            option-value='code'
            :options='unit'
            :placeholder="t('common.select')"
            style='width: 100%'/>
        </div>

        <div class='col-5'>
          <Button
            :label='t("common.save")'
            style='width: 15%'
            type='button'
            @click='saveCapacityGroupFn'/>
        </div>
      </div>
    </div>
  </div>
  <Divider/>
  <CapacityManage/>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getOrDefaultGroupCapacityGeneral,
  getOrDefaultUserCapacityGeneral,
  saveCapacity
} from '@/apps/ecm/api/graphql/capacity-graphql-api';
import { unitCapacity } from '@/apps/ecm/model/capacity';
import CapacityManage from '@/apps/ecm/views/capacity/CapacityManage.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import router from '@/common/router';

const { t } = useI18n() || {};

const {
  mutate: saveCapacityMutate,
  onDone: saveCapacityDone
} = saveCapacity();

const {
  onResult: userCapacityResult,
  refetch: userCapacityFetch
} = getOrDefaultUserCapacityGeneral();
const {
  onResult: groupCapacityResult,
  refetch: groupCapacityFetch
} = getOrDefaultGroupCapacityGeneral();

const unit = ref();
const idPerson = ref('');
const idGroup = ref('');
const capacityPerson = ref(0);
const capacityGroup = ref(0);
const unitPerson = ref('');
const unitGroup = ref('');

userCapacityResult((res) => {
  idPerson.value = res.data.getOrDefaultUserCapacityGeneral.id;
  capacityPerson.value = res.data.getOrDefaultUserCapacityGeneral.capacity;
  unitPerson.value = res.data.getOrDefaultUserCapacityGeneral.unit;
});

groupCapacityResult((res) => {
  idGroup.value = res.data.getOrDefaultGroupCapacityGeneral.id;
  capacityGroup.value = res.data.getOrDefaultGroupCapacityGeneral.capacity;
  unitGroup.value = res.data.getOrDefaultGroupCapacityGeneral.unit;
});

saveCapacityDone(() => {
  toastSuccess({ message: t('ecm.capacity.configSuccess') });
  userCapacityFetch();
  groupCapacityFetch();
});

function goToManage() {
  router.push({ name: 'CapacityConfigManage' });
}

function saveCapacityPersonFn() {
  saveCapacityMutate({
    capacityInput: {
      id: idPerson.value,
      type: 'PERSON',
      unit: unitPerson.value,
      capacity: capacityPerson.value
    }
  });
}

function saveCapacityGroupFn() {
  saveCapacityMutate({
    capacityInput: {
      id: idGroup.value,
      type: 'GROUP',
      unit: unitGroup.value,
      capacity: capacityGroup.value
    }
  });
}

unit.value = Object.values(unitCapacity).map((u: string) => ({
  code: u,
  name: u
}));

</script>

<script lang='ts'>
export default { name: 'CapacityGeneral' };
</script>

<style scoped>

</style>