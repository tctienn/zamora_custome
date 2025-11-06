<template>
    <!-- Album card -->
    <div class="album-card">
        <!-- Card title -->
        <div class="card-title">
            <div class="title-left">
                <div class="album-title truncate-no-width">{{ album.name }}</div>
                <!-- <div class="album-meta">{{ album.countImage }} ảnh</div> -->
            </div>

            <div class="menu-wrap" @click.stop v-if="album.permissionStatus || album.owner">
                <button class="icon-btn" @click.stop="toggleMenu" title="Tùy chọn album">
                    •••
                </button>

                <div v-if="openMenu" class="album-menu" @click.stop>
                    <ul>
                        <li @click="openDetail">Xem chi tiết</li>
                        <li v-if="canEditAlbum" @click="openEdit">Sửa</li>
                        <li v-if="canEditAlbum" @click="openShare">Chia sẻ</li>
                        <li v-if="canDeleteAlbum" class="danger" @click="deleteHandle">Xóa</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Card body -->
        <div class="card-body">
            <div class="cover-wrap" @click="toggleMenu">
                <div class="album-cover">
                    <div class="album-icon">
                        <i class="pi pi-folder" style="font-size: 3rem;"></i>
                    </div>
                    <div class="album-icon-shadow"></div>
                </div>

                <div v-if="album.isShared" class="badge shared">
                    <i class="pi pi-share-alt" style="margin-right: 4px;"></i>
                    Đã chia sẻ
                </div>

                <div v-if="album.owner" class="permission-badge permission-edit">
                    <i class="pi" :class="{
                        'pi-pencil': album.permissionStatus === 'EDIT',
                        'pi-eye': album.permissionStatus === 'VIEW',
                        'pi-star': album.permissionStatus === 'OWNER'
                    }"></i>
                    OWNER
                    <!-- đăy là điều keienj nếu như là owner <div class="permission-badge" không cần hiên thị nếu là owner -->
                </div>
                <div class="permission-badge" :class="{
                    'permission-edit': album.permissionStatus === 'EDIT',
                    'permission-view': album.permissionStatus === 'VIEW',
                    'permission-owner': album.permissionStatus === 'OWNER'
                }" v-if="!album.owner">
                    <i class="pi" :class="{
                        'pi-pencil': album.permissionStatus === 'EDIT',
                        'pi-eye': album.permissionStatus === 'VIEW',
                        'pi-star': album.permissionStatus === 'OWNER'
                    }">
                    </i>
                    {{ album.permissionStatus }}
                </div>

                <div class="image-count-badge">
                    <i class="pi pi-image"></i>
                    <span>{{ album.countImage }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Folder Dialog -->
    <Dialog v-model:visible="showEditDialog" modal :style="{ width: '28rem' }" :dismissableMask="true">
        <template #header>
            <div class="flex align-items-center gap-2">
                <i class="pi pi-pencil" style="font-size: 1.25rem; color: #6c5ce7;"></i>
                <span style="font-weight: 600; font-size: 1.125rem;">Đổi tên Folder</span>
            </div>
        </template>

        <div class="edit-folder-dialog">
            <div class="field mb-4">
                <label for="folderName" class="field-label">Tên folder</label>
                <InputText id="folderName" v-model="nameFolder" placeholder="Nhập tên folder mới" class="w-full"
                    :class="{ 'p-invalid': !nameFolder || nameFolder.trim() === '' }" autofocus
                    @keyup.enter="handleEditFolder" />
                <small v-if="!nameFolder || nameFolder.trim() === ''" class="p-error">
                    Vui lòng nhập tên folder
                </small>
            </div>
        </div>

        <template #footer>
            <Button label="Hủy" severity="secondary" outlined @click="showEditDialog = false" />
            <Button label="Lưu" @click="handleEditFolder" :disabled="!nameFolder || nameFolder.trim() === ''" />
        </template>
    </Dialog>


    <!-- Share Dialog -->
    <Button_share v-model:visible="showShareDialog" :selectedAlbum="selectedAlbum" :item-id="selectedAlbum?.id"
        :item-name="selectedAlbum?.name || ''" item-type="album" @update="handleUpdate" />

    <!-- Detail Viewer Dialog -->
    <DetailViewer v-model:visible="showDetailDialog" :item="selectedAlbum" item-type="folder"
        @hide-dialog="showDetailDialog = false" />

    <!-- Permission Dialog -->
    <!-- <Dialog v-model:visible="showPermissionDialog" modal header="Phân quyền người dùng" :style="{ width: '22rem' }">
        <div class="modal" role="dialog" aria-modal="true">
            <h3 class="mb-2">Phân quyền cho:</h3>
            <div class="font-semibold mb-4">{{ selectedUser?.name }} ({{ selectedUser?.email }})</div>

            <select v-model="selectedPermission" class="w-full">
                <option v-for="opt in permissionOptions" :key="opt.code" :value="opt.code">
                    {{ opt.name }}
                </option>
            </select>

            <div class="flex justify-end gap-2 mt-4">
                <button class="btn-secondary" @click="showPermissionDialog = false">Thoát</button>
                <button @click="handleConfirmPermission">Xác nhận</button>
            </div>
        </div>
    </Dialog> -->
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { deleteFolder, postChangeNameFolder } from '@/apps/ecm/views/album/api/Album.js'
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service'
import Button_share from '../button/Button_share.vue'
import DetailViewer from '../viewer/DetailViewer.vue'

const emit = defineEmits(['updateData'])

const props = defineProps({
    album: { type: Object, required: false },
    defaultImage: {
        type: String,
        required: false,
        default:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEaYTaC-q-QWUu2g7QgVvRKkJkqXjXtjBU2w&s'
    }
})

/**
 * Get current user permission for the album
 */
const currentAlbumPermission = computed(() => {
    // Nếu là owner
    if (props.album?.owner) {
        return 'OWNER';
    }

    // Check từ permissionStatus
    if (props.album?.permissionStatus) {
        return props.album.permissionStatus;
    }

    // Default: nếu không có permission info, có thể là owner
    return 'OWNER';
})

/**
 * Check if user can edit (OWNER or EDIT)
 */
const canEditAlbum = computed(() => {
    const permission = currentAlbumPermission.value;
    return permission === 'OWNER' || permission === 'EDIT';
});

/**
 * Check if user can delete (only OWNER)
 */
const canDeleteAlbum = computed(() => {
    return currentAlbumPermission.value === 'OWNER';
});

const showEditDialog = ref(false)
const showShareDialog = ref(false)
const showDetailDialog = ref(false)

const selectedAlbum = ref(null)
const openMenu = ref(false)
const nameFolder = ref('')

// Toggle menu
const toggleMenu = () => {
    openMenu.value = !openMenu.value
    if (openMenu.value) window.addEventListener('click', onWindowClick)
    else window.removeEventListener('click', onWindowClick)
}
const onWindowClick = () => {
    openMenu.value = false
    window.removeEventListener('click', onWindowClick)
}

const openDetail = () => {
    openMenu.value = false
    selectedAlbum.value = props.album
    showDetailDialog.value = true
}

const openEdit = () => {
    openMenu.value = false
    nameFolder.value = props.album.name || ''
    showEditDialog.value = true
}

const handleEditFolder = async () => {
    if (!nameFolder.value || nameFolder.value.trim() === '') {
        toastError({ message: 'Vui lòng nhập tên folder' })
        return
    }

    if (nameFolder.value.trim() === props.album.name) {
        showEditDialog.value = false
        return
    }

    try {
        await postChangeNameFolder(props.album.id, nameFolder.value.trim())
        toastSuccess({ message: 'Đổi tên folder thành công' })
        emit('updateData')
        showEditDialog.value = false
        nameFolder.value = ''
    } catch (err) {
        toastError({ message: 'Lỗi khi đổi tên folder: ' + (err.message || err) })
    }
}

// Mở dialog chia sẻ
const openShare = () => {
    selectedAlbum.value = props.album
    showShareDialog.value = true
}

// Xử lý sau khi share thành công
const handleUpdate = () => {
    emit('updateData')
}

const deleteHandle = async () => {
    await deleteFolder(props.album.id).then(() => emit('updateData'))
}

onBeforeUnmount(() => {
    window.removeEventListener('click', onWindowClick)
})
</script>

<style scoped>
.card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: white;
    /* border: solid 1px black; */
}

