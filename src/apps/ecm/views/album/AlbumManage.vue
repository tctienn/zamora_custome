<template>
    <div class="album-manage-container">
        <!-- Floating fixed button -->
        <button class="butonFix" @click="showDialog = true">+</button>

        <!-- Dialog giả lập cookie -->
        <div v-if="showDialog" class="modal-backdrop">
            <div class="modal" role="dialog">
                <h3 class="modal-title">Giả lập cookie lúc đăng nhập</h3>
                <input v-model="tempUserId" type="text" class="text-input" placeholder="Nhập user id" />
                <div class="modal-actions">
                    <button class="btn-cancel" @click="showDialog = false">Hủy</button>
                    <button class="btn-confirm" @click="confirmCreateCookie">Xác nhận</button>
                </div>
            </div>
        </div>


        <!-- Header trên cùng -->
        <div class="page-header">
            <div class="">
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

                <div class="page-title" @click="goRoot">
                    <i class="pi pi-folder"></i>
                    <span>{{ folderCurrent.name }}</span>
                </div>

                <!-- mode switch -->
                <div class="album-list-header">
                    <div class="header-left-group">
                        <button :class="['mode-btn', { active: albumMode === 'all' }]"
                            @click="changeAlbumMode('all')">Tất
                            cả</button>
                        <button :class="['mode-btn', { active: albumMode === 'shared' }]"
                            @click="changeAlbumMode('shared')">Chia
                            sẻ</button>


                        <!-- list user avatar -->
                        <div v-if="folderCurrent.permissionUsers?.sharedUsers?.length" class="user-avatar-group">
                            <AvatarGroup @click="showShareDialog = true">
                                <AppAvatar
                                    v-for="(user, i) in folderCurrent.permissionUsers.sharedUsers.slice(0, maxDisplayUsers)"
                                    :key="i" :avatar='generateAvatarUrl(user.avatar)' :label='user.fullName'
                                    shape='circle' size='2.0' />

                                <!-- <Avatar
                                    v-for="(user, i) in folderCurrent.permissionUsers.sharedUsers.slice(0, maxDisplayUsers)"
                                    :key="i" :label="getUserInitials(user.fullName || user.name)" shape="circle"
                                    size="small" style="background-color: var(--primary-color); color: white;"
                                    :title="user.fullName" /> -->
                                <Avatar v-if="(folderCurrent.permissionUsers?.sharedUsers?.length - 3) > 0"
                                    :label="(folderCurrent.permissionUsers?.sharedUsers?.length - 3)" shape="circle" />

                            </AvatarGroup>
                            <!-- <Avatar @click="showShareDialog = true" style="cursor:'pointer'"  :label="'+'" shape="circle" /> -->


                        </div>
                        <Button v-if="folderCurrent.owner" icon="pi pi-share-alt" rounded text severity="secondary"
                            size="small" label="Chia sẻ" @click="folderCurrent.owner ? showShareDialog = true : ''" />

                        <!-- share component -->
                        <Button_share v-if="folderCurrent.owner" v-model:visible="showShareDialog"
                            :selectedAlbum="folderCurrent" :item-id="folderCurrent?.id"
                            :item-name="folderCurrent?.name || ''" item-type="album" @update="handleUpdateData" />
                    </div>

                </div>
                <!-- view count -->
                <CountcurrentUserView :idfolder="folderCurrent.id" />
                <!-- <p class="subtle">{{ filteredAlbums.length }} album</p> -->

                <!-- <div v-if="folderCurrent.permissionUsers?.sharedUsers?.length" class="shared-users-section">
                    
                    <div class="shared-users-header" @click="showUserList = !showUserList">
                        <div class="header-left">
                            <i class="pi pi-users"></i>
                            <span>Đang chia sẻ với</span>
                            <span class="user-count">{{ folderCurrent.permissionUsers.sharedUsers.length }}
                                người</span>
                        </div>
                        <i class="pi" :class="showUserList ? 'pi-chevron-up' : 'pi-chevron-down'"
                            style="color: #6c5ce7; font-size: 14px;">
                        </i>
                    </div>

                    <transition name="slide-fade">
                        <div v-show="showUserList" class="listUser">
                            <div v-for="(user, i) in folderCurrent.permissionUsers.sharedUsers.slice(0, maxDisplayUsers)"
                                :key="i" class="userItem">
                                <div class="user-avatar">
                                    <i class="pi pi-user"></i>
                                </div>
                                <div class="user-info">
                                    <div class="user-name">{{ user.fullName }}</div>
                                    <div class="user-permission" :class="{
                                        'permission-view': user.permission === 'VIEW',
                                        'permission-edit': user.permission === 'EDIT',
                                        'permission-none': user.permission === 'NONE'
                                    }">
                                        <i class="pi" :class="{
                                            'pi-eye': user.permission === 'VIEW',
                                            'pi-pencil': user.permission === 'EDIT',
                                            'pi-times': user.permission === 'NONE'
                                        }">
                                        </i>
                                        <span>{{ user.permission }}</span>
                                    </div>
                                </div>
                            </div>

                            <button v-if="folderCurrent.permissionUsers.sharedUsers.length > maxDisplayUsers"
                                class="view-more-btn" @click="showUserShareButton = true">
                                <i class="pi pi-cog"></i>
                                <span>Xem tất cả và quản lý</span>
                            </button>
                            <button v-else class="view-more-btn" @click="showUserShareButton = true">
                                <i class="pi pi-cog"></i>
                                <span>Quản lý quyền</span>
                            </button>
                        </div>
                    </transition>

                    <Dialog v-if="folderCurrent.permissionUsers" v-model:visible="showUserShareButton" modal
                        header="Quản lý quyền chia sẻ" :style="{ width: '35rem' }">
                        <template #header>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="pi pi-users" style="font-size: 1.25rem;"></i>
                                <span>Quản lý quyền chia sẻ</span>
                            </div>
                        </template>

