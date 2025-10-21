<template>
    <div class="image-card">
        <div class="iconImage">
            <i v-if="photo?.liked" @click="() => LikeHandle(photo)" class="pi pi-heart-fill icon"
                style="font-size: 17px; color:#f871d9; background-color: white;"></i>

            <!-- <i v-else @click="() => LikeHandle(photo)" class="pi pi-heart icon" style="font-size: 17px;"></i> -->

            <i @click="menuVisible = true" class="pi pi-ellipsis-v icon" style="font-size: 17px"></i>
        </div>
        <img crossorigin="use-credentials" @click="visiblPhoto = true" :src="urlImage + photo?.treePath"
            class="image" />

        <!-- photo full screen -->
        <Dialog v-model:visible="visiblPhoto" maximizable modal :header="photo.filename" :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <template #header>
                <p>{{ photo?.filename }}</p>
                <i @click="visible = true" class="pi pi-images" style="font-size: 2rem"></i>
                <!-- Or use a custom SVG -->
                <!-- <svg ...>...</svg> -->
            </template>
            <img crossorigin="use-credentials" :src="urlImage + photo?.treePath" class="image" />

        </Dialog>
        <!-- Dialog menu 3 chấm -->
        <Dialog v-model:visible="menuVisible" modal :style="{ width: '18rem' }" class="custom-dialog">
            <template #header>
                <div class="dialog-header">
                    <img crossorigin="use-credentials" :src="urlImage + photo?.treePath" class="thumb" />
                    <div class="info">
                        <h3>{{ photo?.filename }}</h3>
                        <p>{{ new Date(photo?.createdAt).toLocaleDateString() }}</p>
                    </div>
                </div>
            </template>
            <div class="dialog-body">
                <ul style="list-style:none; padding:0; margin:0;">
                    <li style="padding:10px 0; cursor:pointer;" @click="openShareDialog">
                        <i class="pi pi-share-alt" style="margin-right:8px"></i> Chia sẻ
                    </li>
                    <!-- <li style="padding:10px 0; cursor:pointer;"
                        @click="addAlbumDialogVisible = true; menuVisible = false">
                        <i class="pi pi-folder-plus" style="margin-right:8px"></i> Thêm vào album
                    </li> -->
                    <li style="padding:10px 0; cursor:pointer; color:#dc2626;"
                        @click="deleteDialogVisible = true; menuVisible = false">
                        <i class="pi pi-trash" style="margin-right:8px"></i> Xóa
                    </li>
                </ul>
            </div>
        </Dialog>
        <!-- Dialog chia sẻ -->
        <Dialog v-model:visible="shareDialogVisible" modal header="Chia sẻ Album" :style="{ width: '25rem' }">
            <div class="modal" role="dialog" aria-modal="true">
                <div class="dialog-header">
                    <div class="info">
                        <h3 class="album-name">{{ selectedAlbum?.name }}</h3>
                    </div>
                </div>

                <div class="dialog-body">
                    <h4>Chọn người dùng để chia sẻ</h4>
                    <hr class="thin-sep" />
                    <div style="margin: 10px;">
                        public:
                        <Checkbox v-model="role" binary />
                    </div>

                    <!-- {{ role }} -->
                    <ul v-if="!role" class="folder-list">
                        <li v-for="(user, i) in userListToShare" :key="i" class="album-item">
                            <i class="pi pi-user"></i>
                            <div class="user-info">
                                <div class="user-name">{{ user.name }}</div>
                                <div class="user-email muted">{{ user.email }}</div>
                            </div>

                            <div class="action">
                                <select v-model="user.permission" style="border: none;" class="w-full">
                                    <option selected :value="'NONE'">
                                        NONE
                                    </option>
                                    <option v-for="opt in permissionOptions" :key="opt.code" :value="opt.code">
                                        {{ opt.name }}
                                    </option>
                                </select>
                            </div>
                        </li>
                    </ul>
                </div>

                <Button label="link " style="margin: 10px;" icon="pi pi-link"
                    @click="copyUrl(urlImage + photo?.treePath)"></Button>
                <div class="dialog-footer flex justify-end gap-2">
                    <Button type="button" label="Đóng" severity="secondary" @click="showShareDialog = false"></Button>
                    <Button type="button" label="Chia sẻ" severity="secondary"
                        @click="handleConfirmPermission"></Button>
                </div>
            </div>
        </Dialog>
        <!-- Dialog xác nhận xóa -->
        <Dialog v-model:visible="deleteDialogVisible" modal :style="{ width: '18rem' }" class="custom-dialog">
            <template #header>
                <div class="dialog-header">
                    <img crossorigin="use-credentials" :src="urlImage + photo?.treePath" class="thumb" />
                    <div class="info">
                        <h3>{{ photo?.filename }}</h3>
                    </div>
                </div>
            </template>
            <div class="dialog-body">
                <div>Bạn có chắc muốn xóa ảnh này không?</div>
            </div>
            <template #footer>
                <Button label="Hủy" severity="secondary" @click="deleteDialogVisible = false" />
                <Button label="Xóa" severity="danger" @click="deletePhoto" />
            </template>
        </Dialog>

    </div>
