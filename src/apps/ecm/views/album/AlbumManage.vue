<template>

    <!-- Floating fixed button -->
    <button class="butonFix" @click="showDialog = true">
        +
    </button>
    <!-- mẫu chặn ảnh -->
    <!-- <img crossorigin="use-credentials"
        src="http://localhost:8080/api/photos/get_photo_author?pathFile=/Album/user/650000000000000000000002/Folder3/567e0eac-824f-4e5c-a0e7-def46f30a263.png"
        class="album-cover" /> -->
    <!-- Dialog -->
    <div v-if="showDialog" class="modal-backdrop">
        <div class="modal" role="dialog">
            <h3 class="modal-title">giả lập cookie lúc đăng nhập</h3>
            <input v-model="text" type="text" class="text-input" placeholder="nhập user id" />
            <div class="modal-actions">
                <button class="btn-cancel" @click="showDialog = false">Hủy</button>
                <button class="btn-confirm" @click="() => { confirmCreateCookie() }">
                    Xác nhận
                </button>
            </div>
        </div>
    </div>

    <div class="albums-page">
        <!-- header  -->
        <div class="header">
            <div class="header-left">
                <!-- router.back() -->
                <div>
                    <div>
                        <button @click="rollbackPage"
                            style="border:none; background:none; cursor:pointer; color:#3b82f6; font-weight:500; font-size:14px; padding:4px 8px;">
                            &lt; back
                        </button>
                        <b>{{ pathTree }}</b>
                    </div>
                    <div class="page-title" @click="() => {
                        router.push({ name: 'EcmAlbum' })
                            .then(() => router.go(0))
                    }">

                        Albums : {{ folderCurrant.name }}

                    </div>
                </div>

                <p class="subtle">Tổng {{ filteredAlbums.length }} album</p>
                <!-- <h2>{{ rootFolder?.path }}</h2> -->
                <!-- danh sách người dùng được chia sẻ  -->
                <div v-if="folderCurrant.permissionUsers">
                    Người dùng được chia sẻ:
                    <div class="listUser">
                        <div @click="showUserShareButton = true"
                            v-for="(user, i) in folderCurrant.permissionUsers.sharedUsers" :key="i" class="userItem">
                            <i class="pi pi-user iconUser" :title="`${user.fullName}-(${user.permission})`"
                                style="color: #708090"></i>




                        </div>
                        <!-- dialog user  -->
                        <Dialog v-if="folderCurrant.permissionUsers" v-model:visible="showUserShareButton"
                            header="Sửa quyền chia sẻ" :style="{ width: '25rem' }">
                            <div v-for="(user, i) in folderCurrant.permissionUsers.sharedUsers" :key="i">
                                <div class="flex items-center space-between gap-4 mb-8">
                                    <div><strong>{{ user.fullName }}</strong></div>
                                    <select v-model="user.permission" class="optionPermission">
                                        <option value="VIEW">VIEW</option>
                                        <option value="EDIT">EDIT</option>
                                        <option value="NONE">NONE</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex justify-end gap-2">
                                <Button type="button" label="Cancel" severity="secondary"
                                    @click="showUserShareButton = false"></Button>
                                <Button type="button" label="Save" @click="handleUpdatePermission"></Button>
                            </div>
                        </Dialog>
                        <!-- <div @click="showUserShareButton = true">
                            <Dialog v-model:visible="showUserShareButton" modal header="Sửa quyền chia sẻ"
                                :style="{ width: '25rem' }">
                                <Listbox v-model="selectedCity" :options="folderCurrant.permissionUsers.sharedUsers"
                                    multiple optionLabel="fullName" class="w-full md:w-56" />
                            </Dialog>
                        </div> -->


                    </div>

                </div>

            </div>
            <div class="actions">
                <button class="p-button-outlined create-album-btn" @click="showDialogCreateAlbum = true">+ Tạo
                    album</button>

                <Button_uploadFile @updateData="handleUPdateData" :album="folderCurrant" />
                <!-- dialog create album -->
                <Dialog v-model:visible="showDialogCreateAlbum" modal header="Tạo folder" :style="{ width: '25rem' }">
                    <div class="flex items-center gap-4 mb-4">
                        <InputText id="username" class="flex-auto" v-model="nameFolder" autocomplete="off"
                            placeholder="Nhập tên folder" />
                    </div>

                    <div class="flex justify-end gap-2">
                        <Button type="button" label="Thoát" severity="secondary"
                            @click="showDialogCreateAlbum = false"></Button>
                        <Button type="button" label="Tạo" @click="createAlbum"></Button>
                    </div>
                </Dialog>




            </div>
        </div>

        <!-- mode switch -->
        <div class="album-list-header">
            <button :class="['mode-btn', { active: albumMode === 'all' }]" @click="changeAlbumMode('all')">Tất
                cả</button>
            <button :class="['mode-btn', { active: albumMode === 'shared' }]" @click="changeAlbumMode('shared')">Chia
                sẻ</button>
        </div>

        <!-- List view -->
        <div class="album-list-wrap" v-if="viewMode === 'list'">

            <!-- list album here -->
            <div class="album-list" v-if="filteredAlbums.length >= 0">
                <div class="album-card" @click="() => openFolder(album.id)" v-for="(album, index) in filteredAlbums"
                    :key="index">

                    <AlbumCard @updateData="handleUPdateData" :album="album" :default-image="defaultAlbumImage" />
                </div>
            </div>
            <!-- list photo or other file like video ,.... -->
            <div class="album-list" v-if="photos?.length >= 0">
                <div class="album-card" v-for="(photo, index) in photos" :key="index">
                    <FileCart @updateData="handleUPdateData" :photo="photo" />

                </div>
            </div>

        </div>
        <!-- share view -->




    </div>
    <!-- {{ route.params.idFolder }} -->
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import AlbumCard from './template/cart/AlbumCart.vue';
import FileCart from './template/cart/FileCart.vue';
import { taocock } from './api/CookieFuntion.js';
import { getFolderRoot, getFoldersByFolder, postCreateFolder, getFolderDetail, getPhotosByFolder, getAllUser, getAllFolderShareWithUser, postCreateAndUpadateShare } from './api/Album.js';
import {
    toastError,
    toastSuccess,
} from '@/common/helpers/custom-toast-service';
import { useRoute, useRouter } from 'vue-router';
import Button_uploadFile from './template/button/Button_uploadFile.vue';