.title-left {
    display: flex;
    flex-direction: column;
    /* border: solid 1px black; */
    width: 70%;
}

.album-title {
    font-weight: 700;
    font-size: 1rem;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;


}

.album-meta {
    font-size: 0.78rem;
    color: #6b7280;
    margin-top: 2px;
}

.menu-wrap {
    position: relative;
}

.album-menu {
    position: absolute;
    right: 0;
    top: 34px;
    background: white;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
    border-radius: 8px;
    min-width: 160px;
    z-index: 30;
}

.album-menu ul {
    list-style: none;
    margin: 0;
    padding: 6px 0;
}

.album-menu li {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 0.95rem;
    color: #111827;
}

.album-menu li:hover {
    background: rgba(15, 23, 42, 0.03);
}

.album-menu li.danger {
    color: #dc2626;
}

.icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    display: block;
}

.album-card:hover .icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    display: block;

}

.cover-wrap {
    position: relative;
    border-radius: 0;
    overflow: hidden;
    margin-top: 0;
    /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
    min-height: 180px;
    cursor: pointer;
}

.card-body {
    padding: 0;
}

.album-cover {
    width: 100%;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
}

.badge.shared {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(34, 197, 94, 0.95);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
}

.album-icon {
    position: relative;
    z-index: 2;
    color: rgb(207, 188, 10);
    /* text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); */
    animation: float 3s ease-in-out infinite;
}

.album-icon-shadow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1.2);
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    filter: blur(20px);
    animation: pulse-shadow 2s ease-in-out infinite;
}

/* @keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }
}

@keyframes pulse-shadow {

    0%,
    100% {
        opacity: 0.5;
        transform: translate(-50%, -50%) scale(1);
    }

    50% {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(1.1);
    }
} */

.permission-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    z-index: 10;
    backdrop-filter: blur(10px);
}

.permission-edit {
    background: rgba(34, 197, 94, 0.9);
    color: white;
}

.permission-view {
    background: rgba(255, 193, 7, 0.9);
    color: #856404;
}

.permission-owner {
    background: rgba(220, 53, 69, 0.9);
    color: white;
}

.image-count-badge {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    z-index: 10;
}

.album-card {
    border-radius: 12px;
    background: white;
    transition: all 0.3s ease;
    overflow: hidden;
    cursor: pointer;
}

.album-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

ul {
    padding: 0;
}

.album-item {
    display: flex;
    justify-content: space-between;
    padding: 14px;
    border: solid 1px #ccc;
    border-radius: 6px;
    margin-bottom: 8px;
    align-items: center;
}

.edit-folder-dialog {
    padding: 0.5rem 0;
}

.field-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
    font-size: 0.875rem;
}

.field {
    margin-bottom: 1rem;
}

:deep(.p-inputtext) {
    width: 100%;
}

:deep(.p-dialog-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 1rem;
}

.truncate-no-width {
    /* Không giới hạn width, nó sẽ chiếm 100% chiều rộng của trình duyệt */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* width: 80%; */
}
</style>