<div class="user-permissions-list">
    <div v-for="(user, i) in folderCurrent.permissionUsers.sharedUsers" :key="i" class="permission-row">
        <div class="user-details">
            <div class="user-avatar-small">
                <i class="pi pi-user"></i>
            </div>
            <div>
                <div class="user-name-bold">{{ user.fullName }}</div>
                <div class="user-email">{{ user.email }}</div>
            </div>
        </div>
        <Dropdown v-model="user.permission" :options="permissionOptions" option-label="label" option-value="value"
            class="permission-dropdown" />
    </div>
</div>

<template #footer>
                            <Button label="Xóa chia sẻ" severity="danger" @click="handleDeleteCurrentFolderShare" />
                            <div style="flex: 1;"></div>
                            <Button label="Hủy" severity="secondary" @click="showUserShareButton = false" />
                            <Button label="Lưu" @click="handleUpdatePermission" />
                        </template>
</Dialog>
</div> -->
            </div>

            <div class="actions">
                <div>
                    <button v-if="canCreateFolder" class="p-button-outlined create-album-btn"
                        @click="showDialogCreateAlbum = true">
                        + Tạo album
                    </button>
                    <!-- <Button_uploadFile 
                        v-if="canUpload"
                        @updateData="handleUpdateData" 
                        :album="folderCurrent" 
                    /> -->
                    <Button_uploadFile_loader v-if="canUpload" @updateData="handleUpdateData" :album="folderCurrent" />

                    <Dialog v-model:visible="showDialogCreateAlbum" modal header="Tạo folder"
                        :style="{ width: '25rem' }">
                        <div class="flex items-center gap-4 mb-4">
                            <InputText id="username" class="flex-auto" v-model="nameFolder" autocomplete="off"
                                placeholder="Nhập tên folder" />
                        </div>

                        <div class="flex justify-end gap-2">
                            <Button type="button" label="Thoát" severity="secondary"
                                @click="showDialogCreateAlbum = false" />
                            <Button type="button" label="Tạo" @click="createAlbum" />
                        </div>
                    </Dialog>
                </div>

                <div class="sort-selector">
                    <label class="sort-label">Sắp xếp:</label>
                    <Dropdown v-model="sortType" :options="sortOptions" optionLabel="label" optionValue="value"
                        placeholder="Chọn kiểu sắp xếp" class="sort-dropdown" @change="handleSortChange" />
                </div>
            </div>

        </div>

        <!-- Content area với tree và page -->
        <div class="content-wrapper">
            <!-- Tree bên trái -->
            <div class="tree-left">
                <AlbumTree />
            </div>

            <!-- Page content bên phải -->
            <div class="albums-page">


                <!-- List view -->
                <div v-if="viewMode === 'list'" class="album-list-wrap">
                    <div v-if="filteredAlbums.length >= 0" class="album-list">
                        <div class="album-card" v-for="(album, index) in filteredAlbums" :key="album.id ?? index"
                            @click="openFolder(album.id)">
                            <AlbumCard @updateData="handleUpdateData" :album="album"
                                :default-image="defaultAlbumImage" />
                        </div>
                    </div>

                    <div v-if="photos?.length >= 0" class="album-list">
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
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Dropdown from 'primevue/dropdown';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';

