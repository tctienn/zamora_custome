<template>
  <div class='circular-progress-container flex justify-content-center'>
    <div class='circular-progress'>
      <svg
        class='progress-ring'
        height='42'
        width='42'>
        <circle
          class='progress-ring__background'
          cx='21'
          cy='21'
          r='15'/>
        <circle
          class='progress-ring__progress'
          cx='21'
          cy='21'
          r='15'
          :style='progressCircle(progress)'/>
      </svg>
      <div class='progress-label'>
        {{ progress ? Math.round(progress) : 0 }}
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  }
});

const radius = 15; // Bán kính của vòng tròn
const circumference = 2 * Math.PI * radius;

function progressCircle(percent: number) {
  const offset = circumference - percent / 100 * circumference;
  const strokeColor = percent > 50 ? '#94C748' : '#007ad9';
  return {
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: offset,
    stroke: strokeColor
  };
}

</script>

<style scoped>
.circular-progress {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-ring {
  transform: rotate(-90deg); /* Xoay vòng tròn để bắt đầu từ trên */
}

.progress-ring__background {
  fill: transparent;
  stroke: #d4d4d4; /* Màu nền vòng tròn */
  stroke-width: 4; /* Độ dày border */
}

.progress-ring__progress {
  fill: transparent;
  stroke: #007ad9; /* Màu tiến trình */
  stroke-width: 4; /* Độ dày border */
  stroke-linecap: round; /* Đầu tròn */
  transition: stroke-dashoffset 0.3s; /* Hiệu ứng mượt */
}

.progress-label {
  position: absolute;
  font-size: 10px;
}
</style>