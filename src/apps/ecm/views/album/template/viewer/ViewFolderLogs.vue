<template>
    <!-- nhật ký theo folder hiện tại -->
    <div class="folder-logs-container">
        <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem; color: #6c5ce7;"></i>
            <p>Đang tải nhật ký...</p>
        </div>

        <div v-else-if="logFolders.length === 0" class="empty-state">
            <i class="pi pi-history" style="font-size: 2rem; color: #9ca3af;"></i>
            <p>Chưa có nhật ký hoạt động</p>
        </div>

        <div v-else class="logs-timeline">
            <div v-for="(log, index) in logFolders" :key="log.id" class="log-item">
                <div class="log-icon" :class="getActionClass(log.action)">
                    <i :class="getActionIcon(log.action)"></i>
                </div>
                <div class="log-content">
                    <div class="log-header">
                        <span class="log-action" :class="getActionClass(log.action)">
                            {{ getActionLabel(log.action) }}
                        </span>
                        <span class="log-time">{{ formatTimestamp(log.timestamp) }}</span>
                    </div>
                    <div class="log-description">{{ log.description }}</div>
                    <div v-if="true" class="log-user">
                        <div class="user-avatar-mini">
                            <AppAvatar :avatar='generateAvatarUrl(log.user.avatar)' :label='log.user.fullName'
                                shape='circle' size='2.5' />
                        </div>
                        <span class="user-name-text">{{ log.user.fullName }}</span>
                    </div>
                </div>
                <div v-if="index < logFolders.length - 1" class="log-connector"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAllLogsByFolderParent } from "../../api/Album.js"
// import { generateAvatarUrl } from '@/common/helpers/file-utils.js'
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const props = defineProps({
    parentId: { /// đây là id của đối tượng hiện tại đang được xét để lấy log
        type: String,
        default: null
    }
})

const logFolders = ref([])
const loading = ref(false)

const getLogs = async () => {
    if (!props.parentId) {
        logFolders.value = []
        return
    }

    loading.value = true
    try {
        const response = await getAllLogsByFolderParent(props.parentId)
        logFolders.value = response.data || []
        console.log('check response.data ', response.data)
    } catch (error) {
        console.error('Error fetching logs:', error)
        logFolders.value = []
    } finally {
        loading.value = false
    }
}

const getActionIcon = (action) => {
    const icons = {
        'CREATE': 'pi pi-plus-circle',
        'DELETE': 'pi pi-trash',
        'UPDATE': 'pi pi-pencil',
        'RENAME': 'pi pi-tag',
        'SHARE': 'pi pi-share-alt',
        'UPLOAD': 'pi pi-upload',
        'VIEW': 'pi pi-eye'
    }
    return icons[action] || 'pi pi-circle'
}

const getActionLabel = (action) => {
    const labels = {
        'CREATE': 'Tạo mới',
        'DELETE': 'Xóa',
        'UPDATE': 'Cập nhật',
        'RENAME': 'Đổi tên',
        'SHARE': 'Chia sẻ',
        'UPLOAD': 'Tải lên',
        'VIEW': 'Xem'
    }
    return labels[action] || action
}

const getActionClass = (action) => {
    const classes = {
        'CREATE': 'action-create',
        'DELETE': 'action-delete',
        'UPDATE': 'action-update',
        'RENAME': 'action-rename',
        'SHARE': 'action-share',
        'UPLOAD': 'action-upload',
        'VIEW': 'action-view'
    }
    return classes[action] || 'action-default'
}

const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`

    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getUserName = (log) => {
    // Kiểm tra nhiều trường hợp để lấy tên người dùng
    if (log.user?.fullName) return log.user.fullName
    if (log.user?.name) return log.user.name
    if (log.user?.username) return log.user.username
    if (log.userName) return log.userName
    if (log.user?.email) return log.user.email
    // Nếu không có, hiển thị userId (rút ngắn nếu quá dài)
    if (log.userId) {
        const userId = String(log.userId)
        return userId.length > 12 ? userId.substring(0, 12) + '...' : userId
    }
    return null
}

onMounted(() => {
    if (props.parentId) {
        getLogs()
    }
})

watch(() => props.parentId, (newVal) => {
    if (newVal) {
        getLogs()
    } else {
        logFolders.value = []
    }
})
</script>

<style scoped>
.folder-logs-container {
    height: 40vh;
    overflow: scroll;
    width: 100%;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: #6b7280;
}

.logs-timeline {
    position: relative;
    padding: 0.5rem 0;
}

.log-item {
    position: relative;
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
}

.log-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1rem;
    color: white;
    font-weight: 600;
}

.log-icon.action-create {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.log-icon.action-delete {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.log-icon.action-update,
.log-icon.action-rename {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.log-icon.action-share {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.log-icon.action-upload {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.log-icon.action-view {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.log-icon.action-default {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.log-content {
    flex: 1;
    min-width: 0;
}

.log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.log-action {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    display: inline-block;
}

.log-action.action-create {
    background: rgba(16, 185, 129, 0.15);
    color: #047857;
}

.log-action.action-delete {
    background: rgba(239, 68, 68, 0.15);
    color: #991b1b;
}

.log-action.action-update,
.log-action.action-rename {
    background: rgba(59, 130, 246, 0.15);
    color: #1e40af;
}

.log-action.action-share {
    background: rgba(139, 92, 246, 0.15);
    color: #6d28d9;
}

.log-action.action-upload {
    background: rgba(245, 158, 11, 0.15);
    color: #92400e;
}

.log-action.action-view {
    background: rgba(99, 102, 241, 0.15);
    color: #4338ca;
}

.log-action.action-default {
    background: rgba(107, 114, 128, 0.15);
    color: #374151;
}

.log-time {
    font-size: 0.75rem;
    color: #9ca3af;
    white-space: nowrap;
}

.log-description {
    font-size: 0.875rem;
    color: #111827;
    line-height: 1.5;
    margin-bottom: 0.375rem;
    word-break: break-word;
}

.log-user {
    font-size: 0.75rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f3f4f6;
}

.user-avatar-mini {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
    flex-shrink: 0;
}

.user-name-text {
    font-weight: 500;
    color: #374151;
}

.log-connector {
    position: absolute;
    left: 20px;
    top: 60px;
    width: 2px;
    height: calc(100% - 20px);
    background: linear-gradient(to bottom, #e5e7eb, transparent);
}

.log-item:last-child .log-connector {
    display: none;
}
</style>