export type UploadMode = 'local' | 'oss';

function resolveUploadMode(value?: string): UploadMode {
  return value === 'oss' ? 'oss' : 'local';
}

/**
 * 应用配置
 */
export const appConfig = {
  // 应用标题
  title: import.meta.env.VITE_APP_TITLE || 'home 管理后台',

  // API 基础 URL
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api/v1',

  // 家庭圈/群聊媒体上传模式。未接 OSS 时默认走本地上传。
  familyMediaUploadMode: resolveUploadMode(import.meta.env.VITE_FAMILY_MEDIA_UPLOAD_MODE),

  // 保险保单附件上传模式。默认跟随家庭媒体上传模式，接 OSS 时走浏览器直传。
  insuranceAttachmentUploadMode: resolveUploadMode(
    import.meta.env.VITE_INSURANCE_ATTACHMENT_UPLOAD_MODE ||
      import.meta.env.VITE_FAMILY_MEDIA_UPLOAD_MODE
  ),

  // Token 存储键名
  tokenKey: 'auth-token',
  refreshTokenKey: 'auth-refresh-token',

  // 默认分页大小
  defaultPageSize: 10,

  // 请求超时时间（毫秒）
  requestTimeout: 30000,
};
