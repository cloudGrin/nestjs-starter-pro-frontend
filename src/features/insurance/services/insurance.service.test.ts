import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { request } from '@/shared/utils/request';
import { insuranceService } from './insurance.service';

vi.mock('@/shared/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('insuranceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps member and policy endpoints to backend routes', () => {
    insuranceService.getMembers();
    insuranceService.createMember({ name: '妈妈', relationship: '母亲' });
    insuranceService.updateMember(3, { sort: 2 });
    insuranceService.deleteMember(3);

    insuranceService.getPolicies({
      page: 1,
      limit: 10,
      memberId: 3,
      type: 'medical',
      sort: 'endDate',
      order: 'ASC',
    });
    insuranceService.getPolicy(9);
    insuranceService.createPolicy({
      name: '家庭百万医疗',
      memberId: 3,
      type: 'medical',
      ownerUserId: 7,
      attachmentFileIds: [21],
    });
    insuranceService.updatePolicy(9, { remark: '已核对' });
    insuranceService.deletePolicy(9);
    insuranceService.getFamilyView();

    expect(request.get).toHaveBeenCalledWith('/insurance-members');
    expect(request.post).toHaveBeenCalledWith(
      '/insurance-members',
      { name: '妈妈', relationship: '母亲' },
      expect.any(Object)
    );
    expect(request.put).toHaveBeenCalledWith(
      '/insurance-members/3',
      { sort: 2 },
      expect.any(Object)
    );
    expect(request.delete).toHaveBeenCalledWith('/insurance-members/3', expect.any(Object));
    expect(request.get).toHaveBeenCalledWith('/insurance-policies', {
      params: {
        page: 1,
        limit: 10,
        memberId: 3,
        type: 'medical',
        sort: 'endDate',
        order: 'ASC',
      },
    });
    expect(request.get).toHaveBeenCalledWith('/insurance-policies/9');
    expect(request.post).toHaveBeenCalledWith(
      '/insurance-policies',
      {
        name: '家庭百万医疗',
        memberId: 3,
        type: 'medical',
        ownerUserId: 7,
        attachmentFileIds: [21],
      },
      expect.any(Object)
    );
    expect(request.put).toHaveBeenCalledWith(
      '/insurance-policies/9',
      { remark: '已核对' },
      expect.any(Object)
    );
    expect(request.delete).toHaveBeenCalledWith('/insurance-policies/9', expect.any(Object));
    expect(request.get).toHaveBeenCalledWith('/insurance-policies/family-view');
  });

  it('builds attachment download URLs under the policy endpoint', () => {
    expect(insuranceService.getAttachmentDownloadUrl(9, 21)).toBe(
      '/api/v1/insurance-policies/9/attachments/21/download'
    );
  });

  it('uploads policy attachments through the insurance attachment endpoint', async () => {
    vi.mocked(request.post).mockResolvedValue({ id: 21 });
    const file = new File(['contract'], 'policy-contract.pdf', { type: 'application/pdf' });

    await insuranceService.uploadAttachment(file, { storage: 'local' });

    expect(request.post).toHaveBeenCalledWith(
      '/insurance-policies/attachments/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
    const formData = vi.mocked(request.post).mock.calls[0][1] as FormData;
    expect(formData.get('file')).toBe(file);
  });

  it('uses insurance direct upload endpoints for OSS policy attachments', async () => {
    const file = new File(['contract'], 'policy-contract.pdf', { type: 'application/pdf' });
    vi.mocked(request.post)
      .mockResolvedValueOnce({
        method: 'PUT',
        uploadUrl: 'https://oss.example.com/policy-contract.pdf',
        uploadToken: 'token-1',
        expiresAt: '2026-05-01T00:15:00.000Z',
        headers: { 'Content-Type': 'application/pdf' },
      })
      .mockResolvedValueOnce({ id: 21 });
    vi.mocked(axios.put).mockResolvedValue({ status: 200 });

    await insuranceService.uploadAttachment(file, { storage: 'oss' });

    expect(request.post).toHaveBeenNthCalledWith(
      1,
      '/insurance-policies/attachments/direct-upload/initiate',
      {
        originalName: 'policy-contract.pdf',
        mimeType: 'application/pdf',
        size: file.size,
      },
      expect.any(Object)
    );
    expect(axios.put).toHaveBeenCalledWith(
      'https://oss.example.com/policy-contract.pdf',
      file,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/pdf' },
      })
    );
    expect(request.post).toHaveBeenNthCalledWith(
      2,
      '/insurance-policies/attachments/direct-upload/complete',
      { uploadToken: 'token-1' },
      expect.any(Object)
    );
  });
});