/////// tạo cookie dùng tạm cho image giải pháp tạm thời
const text = ref('');
const showDialog = ref(false);
const showDialogCreateAlbum = ref(false);
// const showUserShareButton = ref(false)
const nameFolder = ref('');
const route = useRoute()
const router = useRouter()
var parentIdParam = route.params.idFolder

const confirmCreateCookie = () => {
    taocock("userDetail", {
        id_user: text.value.trim(),
        usename: text.value.trim()
    })
    showDialog.value = false;
};

////////////////////

const rootFolder = ref({})
const folderCurrant = ref({})
const defaultAlbumImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEaYTaC-q-QWUu2g7QgVvRKkJkqXjXtjBU2w&s';
const folders = ref([]);
const photos = ref([]);
const userList = ref([]);



/////// api rest
const getrootFolder = async () => {
    const response = await getFolderRoot()
    console.log('getrootFolder : ', response.data);
    rootFolder.value = response.data;

    getFoldersByFolderId(response.data.id);
};
const getFolder = async (id) => {
    const response = await getFolderDetail(id)
    console.log('getFolder : ', response.data);
    // folders.value = response.data;
    folderCurrant.value = response.data
    getFoldersByFolderId(response.data.id);
    const responsePhoto = await getPhotosByFolder(id);
    photos.value = responsePhoto.data
    console.log('photos.value : ', photos.value);
    await filterPath(folderCurrant.value.path)
};

const filterPath = (path) => {
    const parts = path.split("/");
    // ["", "Album", "User", "68ec9efbc69d94a74d3d7573", "f1"]

    const result = "/" + parts.slice(4).join("/"); // từ phần tử thứ 4 trở đi
    console.log('sssssss', result)
    pathTree.value = result
}
const getFoldersByFolderId = async (id) => {
    const response = await getFoldersByFolder(id)
    console.log('getFoldersByFolderId : ', response.data);
    folders.value = response.data;
};

const createAlbum = () => {
    console.log('createAlbum : ', parentIdParam == undefined ? rootFolder.value.id : parentIdParam);
    // return
    postCreateFolder(nameFolder.value.trim(), parentIdParam == undefined ? rootFolder.value.id : parentIdParam).then((res) => {
        // router.go(0);
        handleUPdateData()

    }).catch((err) => {
        // toastError({ message: ('Tạo folder thất bại') });

    });
    // toastSuccess({ message: ('Tạo folder Thành công') });
    showDialogCreateAlbum.value = false;
};

const getFoldersShareWithUser = async () => { // share
    const response = await getAllFolderShareWithUser()
    folders.value = response.data;

    // sử lý dữ liệu ảnh được chia sẻ
    photos.value = []


}

const handleUpdatePermission = async () => {
    const sharedUsers = folderCurrant.value.permissionUsers.sharedUsers.filter(e => e.permission !== 'NONE');
    const fileFolderId = folderCurrant.value.permissionUsers.fileFolderId
    const visibility = folderCurrant.value.permissionUsers.visibility
    const defaultPermission = folderCurrant.value.permissionUsers.permission

    await postCreateAndUpadateShare(fileFolderId, visibility, defaultPermission, sharedUsers)
    await handleUPdateData()
    showUserShareButton.value = false

    // showUserShareButton.value = false

}

