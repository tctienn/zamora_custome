<template>
  <div class='border-round card p-2'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Checkin</div>
      <div class='flex gap-1 text-sm'>
        <div class='align-content-end'>Hôm nay,</div>
        <div class='align-content-end font-semibold'>Thứ 2, 12/5/2025</div>
      </div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>

    <div class='flex gap-4'>
      <div class='checkIn text-black-alpha-80'>
        <div class='flex font-semibold gap-1 pl-2 pt-2'>
          <AppIcon
            name='schedule'
            size='1.25'/>
          Giờ vào
        </div>
        <div
          class='flex font-bold justify-content-center py-2 text-2xl'
          style='color: #36A2EB'>08:15
        </div>
        <div class='flex gap-1 justify-content-center'>
          Muộn <span style='color: red;'>15</span> phút
        </div>

      </div>

      <div class='checkOut text-black-alpha-80'>
        <div class='flex font-semibold gap-1 pl-2 pt-2'>
          <AppIcon
            name='schedule'
            size='1.25'/>
          Giờ về
        </div>
        <div
          class='flex font-bold justify-content-center py-2 text-2xl'
          style='color: #6DD230'>18:00
        </div>
        <div class='flex justify-content-center'>Chưa check out</div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
</script>

<style scoped>
.checkIn {
  width: 10rem;
  height: 7rem;
  background: #E9F7FD;
  border-radius: 5px
}

.checkOut {
  width: 10rem;
  height: 7rem;
  background: #DCFCE7;
  border-radius: 5px
}
</style>
