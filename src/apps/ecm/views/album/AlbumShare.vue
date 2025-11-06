<template>
    <div class="album-manage-container">
        <!-- Header trên cùng -->
        <div class="page-header">
            <!-- Phần bên trái: Navigation và Info -->
            <div class="header-left-section">
                <div class="breadcrumb-wrapper">
                    <button @click="rollbackPage" class="back-button" :disabled="pageList.length <= 0">
                        <i class="pi pi-chevron-left"></i>
                        <span>Quay lại</span>
                    </button>

                    <div class="breadcrumb" v-if="pathTree">
                        <span v-for="(segment, index) in breadcrumbSegments" :key="index" class="breadcrumb-item">
                            <span class="breadcrumb-segment">{{ segment }}</span>
                            <i v-if="index < breadcrumbSegments.length - 1"
                                class="pi pi-chevron-right breadcrumb-separator"></i>
                        </span>
                    </div>
                </div>

                <div class="page-title">
                    <i class="pi pi-folder"></i>
                    <span>{{ folderCurrent.name || 'Album được chia sẻ' }}</span>
                </div>

                <div class="header-info-row">
                    <!-- list user avatar -->
                    <div v-if="folderCurrent.permissionUsers?.sharedUsers?.length" class="user-avatar-group">
                        <AvatarGroup>
                            <Avatar
                                v-for="(user, i) in folderCurrent.permissionUsers.sharedUsers.slice(0, maxDisplayUsers)"
                                :key="i" :label="user.fullName" shape="circle" size="small"
                                style="background-color: var(--primary-color); color: white;" :title="user.fullName" />
                            <Avatar v-if="(folderCurrent.permissionUsers?.sharedUsers?.length - 3) > 0"
                                :label="(folderCurrent.permissionUsers?.sharedUsers?.length - 3)" shape="circle" />
                        </AvatarGroup>
                    </div>
                    <Button v-if="folderCurrent.owner" icon="pi pi-share-alt" rounded text severity="secondary"
                        size="small" label="Chia sẻ" @click="folderCurrent.owner ? showShareDialog = true : ''" />
                    <!-- share component -->
                    <Button_share v-if="folderCurrent.owner" v-model:visible="showShareDialog"
                        :selectedAlbum="folderCurrent" :item-id="folderCurrent?.id"
                        :item-name="folderCurrent?.name || ''" item-type="album" @update="handleUpdateData" />
                    <!-- view count -->
                    <CountcurrentUserView v-if="folderCurrent.id" :idfolder="folderCurrent.id" />
                </div>
            </div>

            <!-- Phần bên phải: Actions -->
            <div class="header-right-section">
                <div class="actions-group">
                    <div class="action-buttons">
                        <button v-if="canEdit" class="p-button-outlined create-album-btn"
                            @click="showDialogCreateAlbum = true">
                            + Tạo album
                        </button>
                        <Button_uploadFile_loader v-if="canEdit" @updateData="handleUpdateData"
                            :album="folderCurrent" />
                    </div>

                    <div class="sort-selector">
                        <label class="sort-label">Sắp xếp:</label>
                        <Dropdown v-model="sortType" :options="sortOptions" optionLabel="label" optionValue="value"
                            placeholder="Chọn kiểu sắp xếp" class="sort-dropdown" @change="handleSortChange" />
                    </div>
                </div>
            </div>

            <!-- Dialog tạo album -->
            <Dialog v-model:visible="showDialogCreateAlbum" modal header="Tạo folder" :style="{ width: '25rem' }">
                <div class="flex items-center gap-4 mb-4">
                    <InputText id="username" class="flex-auto" v-model="nameFolder" autocomplete="off"
                        placeholder="Nhập tên folder" />
                </div>

                <div class="flex justify-end gap-2">
                    <Button type="button" label="Thoát" severity="secondary" @click="showDialogCreateAlbum = false" />
                    <Button type="button" label="Tạo" @click="createAlbum" />
                </div>
            </Dialog>
        </div>

        <!-- Content area với tree và page -->
        <div class="content-wrapper">
            <!-- Tree bên trái -->
            <!-- <div class="tree-left">
                <AlbumTree v-if="showTree" />
            </div> -->

            <!-- Page content bên phải -->
            <div class="albums-page">
                <!-- List view -->
                <div class="album-list-wrap">
                    <div v-if="filteredAlbums.length > 0" class="album-list">
                        <div class="album-card" v-for="(album, index) in filteredAlbums" :key="album.id ?? index"
                            @click="openFolder(album.id)">
                            <AlbumCard @updateData="handleUpdateData" :album="album"
                                :default-image="defaultAlbumImage" />
                        </div>
                    </div>

                    <div v-if="photos?.length > 0" class="album-list">
                        <div class="album-card" v-for="(photo, index) in photos" :key="photo.id ?? index">
                            <FileCart @updateData="handleUpdateData" :photo="photo" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';