import AlbumCard from './template/cart/AlbumCart.vue';
import FileCart from './template/cart/FileCart.vue';
import Button_uploadFile from './template/button/Button_uploadFile.vue';
import Button_uploadFile_loader from './template/button/Button_uploadFile_loader.vue';



// const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});

import { taocock } from './api/CookieFuntion.js';
import {
    getFolderRoot,
    getFoldersByFolder,
    postCreateFolder,
    getFolderDetail,
    getPhotosByFolder,
    getAllFolderShareWithUser,
    postCreateAndUpadateShare,
    DeletePermission,
    getAllPhotosShareWithUser
} from './api/Album.js';

import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import CountcurrentUserView from './template/CountcurrentUserView.vue';
import AlbumTree from './template/tree/AlbumTree.vue';
import Button_share from './template/button/Button_share.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

// ALL,  NAME,  DATE_CREATED,  DATE_MODIFIED,
const sortType = ref("ALL")

// ---------- reactive state ----------
const showDialog = ref(false);
const tempUserId = ref('');
const showDialogCreateAlbum = ref(false);
const showUserList = ref(false);
const maxDisplayUsers = ref(3);

const rootFolder = ref(null);
const folderCurrent = ref({});
const folders = ref([]);
const photos = ref([]);
const userList = ref([]);

const showShareDialog = ref(false)

const nameFolder = ref('');
const viewMode = ref('list');
const albumMode = ref('all');
const pageList = ref([]);
const showUserShareButton = ref(false);

const defaultAlbumImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEaYTaC-q-QWUu2g7QgVvRKkJkqXjXtjBU2w&s';

const route = useRoute();
const router = useRouter();

// Computed property để lấy parentIdParam từ route params một cách reactive
const parentIdParam = computed(() => route.params.idFolder);

// ---------- computed ----------
const filteredAlbums = computed(() => folders.value || []);
const pathTree = ref('');

const breadcrumbSegments = computed(() => {
    if (!pathTree.value) return [];
    return pathTree.value.split('/').filter(p => p.length > 0);
});

const canGoBack = computed(() => {
    // Có thể quay lại nếu:
    // 1. Có folder trong pageList, HOẶC
    // 2. Đang ở trong một folder con (không phải root)
    const canBack = pageList.value.length > 0 || (route.params.idFolder && route.params.idFolder !== undefined);

    // Debug log để theo dõi
    console.log('canGoBack debug:', {
        pageListLength: pageList.value.length,
        currentFolderId: route.params.idFolder,
        folderCurrentId: folderCurrent.value.id,
        canBack: canBack,
        pageList: [...pageList.value]
    });

    return canBack;
});

/**
 * Get current user permission for the folder
 */
