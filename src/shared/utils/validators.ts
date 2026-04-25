/**
 * 表单验证规则
 *
 * 用途：
 * 1. Ant Design Form 验证
 * 2. React Hook Form 验证
 * 3. 自定义表单验证
 *
 * @example
 * // Ant Design Form
 * <Form.Item name="phone" rules={[{ required: true, ...validators.phone }]}>
 *   <Input />
 * </Form.Item>
 *
 * // React Hook Form
 * <input {...register('email', { pattern: validators.email.pattern })} />
 */

/**
 * 验证规则类型
 */
export interface ValidationRule {
  pattern: RegExp;
  message: string;
}

/**
 * 常用验证规则
 */
export const validators = {
  /** 手机号（中国大陆 11 位） */
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号',
  },

  /** 邮箱 */
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: '请输入正确的邮箱地址',
  },

  /** 密码强度（8-20位，包含大小写字母、数字、特殊字符） */
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    message: '密码必须包含大小写字母、数字和特殊字符，长度8-20位',
  },

  /** 弱密码（6-20位，字母、数字、特殊字符任意组合） */
  weakPassword: {
    pattern: /^[A-Za-z\d@$!%*?&]{6,20}$/,
    message: '密码长度为6-20位',
  },

  /** 用户名（4-20位，字母、数字、下划线） */
  username: {
    pattern: /^[a-zA-Z0-9_]{4,20}$/,
    message: '用户名只能包含字母、数字和下划线，长度4-20位',
  },

  /** 身份证号（18位） */
  idCard: {
    pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
    message: '请输入正确的身份证号',
  },

  /** URL */
  url: {
    pattern: /^https?:\/\/.+/,
    message: '请输入正确的URL地址（需包含http://或https://）',
  },

  /** IP地址 */
  ip: {
    pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    message: '请输入正确的IP地址',
  },

  /** 端口号（1-65535） */
  port: {
    pattern: /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
    message: '请输入正确的端口号（1-65535）',
  },

  /** 中文姓名（2-10位汉字） */
  chineseName: {
    pattern: /^[\u4e00-\u9fa5]{2,10}$/,
    message: '请输入正确的中文姓名（2-10个汉字）',
  },

  /** 纯数字 */
  number: {
    pattern: /^\d+$/,
    message: '请输入数字',
  },

  /** 整数 */
  integer: {
    pattern: /^-?\d+$/,
    message: '请输入整数',
  },

  /** 正整数 */
  positiveInteger: {
    pattern: /^[1-9]\d*$/,
    message: '请输入正整数',
  },

  /** 金额（保留2位小数） */
  money: {
    pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    message: '请输入正确的金额（最多2位小数）',
  },
} as const;

/**
 * 自定义验证函数
 */
export const customValidators = {
  /** 验证两次密码是否一致 */
  confirmPassword: (password: string) => ({
    validator(_: unknown, value: string) {
      if (!value || password === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('两次输入的密码不一致'));
    },
  }),

  /** 验证数字范围 */
  range: (min: number, max: number, fieldName: string = '值') => ({
    validator(_: unknown, value: number) {
      if (value >= min && value <= max) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(`${fieldName}必须在${min}到${max}之间`));
    },
  }),

  /** 验证文件大小（单位：MB） */
  fileSize: (maxSizeMB: number) => ({
    validator(_: unknown, file: File) {
      if (!file) return Promise.resolve();
      const sizeMB = file.size / 1024 / 1024;
      if (sizeMB <= maxSizeMB) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(`文件大小不能超过${maxSizeMB}MB`));
    },
  }),

  /** 验证文件类型 */
  fileType: (allowedTypes: string[]) => ({
    validator(_: unknown, file: File) {
      if (!file) return Promise.resolve();
      const fileType = file.type;
      if (allowedTypes.some((type) => fileType.includes(type))) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(`只允许上传${allowedTypes.join('、')}类型的文件`));
    },
  }),
};
