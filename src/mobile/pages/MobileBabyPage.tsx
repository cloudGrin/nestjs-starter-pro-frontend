import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, TextArea, Toast } from 'antd-mobile';
import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  useBabyOverview,
  useCreateBabyBirthdayContribution,
} from '@/features/family/hooks/useFamily';
import { familyService } from '@/features/family/services/family.service';
import type {
  BabyBirthday,
  BabyBirthdayMedia,
  BabyOverview,
  FamilyUserSummary,
} from '@/features/family/types/family.types';

function displayName(user?: FamilyUserSummary | null) {
  return user?.nickname || user?.realName || user?.username || '家人';
}

function formatBabyAge(birthDate?: string | null) {
  if (!birthDate) return '出生日期未设置';

  const birth = dayjs(birthDate).startOf('day');
  const today = dayjs().startOf('day');
  if (!birth.isValid()) return '出生日期未设置';

  const bornDays = Math.max(1, today.diff(birth, 'day') + 1);
  if (bornDays <= 90) {
    return `出生第 ${bornDays} 天`;
  }

  const totalMonths = today.diff(birth, 'month');
  if (totalMonths < 24) {
    const days = today.diff(birth.add(totalMonths, 'month'), 'day');
    return days > 0 ? `${totalMonths} 个月 ${days} 天` : `${totalMonths} 个月`;
  }

  const years = today.diff(birth, 'year');
  const months = today.diff(birth.add(years, 'year'), 'month');
  return months > 0 ? `${years} 岁 ${months} 个月` : `${years} 岁`;
}

function formatMetric(value?: number | null, unit?: string) {
  if (value == null) return '--';
  return `${Number(value).toString()} ${unit}`;
}

function formatDate(value?: string | null) {
  if (!value) return '';
  return dayjs(value).format('YYYY-MM-DD');
}

function avatarInitial(name?: string) {
  return (name || '宝').slice(0, 1);
}

export function MobileBabySummaryCard({
  overview,
  onClick,
}: {
  overview?: BabyOverview | null;
  onClick?: () => void;
}) {
  const profile = overview?.profile;
  if (!profile) return null;

  const latest = overview?.latestGrowthRecord;
  const measuredText = latest?.measuredAt
    ? `最近测量 ${formatDate(latest.measuredAt)}`
    : '暂无测量记录';

  return (
    <button className="mobile-baby-summary-card" type="button" onClick={onClick}>
      <span className="mobile-baby-avatar">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.nickname} />
        ) : (
          avatarInitial(profile.nickname)
        )}
      </span>
      <span className="mobile-baby-summary-main">
        <strong>{profile.nickname}</strong>
        <span>{formatBabyAge(profile.birthDate)}</span>
      </span>
      <span className="mobile-baby-summary-metrics">
        <span>{formatMetric(latest?.weightKg, 'kg')}</span>
        <span>{formatMetric(latest?.heightCm, 'cm')}</span>
        <small>{measuredText}</small>
      </span>
    </button>
  );
}

