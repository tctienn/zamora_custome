<template>
  <div class='align-items-center flex flex-row justify-content-between'>
    <div class='max-w-50 min-w-25'>
    </div>

    <div class='align-items-center column-gap-2 flex flex-grow-1 flex-row justify-content-end'>
      <!--      <InputSwitch-->
      <!--        v-model='chartVisible'-->
      <!--        v-tooltip.bottom='t(`widget.${chartVisible ? "hideChartDashboard" : "showChartDashboard"}`)'-->
      <!--        @change='emits("toggle-chart-widget", chartVisible)'/>-->

      <ButtonIcon
        v-tooltip='t("dashboardWidget.editWidgets")'
        class='p-1'
        icon='edit'
        icon-size='1.5'
        rounded
        text
        @click='emits("show-widget-dialog")'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  chartDashboardVisible: {
    type: Boolean,
    default: false
  },
});

const emits = defineEmits(['show-widget-dialog', 'toggle-chart-widget']);

const chartVisible = ref(props.chartDashboardVisible);

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'SystemDashboardHeader' };
</script>