</template>

<script setup>
import { ref } from "vue"
import Dialog from "primevue/dialog"
import Button from "primevue/button"
import { deleteImageHard, getAllUser, urlImage } from "../../api/Album"
import router from "@/common/router"
import { copyToClipboard } from "../../api/CookieFuntion.js"

const props = defineProps({
    photo: {
        type: Object,
        required: false,
    }, albumsFolder: {
        type: Object,
        required: false,
    }

})
const emit = defineEmits(['updateData'])

const menuVisible = ref(false)
const shareDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const addAlbumDialogVisible = ref(false)
const visiblPhoto = ref(false)
const albums = ref([])

const showEditDialog = ref(false)
const showShareDialog = ref(false)
const showPermissionDialog = ref(false)


const selectedAlbum = ref(null)
const selectedUser = ref(null)
const selectedPermission = ref('VIEW')

const permissionOptions = ref([

    { name: 'VIEW', code: 'VIEW' },
    { name: 'EDIT', code: 'EDIT' },

])
const role = ref(false) //LIMITED, PUBLIC 
const openMenu = ref(false)
const nameFolder = ref('')


const userListToShare = ref([])

const openShareDialog = async () => {
    const res = await getAllUser()
    userListToShare.value = res.data
    shareDialogVisible.value = true
    menuVisible.value = false

}




const addToAlbum = async (photoParam, albumParam) => {
    alert(`Đã thêm ảnh "${photoParam.filename}" vào album "${albumParam.name}"`)
    // visible.value = false
}


// const LikeHandle = (item) => {
//     alert("sử lý sự liện ảnh yêu thích ở đây")
// }

const deletePhoto = async () => {
    await deleteImageHard(props.photo.id).then(() => { deleteDialogVisible.value = false })
    emit('updateData')
    // router.go(0)


}

///// share 
const copyUrl = (url) => {
    copyToClipboard(url)
}
const handleConfirmPermission = () => {
    // console.log('confirm ', userListToShare.value)
    const userspermission = userListToShare.value.filter(u => (u.permission && u.permission !== 'NONE')).map(e => ({
        ...e,
        userId: e.id,
        fullName: e.name
    }));
    console.log('confirm userspermission ', userspermission)
}


</script>

<style scoped>
.image-card {
    border: 1px solid #eee;
    border-radius: 6px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    width: 100%;
    position: relative;
    height: 96%;
}

.iconImage {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 5px;
    gap: 10px;
    color: white;
    height: 100%;
    justify-content: space-between;
}

.icon {
    background: #ffffff85;
    border-radius: 50%;
    padding: 6px;
    cursor: pointer;
    transition: background 1s;
    display: none;
}

.image-card:hover .icon {
    display: block;
}

.icon:hover {
    background: rgba(0, 0, 0, 0.6);
}

.image {
    width: 100%;
    aspect-ratio: 7 / 5;
    object-fit: cover;
    transition: opacity 0.6s;
}

/* Dialog style */
.custom-dialog .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.custom-dialog .thumb {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    object-fit: cover;
}

.custom-dialog .info h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.custom-dialog .info p {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
}

.dialog-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 10px;
}

/* Folder list */
.folder-list {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 200px;
    overflow: scroll;
}

.folder-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.folder-item:hover {
    background: #f0f0f0;
}

.list-user-share {
    display: scroll;
    height: 200px;
    width: 400px;
}

.item-user-share:hover {

    background-color: #a8a8a8;
}
</style>
