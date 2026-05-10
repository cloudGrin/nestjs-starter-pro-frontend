import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  CameraOutlined,
  EditOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, List, Popup, Switch, Toast } from 'antd-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { UpdateProfileDto } from '@/features/auth/types/auth.types';
import { uploadFile } from '@/features/file/services/file.service';
import { useThemeStore } from '@/shared/stores';
import type { User } from '@/shared/types/user.types';
import {
  AVATAR_CROP_SIZE,
  AVATAR_MAX_SCALE,
  AVATAR_MIN_SCALE,
  clampCropOffset,
  cropAvatarFile,
  getAvatarPreviewMetrics,
  getUploadedAvatarUrl,
  loadImageFromUrl,
  resizeAvatarCropState,
  rotateAvatarCropState,
  type AvatarCropState,
} from '@/shared/utils/avatarCrop';
import { MobileModuleHeader } from '../components/MobileModuleHeader';
import { clearMobilePersistedQueryCache } from '../pwa/queryPersistence';

function displayName(user: User) {
  return user.nickname || user.realName || user.username;
}

function normalizeOptionalName(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function isAvatarImageFile(file: File) {
  if (file.type.startsWith('image/')) {
    return true;
  }

  return /\.(avif|gif|heic|heif|jpe?g|png|webp)$/i.test(file.name);
}

function mergeAuthUser(currentUser: User | null, updatedUser: User): User {
  if (!currentUser) {
    return updatedUser;
  }

  return {
    ...currentUser,
    ...updatedUser,
    permissions: updatedUser.permissions ?? currentUser.permissions,
    roleCode: updatedUser.roleCode ?? currentUser.roleCode,
    isSuperAdmin: updatedUser.isSuperAdmin ?? currentUser.isSuperAdmin,
  };
}

interface AvatarCropDraft extends AvatarCropState {
  file: File;
  previewUrl: string;
}

interface CropPointer {
  x: number;
  y: number;
}

const AVATAR_CROP_POPUP_Z_INDEX = '1200';

export function MobileProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const activePointersRef = useRef<Map<number, CropPointer>>(new Map());
  const pinchRef = useRef<{
    startDistance: number;
    startScale: number;
  } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileValues, setProfileValues] = useState({
    realName: '',
    nickname: '',
  });
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [cropDraft, setCropDraft] = useState<AvatarCropDraft | null>(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setTheme);
  const cropPreviewUrl = cropDraft?.previewUrl;

  useEffect(() => {
    if (profilePopupOpen) return;

    setProfileValues({
      realName: user?.realName || '',
      nickname: user?.nickname || '',
    });
  }, [profilePopupOpen, user?.realName, user?.nickname]);

  useEffect(() => {
    return () => {
      if (cropPreviewUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(cropPreviewUrl);
      }
    };
  }, [cropPreviewUrl]);

  useEffect(() => {
    if (!cropPreviewUrl) return;

    const updateCropFrameSize = () => {
      const size = getMeasuredCropFrameSize();
      if (size > 0) {
        setCropDraft((draft) => (draft ? resizeAvatarCropState(draft, size) : draft));
      }
    };

    updateCropFrameSize();
    window.addEventListener('resize', updateCropFrameSize);
    return () => window.removeEventListener('resize', updateCropFrameSize);
  }, [cropPreviewUrl]);

  const handleProfileSave = async () => {
    if (!user || profileSaving) return;

    const values: UpdateProfileDto = {
      realName: normalizeOptionalName(profileValues.realName),
      nickname: normalizeOptionalName(profileValues.nickname),
    };

    setProfileSaving(true);
    try {
      const updatedUser = await authService.updateProfile(values);
      setUser(mergeAuthUser(user, updatedUser));
      setProfilePopupOpen(false);
      Toast.show({ icon: 'success', content: '资料已更新', position: 'center' });
    } catch {
      Toast.show({ icon: 'fail', content: '资料保存失败', position: 'center' });
    } finally {
      setProfileSaving(false);
    }
  };

  const openProfilePopup = () => {
    setProfileValues({
      realName: user?.realName || '',
      nickname: user?.nickname || '',
    });
    setProfilePopupOpen(true);
  };

  const closeProfilePopup = () => {
    if (profileSaving) return;

    setProfilePopupOpen(false);
  };

  const handleAvatarChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !user) return;

    if (!isAvatarImageFile(file)) {
      Toast.show({ icon: 'fail', content: '请选择图片文件', position: 'center' });
      return;
    }

    if (typeof URL.createObjectURL !== 'function') {
      Toast.show({ icon: 'fail', content: '当前浏览器不支持头像裁剪', position: 'center' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    try {
      const image = await loadImageFromUrl(previewUrl);
      setCropDraft({
        file,
        previewUrl,
        imageWidth: image.naturalWidth || image.width,
        imageHeight: image.naturalHeight || image.height,
        cropSize: AVATAR_CROP_SIZE,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      });
    } catch {
      URL.revokeObjectURL(previewUrl);
      Toast.show({ icon: 'fail', content: '图片读取失败', position: 'center' });
    }
  };

  const closeCropSheet = (options?: { force?: boolean }) => {
    if (avatarUploading && !options?.force) return;

    dragRef.current = null;
    pinchRef.current = null;
    activePointersRef.current.clear();
    setCropDraft(null);
  };

  const getMeasuredCropFrameSize = () => {
    const rect = cropFrameRef.current?.getBoundingClientRect();
    return rect ? Math.floor(Math.min(rect.width, rect.height)) : 0;
  };

  const updateCropOffset = (offsetX: number, offsetY: number) => {
    if (avatarUploading) return;

    setCropDraft((draft) => {
      if (!draft) return draft;
      return {
        ...draft,
        ...clampCropOffset(offsetX, offsetY, draft),
      };
    });
  };

  const updateCropScale = (scale: number) => {
    if (avatarUploading) return;

    setCropDraft((draft) => {
      if (!draft) return draft;
      const nextDraft = { ...draft, scale: clampValue(scale, AVATAR_MIN_SCALE, AVATAR_MAX_SCALE) };
      return {
        ...nextDraft,
        ...clampCropOffset(nextDraft.offsetX, nextDraft.offsetY, nextDraft),
      };
    });
  };

  const resetCrop = () => {
    if (avatarUploading) return;

    setCropDraft((draft) =>
      draft
        ? {
            ...draft,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
          }
        : draft
    );
  };

  const rotateCrop = (rotationDelta: number) => {
    if (avatarUploading) return;

    setCropDraft((draft) => (draft ? rotateAvatarCropState(draft, rotationDelta) : draft));
  };

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!cropDraft || avatarUploading) return;

    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (activePointersRef.current.size >= 2) {
      const [first, second] = Array.from(activePointersRef.current.values());
      pinchRef.current = {
        startDistance: getPointerDistance(first, second),
        startScale: cropDraft.scale,
      };
      dragRef.current = null;
    } else {
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: cropDraft.offsetX,
        offsetY: cropDraft.offsetY,
      };
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (avatarUploading) return;

    if (!activePointersRef.current.has(event.pointerId)) return;

    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (activePointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = Array.from(activePointersRef.current.values());
      const distance = getPointerDistance(first, second);
      const scaleRatio = pinchRef.current.startDistance
        ? distance / pinchRef.current.startDistance
        : 1;
      updateCropScale(pinchRef.current.startScale * scaleRatio);
      return;
    }

    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;

    updateCropOffset(
      dragRef.current.offsetX + event.clientX - dragRef.current.startX,
      dragRef.current.offsetY + event.clientY - dragRef.current.startY
    );
  };

  const handleCropPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchRef.current = null;
    }

    const remainingPointer = Array.from(activePointersRef.current.entries())[0];
    if (remainingPointer && cropDraft) {
      const [pointerId, pointer] = remainingPointer;
      dragRef.current = {
        pointerId,
        startX: pointer.x,
        startY: pointer.y,
        offsetX: cropDraft.offsetX,
        offsetY: cropDraft.offsetY,
      };
      return;
    }

    dragRef.current = null;
  };

  const handleAvatarSave = async () => {
    if (!cropDraft || !user || avatarUploading) return;

    setAvatarUploading(true);
    try {
      let croppedFile: File;
      try {
        const measuredCropSize = getMeasuredCropFrameSize();
        const cropState =
          measuredCropSize > 0 ? resizeAvatarCropState(cropDraft, measuredCropSize) : cropDraft;
        croppedFile = await cropAvatarFile(cropDraft.file, cropDraft.previewUrl, cropState);
      } catch {
        Toast.show({ icon: 'fail', content: '头像裁剪失败', position: 'center' });
        return;
      }

      let avatar: string;
      try {
        const uploaded = await uploadFile(croppedFile, {
          module: 'user-avatar',
          tags: 'avatar,profile',
          isPublic: false,
        });
        avatar = getUploadedAvatarUrl(uploaded);
      } catch {
        Toast.show({ icon: 'fail', content: '头像上传失败', position: 'center' });
        return;
      }

      let updatedUser: User;
      try {
        updatedUser = await authService.updateProfile({ avatar });
      } catch {
        Toast.show({ icon: 'fail', content: '资料更新失败', position: 'center' });
        return;
      }

      setUser(mergeAuthUser(user, updatedUser));
      closeCropSheet({ force: true });
      Toast.show({ icon: 'success', content: '头像已更新', position: 'center' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    clearMobilePersistedQueryCache();
    navigate('/login', { replace: true });
  };

  const cropMetrics = cropDraft ? getAvatarPreviewMetrics(cropDraft) : null;
  const cropImageLayerStyle = cropDraft
    ? {
        transform: `translate(-50%, -50%) translate(${cropDraft.offsetX}px, ${cropDraft.offsetY}px) rotate(${cropDraft.rotation}deg)`,
      }
    : undefined;
  const cropImageStyle = cropMetrics
    ? {
        width: cropMetrics.imageWidth,
        height: cropMetrics.imageHeight,
      }
    : undefined;
  const currentDisplayName = user ? displayName(user) : '-';
  // const nicknameLabel = user?.nickname ? `昵称 ${user.nickname}` : '昵称未设置';
  const realNameLabel = user?.realName ? `${user.realName}` : '姓名未设置';

  return (
    <div className="mobile-page">
      <MobileModuleHeader title="我的" />

      <Card className="mobile-card mobile-profile-hero-card">
        <div className="mobile-profile-card">
          <input
            ref={avatarInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(event) => {
              void handleAvatarChange(event.currentTarget.files);
              event.currentTarget.value = '';
            }}
          />
          <button
            className="mobile-profile-avatar"
            type="button"
            onClick={() => avatarInputRef.current?.click()}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={currentDisplayName} />
            ) : (
              <span>{currentDisplayName.slice(0, 1)}</span>
            )}
            <i>
              <CameraOutlined />
            </i>
          </button>
          <div className="mobile-profile-main">
            {/* <div className="mobile-profile-kicker">家庭账号</div> */}
            <div className="mobile-profile-name">{currentDisplayName}</div>
            {/* <div className="mobile-profile-subtitle">{profileContact}</div> */}
            <div className="mobile-profile-meta">
              <span>{realNameLabel}</span>
              {/* {user?.username ? <span>@{user.username}</span> : null} */}
            </div>
          </div>
          <Button className="mobile-profile-edit-button" size="mini" onClick={openProfilePopup}>
            <EditOutlined />
            <span>编辑资料</span>
          </Button>
        </div>
      </Card>

      <List className="mt-3">
        <List.Item
          extra={
            <Switch
              checked={themeMode === 'dark'}
              onChange={(checked: boolean) => setThemeMode(checked ? 'dark' : 'light')}
            />
          }
        >
          深色模式
        </List.Item>
      </List>

      <Button
        block
        className="mt-4!"
        color="danger"
        fill="outline"
        onClick={() => void handleLogout()}
      >
        退出登录
      </Button>

      {profilePopupOpen ? (
        <Popup
          visible
          onMaskClick={closeProfilePopup}
          bodyStyle={{ borderRadius: '18px 18px 0 0' }}
        >
          <div className="mobile-profile-edit-sheet">
            <div className="mobile-profile-edit-header">
              <div>
                <strong>编辑资料</strong>
                <span>更新显示名称和昵称</span>
              </div>
              <Button size="mini" fill="none" disabled={profileSaving} onClick={closeProfilePopup}>
                关闭
              </Button>
            </div>

            <div className="mobile-profile-edit-avatar-row">
              <button
                className="mobile-profile-edit-avatar"
                type="button"
                disabled={profileSaving}
                onClick={() => avatarInputRef.current?.click()}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={currentDisplayName} />
                ) : (
                  <span>{currentDisplayName.slice(0, 1)}</span>
                )}
                <i>
                  <CameraOutlined />
                </i>
              </button>
              <div>
                <strong>{currentDisplayName}</strong>
                <span>点击头像更新照片</span>
              </div>
            </div>

            <div className="mobile-profile-form">
              <label className="mobile-profile-field">
                <span>姓名</span>
                <Input
                  value={profileValues.realName}
                  maxLength={50}
                  disabled={profileSaving}
                  placeholder="请输入姓名"
                  onChange={(realName) => setProfileValues((values) => ({ ...values, realName }))}
                />
              </label>
              <label className="mobile-profile-field">
                <span>昵称</span>
                <Input
                  value={profileValues.nickname}
                  maxLength={50}
                  disabled={profileSaving}
                  placeholder="请输入昵称"
                  onChange={(nickname) => setProfileValues((values) => ({ ...values, nickname }))}
                />
              </label>
            </div>

            <div className="mobile-profile-edit-actions">
              <Button
                size="small"
                fill="outline"
                disabled={profileSaving}
                onClick={closeProfilePopup}
              >
                取消
              </Button>
              <Button
                size="small"
                color="primary"
                loading={profileSaving}
                disabled={profileSaving}
                onClick={() => void handleProfileSave()}
              >
                保存资料
              </Button>
            </div>
          </div>
        </Popup>
      ) : null}

      <Popup
        visible={!!cropDraft}
        closeOnMaskClick={false}
        mask
        onMaskClick={() => undefined}
        style={{ '--z-index': AVATAR_CROP_POPUP_Z_INDEX }}
        bodyStyle={{ borderRadius: '18px 18px 0 0' }}
      >
        <div className="mobile-popup-body mobile-avatar-crop-sheet">
          <div className="mobile-popup-header">
            <strong>裁剪头像</strong>
            <Button
              size="mini"
              fill="none"
              disabled={avatarUploading}
              onClick={() => closeCropSheet()}
            >
              关闭
            </Button>
          </div>

          {cropDraft ? (
            <>
              <div
                ref={cropFrameRef}
                className="mobile-avatar-crop-frame"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerEnd}
                onPointerCancel={handleCropPointerEnd}
              >
                <div className="mobile-avatar-crop-image-layer" style={cropImageLayerStyle}>
                  <img src={cropDraft.previewUrl} style={cropImageStyle} alt="头像预览" />
                </div>
                <div className="mobile-avatar-crop-mask" />
              </div>

              <div className="mobile-avatar-crop-controls">
                <label>
                  <span>缩放</span>
                  <input
                    type="range"
                    min={AVATAR_MIN_SCALE}
                    max={AVATAR_MAX_SCALE}
                    step="0.01"
                    value={cropDraft.scale}
                    disabled={avatarUploading}
                    onChange={(event) => updateCropScale(Number(event.target.value))}
                  />
                </label>
                <div className="mobile-avatar-crop-tools">
                  <Button
                    size="mini"
                    fill="outline"
                    disabled={avatarUploading}
                    onClick={() => rotateCrop(-90)}
                  >
                    <RotateLeftOutlined />
                    <span>左旋</span>
                  </Button>
                  <Button
                    size="mini"
                    fill="outline"
                    disabled={avatarUploading}
                    onClick={() => rotateCrop(90)}
                  >
                    <RotateRightOutlined />
                    <span>右旋</span>
                  </Button>
                </div>
              </div>

              <div className="mobile-sheet-actions">
                <Button size="small" fill="outline" disabled={avatarUploading} onClick={resetCrop}>
                  重置
                </Button>
                <div>
                  <Button
                    size="small"
                    fill="outline"
                    disabled={avatarUploading}
                    onClick={() => closeCropSheet()}
                  >
                    取消
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    loading={avatarUploading}
                    disabled={avatarUploading}
                    onClick={() => void handleAvatarSave()}
                  >
                    保存头像
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Popup>
    </div>
  );
}

function getPointerDistance(first: CropPointer, second: CropPointer) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
