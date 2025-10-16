<template>
  <div
    v-if='visible'
    class='border-1 border-round-2xl flex flex-row h-15rem justify-content-evenly p-3 shadow-1 surface-border'>
    <Chart
      class='h-full'
      :data='{
        labels: ["A", "B", "C"],
        datasets: [
          {
            data: [540, 325, 702],
            backgroundColor: [documentStyle.getPropertyValue("--blue-500"), documentStyle.getPropertyValue("--yellow-500"), documentStyle.getPropertyValue("--green-500")],
            hoverBackgroundColor: [documentStyle.getPropertyValue("--blue-400"), documentStyle.getPropertyValue("--yellow-400"), documentStyle.getPropertyValue("--green-400")]
          }
        ]
      }'
      :options='{cutout: "60%" }'
      type='pie'/>

    <Chart
      class='h-full'
      :data='{
        datasets: [
          {
            data: [11, 16, 7, 3, 14],
            backgroundColor: [
              documentStyle.getPropertyValue("--red-500"),
              documentStyle.getPropertyValue("--green-500"),
              documentStyle.getPropertyValue("--yellow-500"),
              documentStyle.getPropertyValue("--bluegray-500"),
              documentStyle.getPropertyValue("--blue-500")
            ],
            label: "My dataset"
          }
        ],
        labels: ["Red", "Green", "Yellow", "Grey", "Blue"]
      }'
      :options='{
        plugins: {
          legend: {
            labels: {
              color: documentStyle.getPropertyValue("--text-color")
            }
          }
        },
        scales: {
          r: {
            grid: {
              color: documentStyle.getPropertyValue("--surface-border")
            }
          }
        }
      }'
      type='polarArea'/>
  </div>
</template>

<script setup lang='ts'>

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const documentStyle = getComputedStyle(document.body);
</script>

<script lang='ts'>
export default { name: 'SystemDashboardChartWidget' };
</script>