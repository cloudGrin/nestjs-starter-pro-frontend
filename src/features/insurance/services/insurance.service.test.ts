import { beforeEach, describe, expect, it, vi } from 'vitest';
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
});
