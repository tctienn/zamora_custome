// import { toast } from "vue3-toastify";  nếu cần tạo thông báo xác nhận thì dùng thư viện này

// export const domain = ''
// export const domain = 'http://localhost:8080'

// const name ='login_token';
export const taocock = (name, token) => {
  const textToken = JSON.stringify(token)
  // console.log('create token',textToken)
  // document.cookie = name + "=" + textToken + ";   max-age=" + 2400 + "; path=/"; //Thuộc tính httpOnly cho biết cookie không thể được truy cập bởi mã JavaScript, nhằm ngăn chặn các cuộc tấn công XSS
  //  thời gian tồn tại 40 phút
  //Thuộc tính secure cho biết cookie chỉ được gửi qua giao thức HTTPS, nhằm bảo vệ cookie khỏi bị đánh cắp bởi các bên thứ ba
const encoded = encodeURIComponent(textToken)
  document.cookie=`${name}=${encoded}; Max-Age=24000; Path=/; SameSite=None; Secure`

}

// export function getCookie(name) {
//   // Lấy tất cả các cookie
//   let cookies = document.cookie;
//   // Tách chuỗi thành mảng các cặp khóa-giá trị
//   let cookieArray = cookies.split(';');
//   // Duyệt qua mảng để tìm khóa mong muốn
//   for (let i = 0; i < cookieArray.length; i++) {
//     // Loại bỏ khoảng trắng thừa
//     let cookiePair = cookieArray[i].trim();
//     // Kiểm tra xem khóa có khớp với tên không
//     if (cookiePair.indexOf(name + '=') == 0) {
//       // Trả về giá trị của cookie
//       // console.log(cookiePair.substring(name.length + 1, cookiePair.length))
//       // JSON.parse(cookiePair.substring(name.length + 1, cookiePair.length));
//       const tokenJson = JSON.parse(cookiePair.substring(name.length + 1, cookiePair.length))
//       return tokenJson;  // cắt chuỗi bỏ đi phần name 
//     }
//   }
//   // Nếu không tìm thấy khóa, trả về null
//   console.log('không tìm thấy khóa cookie nào cả ')
//   return null;
// }
export function getCookie(name) {
  // Lấy tất cả các cookie
  const cookies = document.cookie;
  // Tách chuỗi thành mảng các cặp khóa-giá trị
  const cookieArray = cookies.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookiePair = cookieArray[i].trim();

    // Kiểm tra xem khóa có khớp với tên không
    if (cookiePair.indexOf(name + '=') === 0) {
      const value = cookiePair.substring(name.length + 1);
      try {
        // ✅ Giải mã URI trước khi parse JSON
        const decoded = decodeURIComponent(value);
        const tokenJson = JSON.parse(decoded);
        return tokenJson;
      } catch (err) {
        console.error(' Cookie parse lỗi:', err, value);
        return null;
      }
    }
  }

  console.log('Không tìm thấy khóa cookie nào cả');
  return null;
}

export function deleteCookie(name) {
  // Kiểm tra xem cookie có tồn tại không
  if (getCookie(name)) {
    // Nếu tồn tại, đặt lại cookie với thời gian hết hạn đã qua
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}



///  coppy funtion
export    function  copyToClipboard (stringData) {
  // const text = document.getElementById(stringData).innerText;
  navigator.clipboard.writeText(stringData).then(() => {
    alert("Đã copy thành công!");
  }).catch(err => {
    console.error("Lỗi khi copy: ", err);
    alter("Lỗi khi copy: ")
  });
}


///lấy token từ localstorate
export function getToken(key) {
    const userData = localStorage.getItem(key);
    if (!userData) return null; // chưa đăng nhập

    try {
        const userObj = JSON.parse(userData);
        // userObj.authentication = "Bearer token_xxx"
        return userObj.authentication?.replace('Bearer ', '') || null;
    } catch (e) {
        return null;
    }
}
