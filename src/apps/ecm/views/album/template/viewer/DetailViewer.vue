<template>
  <Sidebar
    :visible="visible"
    :header="header"
    position="right"
    :style="{ width: '600px' }"
    :dismissable="false"
    @hide="emits('hide-dialog')">
    
    <template #header>
      <div class="align-items-center flex justify-content-between w-full">
        <div class="align-items-center flex gap-2 p-sidebar-header-content">
          <Button
            class="border-round-sm px-0"
            icon="pi pi-arrow-left"
            severity="secondary"
            text
            style="width: 30px; height: 30px;"
            @click="emits('hide-dialog')" />
          <span style="font-weight: 600;">{{ header }}</span>
        </div>
      </div>
    </template>

    <div class="detail-viewer" v-if="item">
      <div class="detail-section">
        <div class="section-title">
          <i class="pi pi-folder-open" style="margin-right: 8px; color: #6c5ce7;"></i>
          Thông tin {{ itemType === 'folder' ? 'folder' : 'file' }}
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="label">{{ itemType === 'folder' ? 'Tên folder' : 'Tên file' }}:</span>
            <span class="value">{{ itemType === 'folder' ? item.name : item.filename }}</span>
          </div>

          <div class="info-item" v-if="itemType === 'folder' && item.countImage">
            <span class="label">Số ảnh:</span>
            <span class="value">{{ item.countImage }}</span>
          </div>

          <div class="info-item" v-if="item.createdAt">
            <span class="label">Ngày tạo:</span>
            <span class="value">{{ formatDate(item.createdAt) }}</span>
          </div>

          <div class="info-item" v-if="item.updatedAt">
            <span class="label">Ngày cập nhật:</span>
            <span class="value">{{ formatDate(item.updatedAt) }}</span>
          </div>

          <div class="info-item" v-if="item.size">
            <span class="label">Kích thước:</span>
            <span class="value">{{ formatFileSize(item.size) }}</span>
          </div>

          <div class="info-item" v-if="itemType === 'file' && item.mimeType">
            <span class="label">Loại file:</span>
            <span class="value">{{ item.mimeType }}</span>
          </div>

          <div class="info-item" v-if="item.path">
            <span class="label">Đường dẫn:</span>
            <span class="value path">{{ item.path }}</span>
          </div>
        </div>
      </div>

      <!-- Quyền và chia sẻ -->
      <div class="detail-section" v-if="item.permissionStatus || item.isShared">
        <div class="section-title">
          <i class="pi pi-shield" style="margin-right: 8px; color: #6c5ce7;"></i>
          Quyền và chia sẻ
        </div>

        <div class="info-grid">
          <div class="info-item" v-if="item.permissionStatus">
            <span class="label">Quyền truy cập:</span>
            <span class="value badge-permission" 
                  :class="{
                    'permission-owner': item.permissionStatus === 'OWNER',
                    'permission-edit': item.permissionStatus === 'EDIT',
                    'permission-view': item.permissionStatus === 'VIEW'
                  }">
              <i class="pi" 
                 :class="{
                   'pi-star': item.permissionStatus === 'OWNER',
                   'pi-pencil': item.permissionStatus === 'EDIT',
                   'pi-eye': item.permissionStatus === 'VIEW'
                 }"
                 style="font-size: 0.875rem;">
              </i>
              {{ item.permissionStatus }}
            </span>
          </div>

          <div class="info-item" v-if="item.isShared">
            <span class="label">Trạng thái chia sẻ:</span>
            <span class="value badge-shared">
              <i class="pi pi-share-alt" style="margin-right: 4px;"></i>
              Đã chia sẻ
            </span>
          </div>

          <div class="info-item" v-if="item.permissionUsers?.sharedUsers?.length">
            <span class="label">Chia sẻ với {{ item.permissionUsers.sharedUsers.length }} người:</span>
            <div class="shared-users-list">
              <div 
                v-for="(user, index) in item.permissionUsers.sharedUsers" 
                :key="index"
                class="shared-user-item"
              >
                <div class="user-avatar-small">
                  <i class="pi pi-user"></i>
                </div>
                <div class="user-info">
                  <div class="user-name-small">{{ user.fullName || user.name }}</div>
                  <div class="user-permission-badge" 
                       :class="{
                         'perm-view': user.permission === 'VIEW',
                         'perm-edit': user.permission === 'EDIT'
                       }">
                    {{ user.permission }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview cho file ảnh -->
      <div class="detail-section" v-if="itemType === 'file' && isImage">
        <div class="section-title">
          <i class="pi pi-image" style="margin-right: 8px; color: #6c5ce7;"></i>
          Xem trước
        </div>
        <div class="image-preview">
          <img :src="urlImage + item.treePath" alt="Preview" />
        </div>
      </div>
    </div>

    <div v-else class="detail-viewer empty-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6c5ce7;"></i>
      <p>Đang tải thông tin...</p>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import { urlImage } from '../../api/Album.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  },
  itemType: {
    type: String,
    default: 'folder' // 'folder' or 'file'
  }
})

const emits = defineEmits(['hide-dialog'])

const header = computed(() => {
  if (!props.item) return 'Chi tiết'
  return props.itemType === 'folder' 
    ? props.item.name || 'Chi tiết folder'
    : props.item.filename || 'Chi tiết file'
})

const isImage = computed(() => {
  if (!props.item || props.itemType !== 'file') return false
  const filename = props.item.filename || ''
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
})

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatFileSize(bytes) {
  if (!bytes) return 'N/A'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.detail-viewer {
  padding: 1rem 0;
  height: calc(100vh - 100px);
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  color: #6b7280;
}

.detail-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.value {
  font-size: 0.95rem;
  color: #111827;
  word-break: break-word;
}

.value.path {
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.badge-permission,
.badge-shared {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  max-width: fit-content;
}

.badge-permission.permission-owner {
  background: rgba(220, 53, 69, 0.15);
  color: #991b1b;
}

.badge-permission.permission-edit {
  background: rgba(34, 197, 94, 0.15);
  color: #166534;
}

.badge-permission.permission-view {
  background: rgba(255, 193, 7, 0.15);
  color: #856404;
}

.badge-shared {
  background: rgba(34, 197, 94, 0.15);
  color: #166534;
}

.shared-users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.shared-user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name-small {
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
}

.user-permission-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  max-width: fit-content;
}

.user-permission-badge.perm-view {
  background: rgba(255, 193, 7, 0.15);
  color: #856404;
}

.user-permission-badge.perm-edit {
  background: rgba(34, 197, 94, 0.15);
  color: #166534;
}

.image-preview {
  width: 100%;
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

/* Scrollbar styling */
.detail-viewer::-webkit-scrollbar {
  width: 8px;
}

.detail-viewer::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.detail-viewer::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.detail-viewer::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
