<template>
  <div class='border-round card p-2'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Văn bản</div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>

    <div class='space-y-4'>
      <div class='grid justify-content-between'>
        <div class='col-3 flex flex-column'>
          <h3 class='font-semibold mb-2 text-sm'>{{ chartGroups[0].title }}</h3>
          <Chart
            :data='chartGroups[0].data'
            :options='chartOptions'
            type='doughnut'/>
        </div>

        <div class='col-3 flex flex-column'>
          <h3 class='font-semibold mb-2 text-sm'>{{ chartGroups[1].title }}</h3>
          <Chart
            :data='chartGroups[1].data'
            :options='chartOptions'
            type='doughnut'/>
        </div>

        <div class='col-3 flex flex-column'>
          <h3 class='font-semibold mb-2 text-sm'>{{ chartGroups[2].title }}</h3>
          <Chart
            :data='chartGroups[2].data'
            :options='chartOptions'
            type='doughnut'/>
        </div>
      </div>

      <div class='flex gap-4 justify-content-center mt-4'>
        <div class='flex gap-2 items-center'>
          <span
            class='h-1rem rounded-full w-1rem'
            style='background-color: #42A5F5'></span>
          <span class='text-sm'>Đã xử lý</span>
        </div>
        <div class='flex gap-2 items-center'>
          <span
            class='h-1rem rounded-full w-1rem'
            style='background-color: #FFA726'></span>
          <span class='text-sm'>Chưa xử lý</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref } from 'vue';

const chartOptions = {
  cutout: '60%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.raw || 0;
          return `${label}: ${value}`;
        }
      }
    }
  }
};

const chartGroups = ref([
  {
    title: 'Văn bản đến',
    data: {
      labels: ['Đã xử lý', 'Chưa xử lý'],
      datasets: [{
        data: [35, 65],
        backgroundColor: ['#42A5F5', '#FFA726'],
        hoverBackgroundColor: ['#64B5F6', '#FFB74D']
      }]
    }
  },
  {
    title: 'Văn bản trình ký',
    data: {
      labels: ['Đã xử lý', 'Chưa xử lý'],
      datasets: [{
        data: [25, 75],
        backgroundColor: ['#42A5F5', '#FFA726'],
        hoverBackgroundColor: ['#64B5F6', '#FFB74D']
      }]
    }
  },
  {
    title: 'Tờ trình',
    data: {
      labels: ['Đã xử lý', 'Chưa xử lý'],
      datasets: [{
        data: [50, 50],
        backgroundColor: ['#42A5F5', '#FFA726'],
        hoverBackgroundColor: ['#64B5F6', '#FFB74D']
      }]
    }
  }
]);
</script>

<style scoped>
</style>
