<template>
    <div class="image-card">
        <div class="iconImage">
            <i v-if="photo?.liked" @click="() => LikeHandle(photo)" class="pi pi-heart-fill icon"
                style="font-size: 17px; color:#f871d9; background-color: white;"></i>

            <!-- <i v-else @click="() => LikeHandle(photo)" class="pi pi-heart icon" style="font-size: 17px;"></i> -->

            <i @click="menuVisible = true" class="pi pi-ellipsis-v icon" style="font-size: 17px"></i>
        </div>
        <img @click="visiblPhoto = true" :src="urlImage + photo?.treePath" class="image" />

        <!-- photo full screen -->
        <Dialog v-model:visible="visiblPhoto" maximizable modal :header="photo.filename" :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <template #header>
                <p>{{ photo?.filename }}</p>
                <i @click="visible = true" class="pi pi-images" style="font-size: 2rem"></i>
                <!-- Or use a custom SVG -->
                <!-- <svg ...>...</svg> -->
            </template>
            <img :src="urlImage + photo?.treePath" class="image" />

        </Dialog>
        <!-- Dialog menu 3 chấm -->
        <Dialog v-model:visible="menuVisible" modal :style="{ width: '18rem' }" class="custom-dialog">
            <template #header>
                <div class="dialog-header">
                    <img :src="urlImage + photo?.treePath" class="thumb" />
                    <div class="info">
                        <h3>{{ photo?.filename }}</h3>
                        <p>{{ new Date(photo?.createdAt).toLocaleDateString() }}</p>
                    </div>
                </div>
            </template>
            <div class="dialog-body">
                <ul style="list-style:none; padding:0; margin:0;">
                    <li style="padding:10px 0; cursor:pointer;" @click="openDetailDialog">
                        <i class="pi pi-info-circle" style="margin-right:8px"></i> Xem chi tiết
                    </li>
                    <li style="padding:10px 0; cursor:pointer;" @click="handleDownload">
                        <i class="pi pi-download" style="margin-right:8px"></i> Tải xuống
                    </li>
                    <li style="padding:10px 0; cursor:pointer;" @click="openShareDialog">
                        <i class="pi pi-share-alt" style="margin-right:8px"></i> Chia sẻ quyền
                    </li>
                    <!-- <li style="padding:10px 0; cursor:pointer;" @click="openCopyUrlDialog">
                        <i class="pi pi-link" style="margin-right:8px"></i> Copy link
                    </li> -->
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
        <Button_share v-model:visible="shareDialogVisible" :item-id="photo?.id" :item-name="photo?.filename || ''"
            item-type="file" @update="handleUpdate" />

        <!-- Detail Viewer Dialog -->
        <DetailViewer
            v-model:visible="showDetailDialog"
            :item="photo"
            item-type="file"
            @hide-dialog="showDetailDialog = false"
        />

        <!-- Copy URL Button -->
        <Dialog v-model:visible="copyUrlDialogVisible" modal header="Chia sẻ link" :style="{ width: '25rem' }">
            <div class="p-3">
                <InputText v-model="shareUrl" readonly class="w-full" />
                <Button label="Copy link" icon="pi pi-link" class="mt-3 w-full" @click="copyUrl(shareUrl)" />
            </div>
        </Dialog>
        <!-- Dialog xác nhận xóa -->
        <Dialog v-model:visible="deleteDialogVisible" modal :style="{ width: '18rem' }" class="custom-dialog">
            <template #header>
                <div class="dialog-header">
                    <img :src="urlImage + photo?.treePath" class="thumb" />
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
import { ref, computed } from "vue"
import Dialog from "primevue/dialog"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import { deleteImageHard, urlImage, dowLoadFile } from "../../api/Album.js"
import { copyToClipboard } from "../../api/CookieFuntion.js"
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service'
import Button_share from "../button/Button_share.vue"
import DetailViewer from "../viewer/DetailViewer.vue"

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
const visiblPhoto = ref(false)
const copyUrlDialogVisible = ref(false)
const showDetailDialog = ref(false)
const shareUrl = ref('')

const openDetailDialog = () => {
    menuVisible.value = false
    showDetailDialog.value = true
}

const openShareDialog = () => {
    shareDialogVisible.value = true
    menuVisible.value = false
}

const openCopyUrlDialog = () => {
    shareUrl.value = urlImage + props.photo?.treePath
    copyUrlDialogVisible.value = true
    menuVisible.value = false
}

const handleUpdate = () => {
    emit('updateData')
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

const copyUrl = (url) => {
    copyToClipboard(url)
}

const handleDownload = async () => {
    if (!props.photo?.id) {
        toastError({ message: 'Không tìm thấy file để tải xuống' });
        return;
    }

    try {
        menuVisible.value = false;
        const response = await dowLoadFile(props.photo.id);
        
        // Tạo blob từ response data
        const blob = new Blob([response.data]);
        
        // Tạo URL từ blob
        const url = window.URL.createObjectURL(blob);
        
        // Tạo link để download
        const link = document.createElement('a');
        link.href = url;
        
        // Lấy tên file từ Content-Disposition header hoặc sử dụng filename từ photo
        const contentDisposition = response.headers['content-disposition'];
        let filename = props.photo.filename || 'download';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
                // Decode URI nếu cần
                filename = decodeURIComponent(filename);
            }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toastSuccess({ message: 'Tải xuống thành công' });
    } catch (error) {
        console.error('Download error:', error);
        toastError({ message: 'Tải xuống thất bại. Vui lòng thử lại.' });
    }
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
    /* object-fit: cover; */
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
