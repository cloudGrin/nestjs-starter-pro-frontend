/**
 * validators.ts 单元测试
 *
 * 测试覆盖：
 * 1. 所有正则验证规则（14个）
 * 2. 所有自定义验证函数（4个）
 * 3. 边界情况测试
 */

import { describe, it, expect } from 'vitest';
import { validators, customValidators } from '../validators';

describe('validators - 正则验证规则', () => {
  describe('phone - 手机号验证', () => {
    it('应该接受有效的手机号', () => {
      const validPhones = ['13800138000', '15912345678', '18612345678', '19912345678'];
      validPhones.forEach((phone) => {
        expect(validators.phone.pattern.test(phone)).toBe(true);
      });
    });

    it('应该拒绝无效的手机号', () => {
      const invalidPhones = [
        '12345678901', // 不是1开头
        '1381234567', // 少于11位
        '138123456789', // 多于11位
        '10012345678', // 第二位不是3-9
        'abcdefghijk', // 字母
      ];
      invalidPhones.forEach((phone) => {
        expect(validators.phone.pattern.test(phone)).toBe(false);
      });
    });
  });

  describe('email - 邮箱验证', () => {
    it('应该接受有效的邮箱', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'first+last@example.org',
        '123@test.com',
      ];
      validEmails.forEach((email) => {
        expect(validators.email.pattern.test(email)).toBe(true);
      });
    });

    it('应该拒绝无效的邮箱', () => {
      const invalidEmails = [
        'plaintext',
        '@example.com',
        'user@',
        'user @example.com', // 包含空格
        'user@example', // 缺少顶级域名
      ];
      invalidEmails.forEach((email) => {
        expect(validators.email.pattern.test(email)).toBe(false);
      });
    });
  });

  describe('password - 强密码验证', () => {
    it('应该接受有效的强密码', () => {
      const validPasswords = [
        'Abcd1234@',
        'Test123!',
        'MyP@ssw0rd',
        'Secure$Pass1',
      ];
      validPasswords.forEach((pwd) => {
        expect(validators.password.pattern.test(pwd)).toBe(true);
      });
    });

    it('应该拒绝无效的强密码', () => {
      const invalidPasswords = [
        'abc123', // 缺少大写和特殊字符
        'ABCD1234@', // 缺少小写
        'Abcd@@@@@', // 缺少数字
        'Abcd1234', // 缺少特殊字符
        'Ab1@', // 少于8位
        'Abcd1234@' + 'a'.repeat(15), // 超过20位
      ];
      invalidPasswords.forEach((pwd) => {
        expect(validators.password.pattern.test(pwd)).toBe(false);
      });
    });
  });

  describe('weakPassword - 弱密码验证', () => {
    it('应该接受有效的弱密码', () => {
      const validPasswords = ['abc123', 'Test@123', 'password', '123456'];
      validPasswords.forEach((pwd) => {
        expect(validators.weakPassword.pattern.test(pwd)).toBe(true);
      });
    });

    it('应该拒绝无效的弱密码', () => {
      const invalidPasswords = [
        'abc', // 少于6位
        'a'.repeat(21), // 超过20位
        'test 123', // 包含空格
        '测试123', // 包含中文
      ];
      invalidPasswords.forEach((pwd) => {
        expect(validators.weakPassword.pattern.test(pwd)).toBe(false);
      });
    });
  });

  describe('username - 用户名验证', () => {
    it('应该接受有效的用户名', () => {
      const validUsernames = ['user', 'test_user', 'User123', 'my_name_123'];
      validUsernames.forEach((username) => {
        expect(validators.username.pattern.test(username)).toBe(true);
      });
    });

    it('应该拒绝无效的用户名', () => {
      const invalidUsernames = [
        'abc', // 少于4位
        'a'.repeat(21), // 超过20位
        'user-name', // 包含连字符
        'user name', // 包含空格
        '用户', // 包含中文
      ];
      invalidUsernames.forEach((username) => {
        expect(validators.username.pattern.test(username)).toBe(false);
      });
    });
  });

  describe('idCard - 身份证号验证', () => {
    it('应该接受有效的身份证号', () => {
      // 使用真实格式但虚构的身份证号
      const validIdCards = ['110101199001011234', '310101200012121234', '440301198801015678'];
      validIdCards.forEach((id) => {
        expect(validators.idCard.pattern.test(id)).toBe(true);
      });
    });

    it('应该拒绝无效的身份证号', () => {
      const invalidIdCards = [
        '12345678901234567', // 少于18位
        '110101210001011234', // 年份错误（2100，超出18-20世纪）
        '110101199013011234', // 月份错误（13）
        '110101199001321234', // 日期错误（32）
        '01010119900101123X', // 前两位不是1-9
      ];
      invalidIdCards.forEach((id) => {
        expect(validators.idCard.pattern.test(id)).toBe(false);
      });
    });
  });

  describe('url - URL验证', () => {
    it('应该接受有效的URL', () => {
      const validUrls = [
        'http://example.com',
        'https://www.example.com',
        'https://example.com/path?query=value',
        'http://localhost:3000',
      ];
      validUrls.forEach((url) => {
        expect(validators.url.pattern.test(url)).toBe(true);
      });
    });

    it('应该拒绝无效的URL', () => {
      const invalidUrls = [
        'example.com', // 缺少协议
        'ftp://example.com', // 非http/https
        'www.example.com', // 缺少协议
      ];
      invalidUrls.forEach((url) => {
        expect(validators.url.pattern.test(url)).toBe(false);
      });
    });
  });

  describe('ip - IP地址验证', () => {
    it('应该接受有效的IP地址', () => {
      const validIps = ['192.168.1.1', '10.0.0.1', '255.255.255.255', '0.0.0.0'];
      validIps.forEach((ip) => {
        expect(validators.ip.pattern.test(ip)).toBe(true);
      });
    });

    it('应该拒绝无效的IP地址', () => {
      const invalidIps = [
        '256.1.1.1', // 超过255
        '192.168.1', // 缺少一段
        '192.168.1.1.1', // 多一段
        'a.b.c.d', // 字母
      ];
      invalidIps.forEach((ip) => {
        expect(validators.ip.pattern.test(ip)).toBe(false);
      });
    });
  });

  describe('port - 端口号验证', () => {
    it('应该接受有效的端口号', () => {
      const validPorts = ['1', '80', '443', '3000', '8080', '65535'];
      validPorts.forEach((port) => {
        expect(validators.port.pattern.test(port)).toBe(true);
      });
    });

    it('应该拒绝无效的端口号', () => {
      const invalidPorts = [
        '0', // 0不是有效端口
        '65536', // 超过最大值
        '-1', // 负数
        'abc', // 字母
      ];
      invalidPorts.forEach((port) => {
        expect(validators.port.pattern.test(port)).toBe(false);
      });
    });
  });

  describe('chineseName - 中文姓名验证', () => {
    it('应该接受有效的中文姓名', () => {
      const validNames = ['张三', '李四', '王五六', '欧阳修复'];
      validNames.forEach((name) => {
        expect(validators.chineseName.pattern.test(name)).toBe(true);
      });
    });

    it('应该拒绝无效的中文姓名', () => {
      const invalidNames = [
        '张', // 少于2个字
        '张三李四王五六七八九十一', // 超过10个字
        'Zhang San', // 英文
        '张 三', // 包含空格
        '张三123', // 包含数字
      ];
      invalidNames.forEach((name) => {
        expect(validators.chineseName.pattern.test(name)).toBe(false);
      });
    });
  });

  describe('number - 纯数字验证', () => {
    it('应该接受有效的纯数字', () => {
      const validNumbers = ['0', '123', '9999'];
      validNumbers.forEach((num) => {
        expect(validators.number.pattern.test(num)).toBe(true);
      });
    });

    it('应该拒绝无效的纯数字', () => {
      const invalidNumbers = ['-1', '12.34', '1a2', ' 123'];
      invalidNumbers.forEach((num) => {
        expect(validators.number.pattern.test(num)).toBe(false);
      });
    });
  });

  describe('integer - 整数验证', () => {
    it('应该接受有效的整数', () => {
      const validIntegers = ['0', '123', '-456'];
      validIntegers.forEach((num) => {
        expect(validators.integer.pattern.test(num)).toBe(true);
      });
    });

    it('应该拒绝无效的整数', () => {
      const invalidIntegers = ['12.34', '1a2', ' 123'];
      invalidIntegers.forEach((num) => {
        expect(validators.integer.pattern.test(num)).toBe(false);
      });
    });
  });

  describe('positiveInteger - 正整数验证', () => {
    it('应该接受有效的正整数', () => {
      const validNumbers = ['1', '123', '9999'];
      validNumbers.forEach((num) => {
        expect(validators.positiveInteger.pattern.test(num)).toBe(true);
      });
    });

    it('应该拒绝无效的正整数', () => {
      const invalidNumbers = ['0', '-1', '12.34'];
      invalidNumbers.forEach((num) => {
        expect(validators.positiveInteger.pattern.test(num)).toBe(false);
      });
    });
  });

  describe('money - 金额验证', () => {
    it('应该接受有效的金额', () => {
      const validAmounts = ['0', '123', '12.3', '12.34', '1000.00'];
      validAmounts.forEach((amount) => {
        expect(validators.money.pattern.test(amount)).toBe(true);
      });
    });

    it('应该拒绝无效的金额', () => {
      const invalidAmounts = [
        '-1', // 负数
        '12.345', // 超过2位小数
        'abc', // 字母
      ];
      invalidAmounts.forEach((amount) => {
        expect(validators.money.pattern.test(amount)).toBe(false);
      });
    });
  });
});