const currentUserPermission = computed(() => {
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

/**
 * Check if user can edit (OWNER or EDIT)
 */
const canEdit = computed(() => {
    const permission = currentUserPermission.value;
    return permission === 'OWNER' || permission === 'EDIT';
});

/**
 * Check if user can view (all permissions allow viewing)
 */
const canView = computed(() => {
    const permission = currentUserPermission.value;
    return permission === 'OWNER' || permission === 'EDIT' || permission === 'VIEW';
});

/**
 * Check if user can create folder (OWNER or EDIT)
 */
const canCreateFolder = computed(() => {
    return canEdit.value;
});

/**
 * Check if user can upload (OWNER or EDIT)
 */
const canUpload = computed(() => {
    return canEdit.value;
});

/**
 * Check if user can delete (only OWNER)
 */
const canDelete = computed(() => {
    return currentUserPermission.value === 'OWNER';
});

const permissionOptions = [
    { label: 'Xem (VIEW)', value: 'VIEW' },
    { label: 'Chỉnh sửa (EDIT)', value: 'EDIT' },
    { label: 'Không (NONE)', value: 'NONE' }
];

const sortOptions = ref([
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Theo tên', value: 'NAME' },
    { label: 'Ngày tạo', value: 'DATE_CREATED' },
    { label: 'Ngày sửa', value: 'DATE_MODIFIED' }
])

// ---------- helpers ----------
/**
 * Get user initials from full name
 */
function getUserInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function confirmCreateCookie() {
    if (!tempUserId.value.trim()) {
        toastError({ message: 'Vui lòng nhập user id' });
        return;
    }
    taocock('userDetail', { id_user: tempUserId.value.trim(), usename: tempUserId.value.trim() });
    showDialog.value = false;
}

function normalizePathForTree(path = '') {
    // cắt 4 segment đầu nếu path có dạng "/.../Album/User/{id}/..."
    const parts = path.split('/');
    if (parts.length <= 4) return path;
    return '/' + parts.slice(4).join('/');
}

const fetchRootFolder = async () => {
    try {
        const res = await getFolderRoot();
        rootFolder.value = res.data;
        folderCurrent.value = res.data || {};
        pathTree.value = normalizePathForTree(res.data.path || '');

        if (rootFolder.value?.id != undefined) {
            await fetchChildren(rootFolder.value.id);
        }
    } catch (err) {
        console.error('fetchRootFolder error', err);
    }
}

async function fetchFolder(id) {
    try {
        const res = await getFolderDetail(id);
        folderCurrent.value = res.data || {};
        console.log('curran folder :', res.data)
        await fetchChildren(id);
        const photosRes = await getPhotosByFolder(sortType.value, id);
        photos.value = photosRes.data || [];
        pathTree.value = normalizePathForTree(folderCurrent.value.path || '');
    } catch (err) {
        console.error('fetchFolder error', err);
    }
}

async function fetchChildren(id) {
    console.log('ssssssss', id)
    try {
        const res = await getFoldersByFolder(sortType.value, id);
        folders.value = res.data || [];
        const photosRes = await getPhotosByFolder(sortType.value, id);
        photos.value = photosRes.data || [];
        console.log("folders: ", res.data)
    } catch (err) {
        console.error('fetchChildren error', err);
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

async function getFoldersShareWithUser() {
    try {
        const res = await getAllFolderShareWithUser();
        const photosRes = await getAllPhotosShareWithUser();
        photos.value = photosRes.data || [];
        console.log("phoro share", photosRes)
        folders.value = res.data || [];
        // photos.value = [];
    } catch (err) {
        console.error('getFoldersShareWithUser error', err);
    }
}

async function handleUpdatePermission() {
    try {
        const sharedUsers = (folderCurrent.value.permissionUsers?.sharedUsers || []).filter(e => e.permission !== 'NONE');
        const fileFolderId = folderCurrent.value.permissionUsers?.fileFolderId;
        const visibility = folderCurrent.value.permissionUsers?.visibility;
        const defaultPermission = folderCurrent.value.permissionUsers?.permission;
        if (!fileFolderId) return;
        await postCreateAndUpadateShare(fileFolderId, visibility, defaultPermission, sharedUsers);
        await handleUpdateData();
        showUserShareButton.value = false;
    } catch (err) {
        console.error('handleUpdatePermission error', err);
    }
}

async function handleDeleteCurrentFolderShare() {
    try {
        const permissionId = folderCurrent.value.permissionUsers?.id;
        if (!permissionId) {
            toastError({ message: 'Không tìm thấy permission ID' });
            return;
        }
        await DeletePermission(permissionId);
        toastSuccess({ message: 'Xóa chia sẻ thành công' });
        showUserShareButton.value = false;
        await handleUpdateData();
    } catch (err) {
        console.error('handleDeleteCurrentFolderShare error', err);
        toastError({ message: 'Xóa chia sẻ thất bại' });
    }
}

async function handleUpdateData() {
    if (route.params.idFolder == undefined) {
        await fetchRootFolder();
    } else {
        // parentIdParam là computed property, nó sẽ tự động cập nhật theo route
        await fetchFolder(parentIdParam.value);
    }
    oldFolders = folders.value
    oldPhotos = photos.value
}

function openFolder(id) {
    // Lưu folder hiện tại vào pageList trước khi chuyển
    const currentFolderId = folderCurrent.value.id || parentIdParam.value;
    if (currentFolderId && currentFolderId !== id) {
        pageList.value.push(currentFolderId);
    }
    router.replace({ name: 'EcmAlbumDetail', params: { idFolder: id } }).then(() => fetchFolder(id));
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
            router.replace({ name: 'EcmAlbumDetail', params: { idFolder: previousFolderId } }).then(() => fetchFolder(previousFolderId));
            return;
        }
    }

    // Nếu không có pageList nhưng đang ở folder con, về root
    if (route.params.idFolder) {
        goRoot();
    }
}

function changeAlbumMode(mode) {
    if (albumMode.value === mode) return;
    albumMode.value = mode;
    if (mode === 'all') {
        // Reset pageList khi về mode all
        pageList.value = [];
        router.push({ name: 'EcmAlbumDetail', params: { idFolder: rootFolder.value.id } }).then(() => fetchRootFolder());
        // fetchRootFolder()
        // getFoldersShareWithUser()
    } else {
        getFoldersShareWithUser();
    }
}

function goRoot() {
    // Reset pageList khi về root
    pageList.value = [];
    // router.push({ name: 'EcmAlbum' }).then(() => fetchRootFolder());
    router.push({ name: 'EcmAlbumDetail' }).then(() => fetchRootFolder());

}

function handleSortChange() {
    // Reload data khi thay đổi sortType
    handleUpdateData();
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
    if (newName === 'EcmAlbum' && oldName && oldName !== 'EcmAlbum') {
        pageList.value = [];
    }
});

// const serchData=()=>{
// folders
//  photos
// }
var oldFolders = []
var oldPhotos = []
function searchByName(keyword) {

    if (!keyword) return folders.value;

    const lowerKeyword = keyword.toLowerCase();

    folders.value = oldFolders.filter(folder =>
        folder.name && folder.name.toLowerCase().includes(lowerKeyword)
    );


    photos.value = oldPhotos.filter(photo =>
        photo.name && photo.name.toLowerCase().includes(lowerKeyword)
    );


}


const searchTerm = inject('searchTerm', ref(''));
watch(searchTerm, (newValue) => {

    if (newValue.trim() == '') {
        handleUpdateData()
    }
    console.log('runrearch : ', newValue)
    // handleUpdateData().then(() => { searchByName(newValue) })
    searchByName(newValue)
    // alert(newValue)
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
    gap: 1rem;
    padding: 1.25rem;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
    align-items: flex-start;
    overflow: visible;
    /* Cho phép dialog hiển thị */
}

.page-header>div:first-child {
    flex: 1;
    min-width: 0;
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

/* Header styles - giữ lại cho các header con bên trong nếu cần */
.header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
    padding: 0.25rem 0;
    align-items: center;
}

.header-left {
    display: flex;
    flex-direction: column;
    align-items: start;
}

.page-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d2d2d;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    transition: color 0.2s ease;
}

.page-title:hover {
    color: #6c5ce7;
}

.subtle {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 0.85rem;
}

.actions {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
}

.create-album-btn {
    white-space: nowrap;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: transparent;
    cursor: pointer;
}

.album-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.user-avatar-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.header-left-group {
    display: flex;
    gap: 8px;
}

.mode-btn {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: transparent;
    cursor: pointer;
}

.mode-btn.active {
    background: var(--accent, #6c5ce7);
    color: white;
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

.album-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 10px;
    padding: 16px;
    width: 90%;
    max-width: 520px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
}

.butonFix {
    width: 50px;
    height: 50px;
    position: fixed;
    bottom: 16px;
    right: 16px;
    border-radius: 37px;
    background: #6c5ce7;
    color: white;
    font-size: 30px;
    border: none;
    cursor: pointer;
}

.shared-users-section {
    margin-top: 12px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.shared-users-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: background 0.2s ease;
}

.shared-users-header:hover {
    background: #f3f4f6;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-count {
    color: #6c5ce7;
    font-weight: 700;
}

.listUser {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 12px 12px 12px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.view-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    margin-top: 8px;
    background: white;
    border: 1px dashed #6c5ce7;
    border-radius: 8px;
    color: #6c5ce7;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.view-more-btn:hover {
    background: #f5f3ff;
    border-color: #5a4fcf;
    color: #5a4fcf;
}

.userItem {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
}

.userItem:hover {
    border-color: #6c5ce7;
    box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);
    transform: translateX(4px);
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
}

.user-info {
    flex: 1;
}

.user-name {
    font-weight: 600;
    font-size: 14px;
    color: #111827;
    margin-bottom: 4px;
}

.user-permission {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.permission-view {
    background: rgba(255, 193, 7, 0.15);
    color: #856404;
}

.permission-edit {
    background: rgba(34, 197, 94, 0.15);
    color: #166534;
}

.permission-none {
    background: rgba(220, 53, 69, 0.15);
    color: #991b1b;
}

.user-permissions-list {
    max-height: 400px;
    overflow-y: auto;
}

.permission-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    gap: 16px;
}

.permission-row:last-child {
    border-bottom: none;
}

.user-details {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
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
    font-size: 14px;
}

.user-name-bold {
    font-weight: 600;
    font-size: 14px;
    color: #111827;
    margin-bottom: 2px;
}

.user-email {
    font-size: 12px;
    color: #6b7280;
}

.permission-dropdown {
    min-width: 140px;
}

.optionPermission {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 8px;
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

@media (max-width:640px) {
    .header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    .actions {
        justify-content: flex-end;
    }

    .album-list-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        width: 100%;
    }

    .sort-selector {
        width: 100%;
    }

    .sort-dropdown {
        width: 100%;
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