import AlbumCard from './template/cart/AlbumCart.vue';
import FileCart from './template/cart/FileCart.vue';
import {
    getFolderDetail,
    getFoldersByFolder,
    getPhotosByFolder,
    getAllFolderShareWithUser,
    getAllPhotosShareWithUser,
    postCreateFolder
} from './api/Album.js';
import { toastError } from '@/common/helpers/custom-toast-service';

import CountcurrentUserView from './template/CountcurrentUserView.vue';
import Button_uploadFile_loader from './template/button/Button_uploadFile_loader.vue';
import Button_share from './template/button/Button_share.vue';

// ---------- reactive state ----------
const maxDisplayUsers = ref(3);
const folderCurrent = ref({});
const folders = ref([]);
const photos = ref([]);
const pageList = ref([]);
const pathTree = ref('');
const showDialogCreateAlbum = ref(false);
const nameFolder = ref('');
const rootFolder = ref(null);
const showShareDialog = ref(false)

const defaultAlbumImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEaYTaC-q-QWUu2g7QgVvRKkJkqXjXtjBU2w&s';

const route = useRoute();
const router = useRouter();

const sortOptions = ref([
    { label: 'Tất cả', value: 'ALL' },
    // { label: 'Theo tên', value: 'NAME' },
    // { label: 'Ngày tạo', value: 'DATE_CREATED' },
    // { label: 'Ngày sửa', value: 'DATE_MODIFIED' }
])


const sortType = ref("ALL")

const handleSortChange = () => {
    handleUpdateData();
}


// Computed property để lấy parentIdParam từ route params một cách reactive
const parentIdParam = computed(() => route.params.idFolder);

const currentUserPermission = computed(() => {
    if (route.params.idFolder == undefined) {
        return "NONE"
    }
    // Nếu là owner (createdBy)
    if (folderCurrent.value.owner || folderCurrent.value.permissionStatus === 'OWNER') {
        return 'OWNER';
    }

    // // Check từ permissionUsers
    // if (folderCurrent.value.permissionUsers?.permissionStatus) {
    //     return folderCurrent.value.permissionUsers.permissionStatus;
    // }

    // Check từ permissionStatus
    if (folderCurrent.value.permissionStatus) {
        return folderCurrent.value.permissionStatus;
    }

    // Default: nếu không có permission info, có thể là owner
    return 'OWNER';
});
const canEdit = computed(() => {
    const permission = currentUserPermission.value;
    return permission === 'OWNER' || permission === 'EDIT';
});


// ---------- computed ----------
const filteredAlbums = computed(() => folders.value || []);

const breadcrumbSegments = computed(() => {
    if (!pathTree.value) return [];
    return pathTree.value.split('/').filter(p => p.length > 0);
});

// ---------- helpers ----------
function normalizePathForTree(path = '') {
    if (parentIdParam.value == undefined) {
        return ''
    }
    // cắt 4 segment đầu nếu path có dạng "/.../Album/User/{id}/..."
    const parts = path.split('/');
    if (parts.length <= 4) return path;
    return '/' + parts.slice(4).join('/');
}

async function fetchFolder(id) {
    try {
        const res = await getFolderDetail(id);
        folderCurrent.value = res.data || {};
        await fetchChildren(id);
        const photosRes = await getPhotosByFolder('ALL', id);
        photos.value = photosRes.data || [];
        pathTree.value = normalizePathForTree(folderCurrent.value.path || '');
    } catch (err) {
        console.error('fetchFolder error', err);
    }
}

async function fetchChildren(id) {
    try {
        const res = await getFoldersByFolder('ALL', id);
        folders.value = res.data || [];
        const photosRes = await getPhotosByFolder('ALL', id);
        photos.value = photosRes.data || [];
    } catch (err) {
        console.error('fetchChildren error', err);
    }
}

async function getFoldersShareWithUser() {
    try {
        const res = await getAllFolderShareWithUser();
        const photosRes = await getAllPhotosShareWithUser();
        photos.value = photosRes.data || [];
        folders.value = res.data || [];
    } catch (err) {
        console.error('getFoldersShareWithUser error', err);
    }
}

async function createAlbum() {
    try {
        const parentId = parentIdParam.value === undefined ? rootFolder.value?.id : parentIdParam.value;
        await postCreateFolder(nameFolder.value.trim(), parentId);
        showDialogCreateAlbum.value = false;
        nameFolder.value = '';
        await handleUpdateData();
    } catch (err) {
        console.error('createAlbum error', err);
        toastError({ message: 'Tạo folder thất bại' });
    }
}