/// restart data
const handleUPdateData = () => {
    // alert(parentIdParam)
    if (route.params.idFolder == undefined) {
        getrootFolder();
    } else {
        getFolder(parentIdParam)
        folderCurrant.value = {}
    }
}







const viewMode = ref('list');
const albumMode = ref('all');
const selectedAlbum = ref(null);
const showShareDialog = ref(false);
const showUserShareButton = ref(false)
const albumShareLink = ref('');


const filteredAlbums = computed(() => {
    console.log('folders.value : ', folders.value);
    return folders.value;
});

const changeAlbumMode = async (mode) => {
    if (albumMode.value == mode)
        return
    albumMode.value = mode;
    if (mode == 'all') {

        router.push({ name: 'EcmAlbum' }).then(() => { router.go(0) })

    } else {
        getFoldersShareWithUser()
    }

}


/// page
const pathTree = ref("")
const pageList = ref([])
const openFolder = (id) => {
    // router.push(`album / ${ id }`);
    // getFolder(parentIdParam)\
    // router.push(`album / ${ id }`)
    // router.replace({ name: 'album', params: { idFolder: id } })
    router.replace({ name: 'EcmAlbumDetail', params: { idFolder: id } }).then(() => getFolder(id).then())
    parentIdParam = route.params.idFolder
    // console.log("new  parame page ", route.params.idFolder)
    pageList.value.push(id)
    console.log("page ", pageList)


}
const rollbackPage = () => {
    if (pageList.value.length <= 0) {
        return
    }
    const idPage = pageList.value[pageList.value.length - 1]
    router.replace({ name: 'EcmAlbumDetail', params: { idFolder: idPage } }).then(() => getFolder(idPage).then())
    pageList.value.pop()
}






onMounted(() => {
    if (parentIdParam == undefined) {
        getrootFolder();
    } else {
        getFolder(parentIdParam)
    }


    // window.addEventListener('keydown', (e) => {
    //     if (e.key === 'Escape') {
    //         // close dialogs
    //         showShareDialog.value = false;
    //         showPermissionDialog.value = false;
    //     }
    // });
});
onBeforeUnmount(() => {

})
</script>

<style scoped>
/* (Use same styles from your previous file) */
.albums-page {
    min-height: calc(100vh - 80px);
    padding: 1.25rem;
    /* background: linear-gradient(180deg, #f7f8fc 0%, #ffffff 100%); */
    color: #222;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.9rem;
    padding: 0.25rem 0;
}

.header-left {
    display: flex;
    flex-direction: column;
}

.page-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #2d2d2d;
}

.subtle {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 0.85rem;
}

.actions {
    display: flex;
    align-items: center;
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
    gap: 8px;
    margin-bottom: 10px;
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

.album-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

/* modal styles (same as before) */
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

.thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
}

.muted {
    color: #6b7280;
    font-size: 0.9rem;
}

.folder-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 1rem 0;
    max-height: 220px;
    overflow: auto;
}

.album-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    cursor: pointer;
    border-radius: 8px;
}

.album-item:hover {
    background: rgba(15, 23, 42, 0.03);
}

.btn-secondary {
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 6px 10px;
    border-radius: 6px;
}

.p-button-text {
    background: transparent;
    border: none;
    cursor: pointer;
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
}


.album-card {
    padding: 5px;
    border-radius: 10px;
}

.album-card:hover {
    box-shadow: #6c5ce733 0px 4px 20px;
}

.butonFix {
    width: 50px;
    height: 50px;
    aspect-ratio: 2 / 2;
    position: fixed;
    bottom: 0;
    right: 0;
    border-radius: 37px;
}

.listUser {
    display: flex;
    flex-wrap: nowrap;
}

.userItem {
    margin: 5px;
}

.pi-user {
    size: 10px;
    height: max-content;
    width: max-content;
    border-radius: 20px;
    padding: 5px;
}

.iconUser {
    font-size: 10px;
    color: rgb(112, 128, 144);
    font-size: 28px;
    border: solid 1px #bababa;
}

.iconUser:hover {
    font-size: 10px;
    color: rgb(110, 122, 255);
    font-size: 28px;
    border: solid 1px #8cd3ff;
    background-color: #b3a9ff;
}

.optionPermission {
    border: none;
}

/* 



.imgslide {
    width: 60%;
    height: 100%;
    position: relative;
    animation: img_dow 2s;
}

.imgslide:before {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: url("https://flone.jamstacktemplates.dev/assets/img/slider/single-slide-hm1-2.png");
    background-size: cover;
}

@keyframes img_dow {
    0% {
        opacity: 0;
        transform: translateY(10rem);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
} */
</style>
