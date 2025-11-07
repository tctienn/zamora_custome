<template>
    <div class="current-user-view">


        <!-- logview -->
        <div style="cursor: pointer;" @click="visibleListUserLogView = true" class="viewers-info">
            <i class="pi pi-eye"></i>
            <span class="viewers-count">{{ AuditLogViewers?.length }} người đã xem </span>
            <!-- <span class="viewers-text">{{ currentFoled.activeViewersCount === 1 ? 'người đang xem' : 'người đang xem'
            }}</span> -->

            <!-- list  log user view -->
            <Dialog v-model:visible="visibleListUserLogView" modal :style="{ width: '28rem' }">
                <template #header>
                    <div class="dialog-header">
                        <i class="pi pi-users" style="font-size: 1.25rem; margin-right: 8px;"></i>
                        <span>Người đã xem</span>
                    </div>
                </template>

                <div class="viewers-list">
                    <div v-for="(e, i) in AuditLogViewers" :key="i" class="viewer-item">
                        <AppAvatar :avatar="generateAvatarUrl(e.user.avatar)" :label="e.user.fullName" shape="circle"
                            size="2.5" class="viewer-avatar" />
                        <div class="viewer-info">
                            <div class="viewer-name">{{ e.user.fullName }}</div>
                            <div class="viewer-email">{{ e.user.email }}</div>
                        </div>
                    </div>

                    <div v-if="AuditLogViewers.length === 0" class="empty-viewers">
                        <i class="pi pi-users" style="font-size: 2rem; color: #ccc;"></i>
                        <p>Không có người đã xem</p>
                    </div>
                </div>

                <template #footer>
                    <Button type="button" label="Đóng" severity="secondary"
                        @click="visibleListUserView = false"></Button>
                </template>
            </Dialog>
        </div>

        <!-- view now -->
        <!-- <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Đang tải...</span>
        </div>
        
        <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Đang tải...</span>
        </div>
        <div style="cursor: pointer;" @click="visibleListUserView = true"
            v-else-if="currentFoled.activeViewersCount !== null" class="viewers-info">
            <i class="pi pi-eye"></i>
            <span class="viewers-count">{{ currentFoled.activeViewersCount }}</span>
            <span class="viewers-text">{{ currentFoled.activeViewersCount === 1 ? 'người đang xem' : 'người đang xem'
                }}</span>

            <Dialog v-model:visible="visibleListUserView" modal :style="{ width: '28rem' }">
                <template #header>
                    <div class="dialog-header">
                        <i class="pi pi-users" style="font-size: 1.25rem; margin-right: 8px;"></i>
                        <span>Người đang xem</span>
                    </div>
                </template>

                <div class="viewers-list">
                    <div v-for="(viewer, i) in currentFoled.activeViewers" :key="i" class="viewer-item">
                        <AppAvatar :avatar="generateAvatarUrl(viewer.avatar)" :label="viewer.fullName" shape="circle"
                            size="2.5" class="viewer-avatar" />
                        <div class="viewer-info">
                            <div class="viewer-name">{{ viewer.fullName }}</div>
                            <div class="viewer-email">{{ viewer.email }}</div>
                        </div>
                    </div>

                    <div v-if="!currentFoled.activeViewers || currentFoled.activeViewers.length === 0"
                        class="empty-viewers">
                        <i class="pi pi-users" style="font-size: 2rem; color: #ccc;"></i>
                        <p>Không có người đang xem</p>
                    </div>
                </div>

                <template #footer>
                    <Button type="button" label="Đóng" severity="secondary"
                        @click="visibleListUserView = false"></Button>
                </template>
            </Dialog>
        </div>
        <div v-else class="error-state">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Không thể tải thông tin</span>
        </div> -->
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppAvatar from '@/common/components/app/AppAvatar.vue'
import { generateAvatarUrl } from '@/common/helpers/file-utils'
import { pingCurrenView, getFolderDetail, getAllUSersLogsByFolderParentAndAction } from "../api/Album.js"