describe('customValidators - 自定义验证函数', () => {
  describe('confirmPassword - 密码一致性验证', () => {
    it('密码一致时应该通过', async () => {
      const validator = customValidators.confirmPassword('password123');
      await expect(validator.validator(null, 'password123')).resolves.toBeUndefined();
    });

    it('密码不一致时应该失败', async () => {
      const validator = customValidators.confirmPassword('password123');
      await expect(validator.validator(null, 'different')).rejects.toThrow(
        '两次输入的密码不一致'
      );
    });

    it('确认密码为空时应该通过', async () => {
      const validator = customValidators.confirmPassword('password123');
      await expect(validator.validator(null, '')).resolves.toBeUndefined();
    });
  });

  describe('range - 数字范围验证', () => {
    it('在范围内的值应该通过', async () => {
      const validator = customValidators.range(1, 100);
      await expect(validator.validator(null, 50)).resolves.toBeUndefined();
      await expect(validator.validator(null, 1)).resolves.toBeUndefined();
      await expect(validator.validator(null, 100)).resolves.toBeUndefined();
    });

    it('超出范围的值应该失败', async () => {
      const validator = customValidators.range(1, 100);
      await expect(validator.validator(null, 0)).rejects.toThrow('值必须在1到100之间');
      await expect(validator.validator(null, 101)).rejects.toThrow('值必须在1到100之间');
    });

    it('应该支持自定义字段名', async () => {
      const validator = customValidators.range(1, 10, '年龄');
      await expect(validator.validator(null, 0)).rejects.toThrow('年龄必须在1到10之间');
    });
  });

  describe('fileSize - 文件大小验证', () => {
    it('文件大小在限制内应该通过', async () => {
      const file = new File(['a'.repeat(1024 * 1024)], 'test.txt', { type: 'text/plain' }); // 1MB
      const validator = customValidators.fileSize(2);
      await expect(validator.validator(null, file)).resolves.toBeUndefined();
    });

    it('文件大小超过限制应该失败', async () => {
      const file = new File(['a'.repeat(3 * 1024 * 1024)], 'test.txt', {
        type: 'text/plain',
      }); // 3MB
      const validator = customValidators.fileSize(2);
      await expect(validator.validator(null, file)).rejects.toThrow('文件大小不能超过2MB');
    });

    it('文件为空时应该通过', async () => {
      const validator = customValidators.fileSize(2);
      await expect(validator.validator(null, null as any)).resolves.toBeUndefined();
    });
  });

  describe('fileType - 文件类型验证', () => {
    it('允许的文件类型应该通过', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const validator = customValidators.fileType(['image']);
      await expect(validator.validator(null, file)).resolves.toBeUndefined();
    });

    it('不允许的文件类型应该失败', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const validator = customValidators.fileType(['image', 'video']);
      await expect(validator.validator(null, file)).rejects.toThrow(
        '只允许上传image、video类型的文件'
      );
    });

    it('文件为空时应该通过', async () => {
      const validator = customValidators.fileType(['image']);
      await expect(validator.validator(null, null as any)).resolves.toBeUndefined();
    });

    it('应该支持多种文件类型', async () => {
      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const validator = customValidators.fileType(['image', 'pdf']);

      await expect(validator.validator(null, imageFile)).resolves.toBeUndefined();
      await expect(validator.validator(null, pdfFile)).resolves.toBeUndefined();
    });
  });
});