function BirthdayPhotoWall({
  media,
  onPreview,
}: {
  media: BabyBirthdayMedia[];
  onPreview: (index: number) => void;
}) {
  if (media.length === 0) {
    return <Empty description="还没有生日照片" />;
  }

  return (
    <div className="mobile-baby-photo-wall">
      {media.map((item, index) => (
        <button key={item.id} type="button" onClick={() => onPreview(index)}>
          <img src={item.displayUrl} alt="生日照片" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

function PhotoPreview({
  media,
  index,
  onClose,
}: {
  media: BabyBirthdayMedia[];
  index: number | null;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index ?? 0);

  useEffect(() => {
    setCurrent(index ?? 0);
  }, [index]);

  if (index === null || media.length === 0) return null;

  const safeIndex = Math.min(current, media.length - 1);
  const item = media[safeIndex];

  return (
    <div className="mobile-baby-preview">
      <div className="mobile-baby-preview-header">
        <button type="button" onClick={onClose}>
          <LeftOutlined />
        </button>
        <strong>
          {safeIndex + 1}/{media.length}
        </strong>
        <span />
      </div>
      <div className="mobile-baby-preview-body">
        <img src={item.displayUrl} alt="生日照片" />
      </div>
      {safeIndex > 0 ? (
        <button
          className="mobile-baby-preview-arrow previous"
          type="button"
          onClick={() => setCurrent(safeIndex - 1)}
        >
          <LeftOutlined />
        </button>
      ) : null}
      {safeIndex < media.length - 1 ? (
        <button
          className="mobile-baby-preview-arrow next"
          type="button"
          onClick={() => setCurrent(safeIndex + 1)}
        >
          <LeftOutlined />
        </button>
      ) : null}
    </div>
  );
}

function BirthdayContributionList({ birthday }: { birthday: BabyBirthday }) {
  if (birthday.contributions.length === 0) {
    return <Empty description="还没有家人祝福" />;
  }

  return (
    <div className="mobile-baby-wish-list">
      {birthday.contributions.map((item) => (
        <article key={item.id} className="mobile-baby-wish-card">
          <div className="mobile-baby-wish-author">
            <span>{avatarInitial(displayName(item.author))}</span>
            <div>
              <strong>{displayName(item.author)}</strong>
              <small>{formatDate(item.createdAt)}</small>
            </div>
          </div>
          {item.content ? <p>{item.content}</p> : null}
          {item.media.length > 0 ? (
            <div className="mobile-baby-wish-media">
              {item.media.slice(0, 3).map((media) => (
                <img key={media.id} src={media.displayUrl} alt="生日照片" loading="lazy" />
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function BirthdayComposer({
  birthday,
  open,
  submitting,
  onClose,
  onSubmit,
}: {
  birthday: BabyBirthday;
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (content: string, files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) {
      setContent('');
      setFiles([]);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="mobile-baby-composer">
      <div className="mobile-baby-composer-panel">
        <div className="mobile-baby-composer-header">
          <strong>{birthday.title}</strong>
          <button type="button" onClick={onClose}>
            取消
          </button>
        </div>
        <TextArea
          value={content}
          placeholder="写下生日祝福..."
          rows={3}
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={5000}
          onChange={setContent}
        />
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(event) => {
            setFiles(Array.from(event.currentTarget.files ?? []).slice(0, 9));
            event.currentTarget.value = '';
          }}
        />
        <div className="mobile-baby-composer-actions">
          <button type="button" onClick={() => inputRef.current?.click()}>
            <PlusOutlined />
            {files.length > 0 ? `${files.length} 张照片` : '添加照片'}
          </button>
          <Button
            className="mobile-baby-submit-button"
            loading={submitting}
            onClick={() => onSubmit(content, files)}
          >
            发送祝福
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MobileBabyPage() {
  const navigate = useNavigate();
  const overviewQuery = useBabyOverview();
  const createContribution = useCreateBabyBirthdayContribution();
  const overview = overviewQuery.data;
  const birthdays = useMemo(() => overview?.birthdays ?? [], [overview?.birthdays]);
  const [selectedBirthdayId, setSelectedBirthdayId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const selectedBirthday = useMemo(
    () => birthdays.find((item) => item.id === selectedBirthdayId),
    [birthdays, selectedBirthdayId]
  );

  const submitContribution = async (content: string, files: File[]) => {
    const trimmed = content.trim();
    if (!selectedBirthday || (!trimmed && files.length === 0)) {
      Toast.show({ content: '写点祝福或添加照片', position: 'center' });
      return;
    }

    setUploading(true);
    try {
      const mediaFileIds: number[] = [];
      for (const file of files) {
        const uploaded = await familyService.uploadBabyBirthdayImage(selectedBirthday.id, file);
        mediaFileIds.push(uploaded.id);
      }
      await createContribution.mutateAsync({
        birthdayId: selectedBirthday.id,
        data: { content: trimmed, mediaFileIds },
      });
      setComposerOpen(false);
      Toast.show({ content: '祝福已添加', position: 'center' });
    } catch {
      Toast.show({ icon: 'fail', content: '祝福发送失败', position: 'center' });
    } finally {
      setUploading(false);
    }
  };

  if (!overview?.profile && !overviewQuery.isLoading) {
    return (
      <main className="mobile-baby-page">
        <header className="mobile-baby-top-bar">
          <button type="button" onClick={() => navigate('/family')}>
            <LeftOutlined />
          </button>
          <h1>成长档案</h1>
          <span />
        </header>
        <Empty description="宝宝档案还未初始化" />
      </main>
    );
  }

  return (
    <main className="mobile-baby-page">
      <header className="mobile-baby-top-bar">
        <button type="button" onClick={() => navigate('/family')}>
          <LeftOutlined />
        </button>
        <h1>成长档案</h1>
        <span />
      </header>

      <section className="mobile-baby-hero">
        <MobileBabySummaryCard overview={overview} />
      </section>

      <section className="mobile-baby-section">
        <div className="mobile-baby-section-title">
          <h2>成长记录</h2>
          <span>{overview?.growthRecords.length ?? 0} 条</span>
        </div>
        <div className="mobile-baby-growth-list">
          {(overview?.growthRecords ?? []).slice(0, 5).map((item) => (
            <article key={item.id}>
              <strong>{formatDate(item.measuredAt)}</strong>
              <span>{formatMetric(item.weightKg, 'kg')}</span>
              <span>{formatMetric(item.heightCm, 'cm')}</span>
              {item.remark ? <small>{item.remark}</small> : null}
            </article>
          ))}
        </div>
      </section>

      {birthdays.length > 0 ? (
        <section className="mobile-baby-section">
          <div className="mobile-baby-section-title">
            <h2>生日合辑</h2>
            <span>{birthdays.length} 年</span>
          </div>
          <div className="mobile-baby-birthday-tabs">
            {birthdays.map((birthday) => (
              <button
                key={birthday.id}
                className={birthday.id === selectedBirthday?.id ? 'active' : undefined}
                type="button"
                onClick={() => setSelectedBirthdayId(birthday.id)}
              >
                <strong>{birthday.title}</strong>
                <span>{birthday.year}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {selectedBirthday ? (
        <section className="mobile-baby-birthday-detail">
          <div className="mobile-baby-birthday-cover">
            {selectedBirthday.coverUrl ? (
              <img src={selectedBirthday.coverUrl} alt={selectedBirthday.title} />
            ) : null}
            <div>
              <span>{selectedBirthday.year}</span>
              <h2>{selectedBirthday.title}</h2>
              <p>{selectedBirthday.description || '记录这一次生日的照片和家人祝福'}</p>
              <div>
                <small>{selectedBirthday.mediaCount} 张照片</small>
                <small>{selectedBirthday.contributionCount} 条祝福</small>
              </div>
            </div>
          </div>
          <BirthdayPhotoWall media={selectedBirthday.media} onPreview={setPreviewIndex} />
          <BirthdayContributionList birthday={selectedBirthday} />
          <button
            className="mobile-baby-add-wish-button"
            type="button"
            onClick={() => setComposerOpen(true)}
          >
            添加祝福
          </button>
          <PhotoPreview
            media={selectedBirthday.media}
            index={previewIndex}
            onClose={() => setPreviewIndex(null)}
          />
          <BirthdayComposer
            birthday={selectedBirthday}
            open={composerOpen}
            submitting={uploading || createContribution.isPending}
            onClose={() => setComposerOpen(false)}
            onSubmit={submitContribution}
          />
        </section>
      ) : null}
    </main>
  );
}
