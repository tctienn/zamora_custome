export const allowedFileTypes = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const allowedFileExtensions = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.webp'
];

/**
 * ✅ Hàm kiểm tra một file có hợp lệ không
 */
export function isValidFile(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return allowedFileTypes.includes(file.type) || allowedFileExtensions.includes(ext);
}

/**
 * ✅ Hàm định dạng dung lượng file
 */
export function formatFileSize(size: number): string {
  const mb = size / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(size / 1024).toFixed(2)} KB`;
}

/**
 * ✅ Hàm validate danh sách file
 */
export function validateFilesCommon(
  files: File[],
  options?: {
        maxSize?: number; // MB
        maxCount?: number;
    }
): string[] {
  const errors: string[] = [];
  const { maxSize = 50, maxCount = 5 } = options || {};

  if (files.length > maxCount) {
    errors.push(`Chỉ được chọn tối đa ${maxCount} file.`);
  }

  for (const file of files) {
    if (!isValidFile(file)) {
      errors.push(`"${file.name}" không đúng định dạng được hỗ trợ.`);
    }

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      errors.push(`"${file.name}" vượt quá dung lượng ${maxSize}MB (kích thước: ${formatFileSize(file.size)}).`);
    }
  }

  return errors;
}