async function handleUpdateData() {
    if (route.params.idFolder == undefined) {
        await getFoldersShareWithUser()

    } else {
        await fetchFolder(parentIdParam.value);
    }
}

function openFolder(id) {
    // Lưu folder hiện tại vào pageList trước khi chuyển
    // const currentFolderId = folderCurrent.value.id || parentIdParam.value;
    // if (currentFolderId && currentFolderId !== id) {
    //     pageList.value.push(parentIdParam.value);
    // }
    pageList.value.push(parentIdParam.value);
    console.log("pagelist open", pageList.value)
    router.replace({ name: 'EcmAlbumSharedDetail', params: { idFolder: id } }).then(() => fetchFolder(id));
}

function rollbackPage() {

    // Nếu đang ở root folder và không có pageList, không làm gì
    if (!route.params.idFolder && !pageList.value.length) {
        return;
    }

    // Nếu có pageList, quay về folder trước đó
    if (pageList.value.length > 0) {
        const previousFolderId = pageList.value.pop();
        if (previousFolderId) {
            router.replace({ name: 'EcmAlbumSharedDetail', params: { idFolder: previousFolderId } }).then(() => fetchFolder(previousFolderId));
            return;
        }
    }

    // Nếu không có pageList nhưng đang ở folder con, về root
    if (route.params.idFolder) {
        router.replace({ name: 'AlbumShared' }).then(() => () => handleUpdateData());
        pageList.value = [];
        pathTree.value = normalizePathForTree('')
        folderCurrent.value = false
    }
    console.log("back page ", pageList.value)
}

// ---------- watch route params changes ----------
watch(() => route.params.idFolder, (newId, oldId) => {
    // Chỉ fetch lại data khi idFolder thay đổi
    if (newId !== oldId) {
        handleUpdateData();
    }
});

// Watch route name để reset pageList khi về root
watch(() => route.name, (newName, oldName) => {
    // Chỉ reset pageList khi thực sự navigate về root từ một route khác
    if (newName === 'AlbumShared' && oldName && oldName !== 'AlbumShared') {
        pageList.value = [];
        handleUpdateData();
    }
});

// ---------- lifecycle ----------
onMounted(() => {
    handleUpdateData();
});
</script>

<style scoped>
/* Container chính - full viewport height, không scroll */
.album-manage-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
}

/* Header trên cùng - fixed height */
.page-header {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.25rem;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
    align-items: flex-start;
    overflow: visible;
}

/* Phần bên trái: Navigation và Info */
.header-left-section {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

/* Phần bên phải: Actions */
.header-right-section {
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    height: 100%;
}

.actions-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
    justify-content: space-between;

}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.header-info-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Content wrapper - chiếm phần còn lại, flex row */
.content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
    /* Quan trọng để flex child có thể scroll */
}

/* Tree bên trái - fixed width, có scroll riêng */
.tree-left {
    width: 300px;
    flex-shrink: 0;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid #e5e7eb;
    background-color: var(--surface-c);
}

/* Albums page bên phải - chiếm phần còn lại, có scroll riêng */
.albums-page {
    flex: 1;
    padding: 1.25rem;
    color: #222;
    overflow-y: auto;
    overflow-x: hidden;
    min-width: 0;
    /* Quan trọng để flex child có thể scroll */
}


.page-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d2d2d;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
}


.user-avatar-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}


.album-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.breadcrumb-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    color: #374151;
    font-weight: 500;
    font-size: 14px;
    padding: 8px 12px;
    transition: all 0.2s ease;
}

.back-button:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #111827;
}

.back-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.breadcrumb-segment {
    color: #6b7280;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 6px;
    background: #f3f4f6;
}

.breadcrumb-separator {
    font-size: 12px;
    color: #9ca3af;
}

.album-card {
    padding: 5px;
    border-radius: 10px;
}

.album-card:hover {
    box-shadow: #6c5ce733 0px 4px 20px;
}

.create-album-btn {
    white-space: nowrap;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.create-album-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.sort-selector {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sort-label {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
    white-space: nowrap;
}

.sort-dropdown {
    min-width: 180px;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: 1rem;
    }

    .header-right-section {
        width: 100%;
    }

    .actions-group {
        width: 100%;
        align-items: stretch;
        height: 100%;


    }

    .action-buttons {
        width: 100%;
        justify-content: flex-start;
    }

    .sort-selector {
        width: 100%;
    }

    .sort-dropdown {
        flex: 1;
        min-width: unset;
    }

    .content-wrapper {
        flex-direction: column;
    }

    .tree-left {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid #e5e7eb;
    }

    .albums-page {
        flex: 1;
    }
}
</style>
