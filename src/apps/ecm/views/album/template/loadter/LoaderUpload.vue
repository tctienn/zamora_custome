<template>
    <div class="upload-progress" v-if="progress > 0 && progress < 100">
        <div class="progress-container">
            <div class="progress-bar" :style="{ width: progress + '%' }">
                <span class="progress-text">{{ Math.round(progress) }}%</span>
            </div>
        </div>
        <span class="status-text">{{ statusText }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    // Giá trị tiến độ từ 0-100
    progress: number;
    // Text hiển thị trạng thái (tùy chọn)
    statusText?: string;
}>();
</script>

<style scoped>
.upload-progress {
    width: 100%;
    padding: 1rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-container {
    width: 100%;
    height: 20px;
    background: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #45a049);
    transition: width 0.3s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress-text {
    color: white;
    font-size: 12px;
    font-weight: bold;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.status-text {
    display: block;
    font-size: 14px;
    color: #666;
    text-align: center;
}
</style>