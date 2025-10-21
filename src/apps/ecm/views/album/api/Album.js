import axios from 'axios';
// import Cookies from 'js-cookie';
import { getCookie } from './CookieFuntion.js';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';

export const urlImage = 'http://localhost:8080/api/photos/get_photo_author?pathFile='
// Tạo instance axios
const api = axios.create({
	baseURL: 'http://localhost:8080', // chỉnh lại nếu cần
	timeout: 10000,
});

// Interceptor để đẩy token lên header
api.interceptors.request.use(
	(config) => {
		// toastError({ message: 'Không tìm thấy token, vui lòng đăng nhập lại' });
		const token =getCookie('userDetail')?.id_user
            // console.log('token from cookie', token);
		
		if (token!=null ) {
			
        //     config.headers = {
        //     Authorization: `Bearer ${token}`,
        //     // 'Accept': 'application/json', // báo cho máy chủ muốn nhận dữ liệu response dạng json 
        //     // 'Content-Type': 'application/json'
			
			
        // }
		
		/// thay cho cái trên tránh ghi đè
		 config.headers.Authorization = `Bearer ${token}`;
		 
			

		}else{
			toastError({ message: 'Không tìm thấy token, vui lòng đăng nhập lại' });
		}


        
		return config;
	},
	(error) => Promise.reject(error)
);




// Hàm lấy danh sách ảnh theo folder id
export  const getPhotosByFolder=(folderId)=> {
	// const res =  api.get(`api/photos/folder/${folderId}`);
		return api.get(`api/photos/folder/${folderId}`);
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
      console.warn("⚠️ Không phải File:", f);
    }
  });

  // axios tự thêm header boundary, KHÔNG tự set Content-Type bằng tay
  return api.post("api/photos/create-photos", form, {
   
  });
};

export const getFoldersByFolder =(parentId)=>{
    return api.get(`api/folders/folders/${parentId}`);
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

export const getAllUser =( )=>{
	return api.get(`api/users/get-all`);
}

export const deleteImageHard = (idFile)=>{
return api.delete(`api/photos/${idFile}`);
}

/// api liên quan đế chia ser
export const getAllFolderShareWithUser =()=>{
	return api.get(`api/folders/folders-user-shared`);
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



