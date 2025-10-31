import axios from 'axios';
// import Cookies from 'js-cookie';
import { getCookie ,getToken} from './CookieFuntion.js';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';

// const doman = 'http://localhost:8080'
export const doman = 'http://localhost:4000/ecm-service'
// const doman = 'http://localhost:8103'
// const token = "1"
const token = getToken("user")
// export const urlImage = 'http://localhost:8080/api/photos/get_photo_author?pathFile='
// export const urlImage = 'http://localhost:4000/ecm-service/api/photos/get_photo_author?pathFile='
// export const urlImage = 'http://localhost:4000/ecm-service/api/photos/get_photo_author?pathFile='
export const urlImage = 'http://localhost:4000/files/preview/'



// Tạo instance axios
export const api = axios.create({
	baseURL:doman, // chỉnh lại nếu cần
	timeout: 10000,
});

// Interceptor để đẩy token lên header
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // const token = getCookie('userDetail')?.id_user;
    // const userId = getCookie('userDetail')?.id_user; // hoặc field khác

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    //   config.headers['X-TenantID'] = "localhost"; // <--- thêm custom header
	//   config.headers['userId'] = userId
    } else {
      toastError({ message: 'Không tìm thấy token, vui lòng đăng nhập lại' });
    }

    return config;
  },
  (error) => Promise.reject(error)
);




// Hàm lấy danh sách ảnh theo folder id
export  const getPhotosByFolder=(sortType,folderId)=> {
	// const res =  api.get(`api/photos/folder/${folderId}`);
		return api.get(`api/photos/folder/${folderId}?sortType=${sortType}`);
}

// export const createPhotos=(idFolder, files)=>{
//   const form = new FormData()
//   form.append('folderId', idFolder)

//   // files có thể là FileList hoặc Array<File>
//   const fileArray = Array.from(files || [])
//   fileArray.forEach((f) => {
//     // append nhiều lần với cùng key 'files' -> Spring nhận List<MultipartFile>
//     form.append('files', f)
//   })
// 	return axios.post(`http://localhost:8080/api/photos/create-photos`,form, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
	
// }

export const createPhotos = async (folderId, files) => {
  const form = new FormData();
  form.append("folderId", folderId);

  // đảm bảo files là FileList hoặc Array<File>
  const fileArray = Array.from(files || []);
  fileArray.forEach((f) => {
    if (f instanceof File) {
      form.append("files", f);
    } else {
      console.warn(" Không phải File:", f);
    }
  });

  // axios tự thêm header boundary, KHÔNG tự set Content-Type bằng tay
  return api.post("api/photos/create-photos", form, {
   
  });
};

// ALL,
//     NAME,
//     DATE_CREATED,
//     DATE_MODIFIED,
export const getFoldersByFolder =( sortType,parentId)=>{
  // const sortType ="NAME"
    return api.get(`api/folders/folders/${parentId}?sortType=${sortType}`);
}

export const getFolderRoot =()=>{
    return api.get(`api/folders/folder-root`);
}
export const getFolderDetail =(idFolder)=>{
    return api.get(`api/folders/folder?idFolder=${idFolder}`);
}

export const postCreateFolder =(namefolder, parentId )=>{
    return api.post(`api/folders/create`,null,{
		params:{
			
			name:namefolder,
			parentId:parentId
		}
	});
}
export const postChangeNameFolder =(folderId, newName )=>{
    return api.post(`api/folders/rename-folder`,null,{
		params:{
			
			folderId:folderId,
			newName:newName
		}
	});
}

// export const getAllUser =( )=>{
// 	return api.get(`api/users/get-all`);
// }

// export const searchUsers = (keyword) => {
// 	return api.get(`api/users/search`, {
// 		params: { keyword }
// 	});
// }

export const deleteImageHard = (idFile)=>{
return api.post(`api/photos/delete/${idFile}`);
}
export const deleteFolder = (idFolder)=>{
return api.post(`api/folders/delete/${idFolder}`);
}

/// api liên quan đế chia ser
export const getAllFolderShareWithUser =()=>{
	return api.get(`api/folders/folders-user-shared`);
}

export const getAllPhotosShareWithUser =()=>{
	return api.get(`api/photos/shared`);
}
export const dowLoadFile =(photoId)=>{
	return api.get(`api/photos/download-album-file?photoId=${photoId}`, {
		responseType: 'blob' // Cần thiết để download file
	});
}

export const postCreateAndUpadateShare =(fileFolderId,visibility,defaultPermission,sharedUsers)=>{
	return api.post(`api/folders/folder-addUpdate-permission`,
		{
			fileFolderId,
			visibility,
			defaultPermission,
			sharedUsers
		}

	);
}
export const postCreateAndUpadateSharePhoto =(fileFolderId,visibility,defaultPermission,sharedUsers)=>{
	return api.post(`api/photos/photo-addUpdate-permission`,
		{
			fileFolderId,
			visibility,
			defaultPermission,
			sharedUsers
		}

	);
}

/// xóa dữ liệu trong bảng permisson
export const DeletePermission =(permissionId)=>{
	return api.post(`api/permission/delete/${permissionId}`);
}
/// load 


export const createPhotos_load = async (folderId, files) => {
  const form = new FormData();
  form.append("folderId", folderId);

  // đảm bảo files là FileList hoặc Array<File>
  const fileArray = Array.from(files || []);
  fileArray.forEach((f) => {
    if (f instanceof File) {
      form.append("files", f);
    } else {
      console.warn(" Không phải File:", f);
    }
  });

  // axios tự thêm header boundary, KHÔNG tự set Content-Type bằng tay
  return api.post("api/photos/create-photos", form, {
    headers: { 'Authorization': `Bearer ${token}` },
    onUploadProgress: (e) => {
        const percent = (e.loaded / e.total) * 100
        setProgress(percent)  // Update progress bar
    }});
    
};