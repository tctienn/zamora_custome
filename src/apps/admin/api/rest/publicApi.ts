import type { UserUpdateNewPasswordInterface } from '@/apps/admin/model/User';
import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { CreateAccountRequest, DeleteDocumentRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/common/model/query';

const ADMIN_PUBLIC_URL = `${ADMIN_URL}/public`;

function forgotPasswordRest(data: ForgotPasswordRequest, options: object) {
  return baseApi.post(
    `${ADMIN_PUBLIC_URL}/forgot-password`,
    data,
    options
  );
}

function resetPasswordRest(data: ResetPasswordRequest, options: object) {
  return baseApi.post(
    `${ADMIN_PUBLIC_URL}/reset-password`,
    data,
    options
  );
}

function updateNewPasswordRest(data: ResetPasswordRequest, options: object) {
  return baseApi.post(
    `${ADMIN_PUBLIC_URL}/update-new-password`,
    data,
    options
  );
}

function findUserById(userId: string, options: object) {
  return baseApi.get<UserUpdateNewPasswordInterface>(
    `${ADMIN_PUBLIC_URL}/findUserById/${userId}`,
    options
  );
}

function createAccountRes(data: CreateAccountRequest, options: object) {
  return baseApi.post(
    `${ADMIN_PUBLIC_URL}/create-account`,
    data,
    options
  );
}

function deleteDocumentRes(data: DeleteDocumentRequest[], options: object) {
  return baseApi.post(
    `${ADMIN_PUBLIC_URL}/delete-document`,
    data,
    options
  );
}

export {
  createAccountRes,
  deleteDocumentRes,
  findUserById,
  forgotPasswordRest,
  resetPasswordRest,
  updateNewPasswordRest
};
