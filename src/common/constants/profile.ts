export const PROFILE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  OLD: 'OLD'
} as const;

export type ProfileStatus = typeof PROFILE_STATUS[keyof typeof PROFILE_STATUS];

export const vietnamProvinces = [
  {
    id: 'Hà Nội',
    name: 'Hà Nội' 
  },
  {
    id: 'Hà Giang',
    name: 'Hà Giang' 
  },
  {
    id: 'Cao Bằng',
    name: 'Cao Bằng' 
  },
  {
    id: 'Bắc Kạn',
    name: 'Bắc Kạn' 
  },
  {
    id: 'Tuyên Quang',
    name: 'Tuyên Quang' 
  },
  {
    id: 'Lào Cai',
    name: 'Lào Cai' 
  },
  {
    id: 'Điện Biên',
    name: 'Điện Biên' 
  },
  {
    id: 'Lai Châu',
    name: 'Lai Châu' 
  },
  {
    id: 'Sơn La',
    name: 'Sơn La' 
  },
  {
    id: 'Yên Bái',
    name: 'Yên Bái' 
  },
  {
    id: 'Hòa Bình',
    name: 'Hòa Bình' 
  },
  {
    id: 'Thái Nguyên',
    name: 'Thái Nguyên' 
  },
  {
    id: 'Lạng Sơn',
    name: 'Lạng Sơn' 
  },
  {
    id: 'Quảng Ninh',
    name: 'Quảng Ninh' 
  },
  {
    id: 'Bắc Giang',
    name: 'Bắc Giang' 
  },
  {
    id: 'Phú Thọ',
    name: 'Phú Thọ' 
  },
  {
    id: 'Vĩnh Phúc',
    name: 'Vĩnh Phúc' 
  },
  {
    id: 'Bắc Ninh',
    name: 'Bắc Ninh' 
  },
  {
    id: 'Hải Dương',
    name: 'Hải Dương' 
  },
  {
    id: 'Hải Phòng',
    name: 'Hải Phòng' 
  },
  {
    id: 'Hưng Yên',
    name: 'Hưng Yên' 
  },
  {
    id: 'Thái Bình',
    name: 'Thái Bình' 
  },
  {
    id: 'Hà Nam',
    name: 'Hà Nam' 
  },
  {
    id: 'Nam Định',
    name: 'Nam Định' 
  },
  {
    id: 'Ninh Bình',
    name: 'Ninh Bình' 
  },
  {
    id: 'Thanh Hóa',
    name: 'Thanh Hóa' 
  },
  {
    id: 'Nghệ An',
    name: 'Nghệ An' 
  },
  {
    id: 'Hà Tĩnh',
    name: 'Hà Tĩnh' 
  },
  {
    id: 'Quảng Bình',
    name: 'Quảng Bình' 
  },
  {
    id: 'Quảng Trị',
    name: 'Quảng Trị' 
  },
  {
    id: 'Thừa Thiên Huế',
    name: 'Thừa Thiên Huế' 
  },
  {
    id: 'Đà Nẵng',
    name: 'Đà Nẵng' 
  },
  {
    id: 'Quảng Nam',
    name: 'Quảng Nam' 
  },
  {
    id: 'Quảng Ngãi',
    name: 'Quảng Ngãi' 
  },
  {
    id: 'Bình Định',
    name: 'Bình Định' 
  },
  {
    id: 'Phú Yên',
    name: 'Phú Yên' 
  },
  {
    id: 'Khánh Hòa',
    name: 'Khánh Hòa' 
  },
  {
    id: 'Ninh Thuận',
    name: 'Ninh Thuận' 
  },
  {
    id: 'Bình Thuận',
    name: 'Bình Thuận' 
  },
  {
    id: 'Kon Tum',
    name: 'Kon Tum' 
  },
  {
    id: 'Gia Lai',
    name: 'Gia Lai' 
  },
  {
    id: 'Đắk Lắk',
    name: 'Đắk Lắk' 
  },
  {
    id: 'Đắk Nông',
    name: 'Đắk Nông' 
  },
  {
    id: 'Lâm Đồng',
    name: 'Lâm Đồng' 
  },
  {
    id: 'Bình Phước',
    name: 'Bình Phước' 
  },
  {
    id: 'Tây Ninh',
    name: 'Tây Ninh' 
  },
  {
    id: 'Bình Dương',
    name: 'Bình Dương' 
  },
  {
    id: 'Đồng Nai',
    name: 'Đồng Nai' 
  },
  {
    id: 'Bà Rịa - Vũng Tàu',
    name: 'Bà Rịa - Vũng Tàu' 
  },
  {
    id: 'TP. Hồ Chí Minh',
    name: 'TP. Hồ Chí Minh' 
  },
  {
    id: 'Long An',
    name: 'Long An' 
  },
  {
    id: 'Tiền Giang',
    name: 'Tiền Giang' 
  },
  {
    id: 'Bến Tre',
    name: 'Bến Tre' 
  },
  {
    id: 'Trà Vinh',
    name: 'Trà Vinh' 
  },
  {
    id: 'Vĩnh Long',
    name: 'Vĩnh Long' 
  },
  {
    id: 'Đồng Tháp',
    name: 'Đồng Tháp' 
  },
  {
    id: 'An Giang',
    name: 'An Giang' 
  },
  {
    id: 'Kiên Giang',
    name: 'Kiên Giang' 
  },
  {
    id: 'Cần Thơ',
    name: 'Cần Thơ' 
  },
  {
    id: 'Hậu Giang',
    name: 'Hậu Giang' 
  },
  {
    id: 'Sóc Trăng',
    name: 'Sóc Trăng' 
  },
  {
    id: 'Bạc Liêu',
    name: 'Bạc Liêu' 
  },
  {
    id: 'Cà Mau',
    name: 'Cà Mau' 
  }
];

