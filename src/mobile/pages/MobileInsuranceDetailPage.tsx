import { useState } from 'react';
import { Button, Card, ImageViewer, List, NavBar, Tag, Toast } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { createFileAccessLink } from '@/features/file/services/file.service';
import { resolveFileAccessUrl } from '@/features/file/utils/file-url';
import { useInsurancePolicy } from '@/features/insurance/hooks/useInsurance';
import type { InsurancePolicyAttachment } from '@/features/insurance/types/insurance.types';
import {
  getPolicyMemberName,
  getPolicyOwnerName,
  getPolicyStatus,
  isPreviewableAttachment,
  mobilePolicyTypeLabels,
} from '../utils/insurance';

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '-';
}

function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return `¥${Number(value).toFixed(2)}`;
}

export function MobileInsuranceDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const policyId = Number(params.id);
  const policyQuery = useInsurancePolicy(Number.isInteger(policyId) ? policyId : undefined);
  const [previewImage, setPreviewImage] = useState('');
  const policy = policyQuery.data;
  const status = policy ? getPolicyStatus(policy) : null;

  const openAttachment = async (
    attachment: InsurancePolicyAttachment,
    disposition: 'inline' | 'attachment'
  ) => {
    try {
      const { url } = await createFileAccessLink(attachment.fileId, disposition);
      const resolved = resolveFileAccessUrl(url);
      const mimeType = attachment.file?.mimeType ?? '';
      if (disposition === 'inline' && mimeType.startsWith('image/')) {
        setPreviewImage(resolved);
        return;
      }
      window.open(resolved, '_blank');
    } catch {
      Toast.show({ icon: 'fail', content: '附件访问失败', position: 'center' });
    }
  };

  return (
    <div className="mobile-detail-page">
      <NavBar onBack={() => navigate(-1)}>保单详情</NavBar>
      <div className="mobile-detail-body mobile-detail-body-with-actions">
        {!policy ? (
          <Card className="mobile-card">{policyQuery.isLoading ? '加载中...' : '保单不存在'}</Card>
        ) : (
          <div className="mobile-section">
            <Card className="mobile-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="mobile-title">{policy.name}</h1>
                  <div className="mobile-subtitle">
                    {getPolicyMemberName(policy)} · {mobilePolicyTypeLabels[policy.type]}
                  </div>
                </div>
                {status ? <Tag color={status.color}>{status.label}</Tag> : null}
              </div>
            </Card>

            <List className="mobile-detail-list">
              <List.Item extra={policy.company || '-'}>保险公司</List.Item>
              <List.Item extra={policy.policyNo || '-'}>保单号</List.Item>
              <List.Item extra={getPolicyOwnerName(policy)}>负责人</List.Item>
              <List.Item extra={formatDate(policy.effectiveDate)}>生效日</List.Item>
              <List.Item extra={formatDate(policy.endDate)}>到期日</List.Item>
              <List.Item extra={formatDate(policy.nextPaymentDate)}>下次缴费日</List.Item>
              <List.Item extra={formatMoney(policy.paymentAmount)}>缴费金额</List.Item>
            </List>

            {policy.remark ? (
              <Card className="mobile-card">
                <div className="mb-2 font-semibold">备注</div>
                <div className="whitespace-pre-wrap">{policy.remark}</div>
              </Card>
            ) : null}

            <Card className="mobile-card">
              <div className="mb-2 font-semibold">附件</div>
              {policy.attachments?.length ? (
                <div className="mobile-section">
                  {policy.attachments.map((attachment) => (
                    <div
                      key={attachment.fileId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1 truncate">
                        {attachment.file?.originalName || `文件 #${attachment.fileId}`}
                      </div>
                      {isPreviewableAttachment(attachment) ? (
                        <Button
                          size="mini"
                          onClick={() => void openAttachment(attachment, 'inline')}
                        >
                          预览
                        </Button>
                      ) : null}
                      <Button
                        size="mini"
                        fill="outline"
                        onClick={() => void openAttachment(attachment, 'attachment')}
                      >
                        下载
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mobile-empty">暂无附件</div>
              )}
            </Card>
          </div>
        )}
      </div>
      {policy ? (
        <div className="mobile-bottom-actions">
          <Button size="small" fill="outline" onClick={() => navigate('/insurance')}>
            返回列表
          </Button>
          <div className="mobile-bottom-actions-right">
            <Button
              size="small"
              color="primary"
              loading={policyQuery.isFetching}
              onClick={() => void policyQuery.refetch()}
            >
              刷新
            </Button>
          </div>
        </div>
      ) : null}
      <ImageViewer
        image={previewImage}
        visible={Boolean(previewImage)}
        onClose={() => setPreviewImage('')}
      />
    </div>
  );
}