const props = defineProps({
    idfolder: {
        type: [String, Number],
        required: true
    }
})
const visibleListUserView = ref(false)
const visibleListUserLogView = ref(false)
const currentViewers = ref(null)
const loading = ref(true)
let pingInterval = null
const currentFoled = ref({})
const AuditLogViewers = ref([])
//hàm gọi APO để lấy số người đã xem
async function fetchAuditLogViewers() {
    const response = await getAllUSersLogsByFolderParentAndAction(props.idfolder, 'VIEW')
    AuditLogViewers.value = response.data
    // console.log("AuditLogViewersssssssssssssssss", AuditLogViewers.value)
}
// Hàm gọi API để lấy số người đang xem
async function fetchCurrentViewers() {

    if (!props.idfolder) {
        currentViewers.value = null
        return
    }

    try {
        const response = await pingCurrenView(props.idfolder)
        // const curreanFolderresponse = await fetchFolderDetail()
        console.log("ping fetchCurrentViewers ")
        // Giả sử API trả về { data: { count: number } } hoặc { data: number }
        // Cần điều chỉnh theo response thực tế
        if (response.data) {
            currentViewers.value = typeof response.data === 'number'
                ? response.data
                : response.data.count || response.data.viewers || 0
        }
    } catch (error) {
        console.error('Error fetching current viewers:', error)
        currentViewers.value = null
    } finally {
        loading.value = false
    }
}

// Hàm lấy thông tin folder detail
async function fetchFolderDetail() {
    // if (!props.idfolder) {
    //     return
    // }

    // try {
    //     const curranFResPonse = await getFolderDetail(props.idfolder)
    //     currentFoled.value = curranFResPonse.data
    // } catch (error) {
    //     console.error('Error fetching folder detail:', error)
    // }
}

// Khởi động interval ping
function startPingInterval() {
    // Clear interval cũ nếu có
    // if (pingInterval) {
    //     clearInterval(pingInterval)
    // }

    // // Gọi ngay lần đầu
    // fetchCurrentViewers()

    // // Sau đó gọi mỗi 50 giây
    // pingInterval = setInterval(() => {
    //     fetchCurrentViewers()
    // }, 50000) // 50 giây = 50000 milliseconds
}

// Dừng interval
// function stopPingInterval() {
//     if (pingInterval) {
//         clearInterval(pingInterval)
//         pingInterval = null
//     }
// }

// Theo dõi thay đổi idfolder
watch(() => props.idfolder, (newId) => {
    if (newId) {
        fetchAuditLogViewers()
        loading.value = true
        // fetchFolderDetail()
        // startPingInterval()
    } else {
        // stopPingInterval()
        currentViewers.value = null
    }
})

// Khởi tạo khi component mount
onMounted(async () => {
    if (props.idfolder) {
        await fetchAuditLogViewers()
        await fetchFolderDetail()
        startPingInterval()
    }
})

// Cleanup khi component unmount
onUnmounted(() => {
    // stopPingInterval()
})
</script>

<style scoped>
.current-user-view {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.loading-state,
.error-state {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.loading-state i {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.viewers-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.viewers-info i {
    color: #6c5ce7;
    font-size: 1rem;
}

.viewers-count {
    font-weight: 600;
    color: #111827;
}

.viewers-text {
    color: #6b7280;
}

.error-state i {
    color: #ef4444;
}

/* Dialog styles */
.dialog-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 1.125rem;
}

.viewers-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 0.5rem 0;
}

.viewer-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    margin-bottom: 0.5rem;
}

.viewer-item:hover {
    background-color: #f3f4f6;
}

.viewer-avatar {
    flex-shrink: 0;
}

.viewer-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
}

.viewer-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.viewer-email {
    font-size: 0.75rem;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-viewers {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: #6b7280;
}

/* Scrollbar styling */
.viewers-list::-webkit-scrollbar {
    width: 8px;
}

.viewers-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.viewers-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.viewers-list::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
