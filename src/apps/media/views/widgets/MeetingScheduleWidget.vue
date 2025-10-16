<template>
  <div class='border-round card p-2'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Lịch và sự kiện</div>
      <div class='flex gap-1 text-sm'>
        <div class='align-content-end'>{{ getWeekInfo(new Date) }}</div>
      </div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <SubScheduleWidget/>
  </div>
</template>

<script lang='ts' setup>
import SubScheduleWidget from '@/apps/media/views/widgets/SubScheduleWidget.vue';

function getWeekInfo(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay() || 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekNumber = Math.ceil(
    ((+monday - +new Date(monday.getFullYear(), 0, 1)) / 86400000 + 1) / 7
  );

  const fmt = (d: Date) =>
    d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  return `Tuần ${weekNumber} (${fmt(monday)} - ${fmt(sunday)})`;
}
</script>

<style scoped>
.checkIn {
  width: 10rem;
  height: 7rem;
  background: #E9F7FD
}

.checkOut {
  width: 10rem;
  height: 7rem;
  background: #DCFCE7
}
</style>
