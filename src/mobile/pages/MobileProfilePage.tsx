import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { CameraOutlined } from '@ant-design/icons';
import { Button, Card, Input, List, Popup, Switch, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { UpdateProfileDto } from '@/features/auth/types/auth.types';
import { uploadFile } from '@/features/file/services/file.service';
import { useThemeStore } from '@/shared/stores';
import type { User } from '@/shared/types/user.types';
import {
  AVATAR_CROP_SIZE,
  clampCropOffset,
  cropAvatarFile,
  getUploadedAvatarUrl,
  loadImageFromUrl,
  type AvatarCropState,
} from '../utils/avatarCrop';
import { MobileModuleHeader } from '../components/MobileModuleHeader';

function displayName(user: User) {
  return user.realName || user.nickname || user.username;
}

function normalizeOptionalName(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
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

export function MobileProfilePage() {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileValues, setProfileValues] = useState({
    realName: '',
    nickname: '',
  });
  const [cropDraft, setCropDraft] = useState<AvatarCropDraft | null>(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    setProfileValues({
      realName: user?.realName || '',
      nickname: user?.nickname || '',
    });
  }, [user?.realName, user?.nickname]);

  useEffect(() => {
    return () => {
      if (cropDraft?.previewUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(cropDraft.previewUrl);
      }
    };
  }, [cropDraft?.previewUrl]);

  const handleProfileSave = async () => {
    if (!user) return;

    const values: UpdateProfileDto = {
      realName: normalizeOptionalName(profileValues.realName),
      nickname: normalizeOptionalName(profileValues.nickname),
    };

    setProfileSaving(true);
    try {
      const updatedUser = await authService.updateProfile(values);
      setUser(mergeAuthUser(user, updatedUser));
      Toast.show({ icon: 'success', content: '资料已更新', position: 'center' });
    } catch {
      Toast.show({ icon: 'fail', content: '资料保存失败', position: 'center' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
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
      });
    } catch {
      URL.revokeObjectURL(previewUrl);
      Toast.show({ icon: 'fail', content: '图片读取失败', position: 'center' });
    }
  };

  const closeCropSheet = () => {
    dragRef.current = null;
    setCropDraft(null);
  };

  const updateCropOffset = (offsetX: number, offsetY: number) => {
    setCropDraft((draft) => {
      if (!draft) return draft;
      return {
        ...draft,
        ...clampCropOffset(offsetX, offsetY, draft),
      };
    });
  };

  const updateCropScale = (scale: number) => {
    setCropDraft((draft) => {
      if (!draft) return draft;
      const nextDraft = { ...draft, scale };
      return {
        ...nextDraft,
        ...clampCropOffset(nextDraft.offsetX, nextDraft.offsetY, nextDraft),
      };
    });
  };

  const resetCrop = () => {
    setCropDraft((draft) =>
      draft
        ? {
            ...draft,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
          }
        : draft
    );
  };

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!cropDraft) return;

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: cropDraft.offsetX,
      offsetY: cropDraft.offsetY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;

    updateCropOffset(
      dragRef.current.offsetX + event.clientX - dragRef.current.startX,
      dragRef.current.offsetY + event.clientY - dragRef.current.startY
    );
  };

  const handleCropPointerEnd = () => {
    dragRef.current = null;
  };

  const handleAvatarSave = async () => {
    if (!cropDraft || !user) return;

    setAvatarUploading(true);
    try {
      const croppedFile = await cropAvatarFile(cropDraft.file, cropDraft.previewUrl, cropDraft);
      const uploaded = await uploadFile(croppedFile, {
        module: 'user-avatar',
        tags: 'avatar,profile',
        isPublic: true,
      });
      const avatar = getUploadedAvatarUrl(uploaded);
      const updatedUser = await authService.updateProfile({ avatar });
      setUser(mergeAuthUser(user, updatedUser));
      closeCropSheet();
      Toast.show({ icon: 'success', content: '头像已更新', position: 'center' });
    } catch {
      Toast.show({ icon: 'fail', content: '头像上传失败', position: 'center' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const cropImageStyle = cropDraft
    ? {
        width:
          (cropDraft.imageWidth * AVATAR_CROP_SIZE * cropDraft.scale) /
          Math.min(cropDraft.imageWidth, cropDraft.imageHeight),
        height:
          (cropDraft.imageHeight * AVATAR_CROP_SIZE * cropDraft.scale) /
          Math.min(cropDraft.imageWidth, cropDraft.imageHeight),
        transform: `translate(calc(-50% + ${cropDraft.offsetX}px), calc(-50% + ${cropDraft.offsetY}px))`,
      }
    : undefined;

  return (
    <div className="mobile-page">
      <MobileModuleHeader title="我的" />

      <Card className="mobile-card">
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
              <img src={user.avatar} alt={displayName(user)} />
            ) : (
              <span>{user ? displayName(user).slice(0, 1) : '-'}</span>
            )}
            <i>
              <CameraOutlined />
            </i>
          </button>
          <div className="mobile-profile-main">
            <div className="text-lg font-semibold">{user ? displayName(user) : '-'}</div>
            <div className="mobile-subtitle">{user?.email || user?.username}</div>
            <Button
              size="mini"
              className="mobile-profile-avatar-button"
              loading={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
            >
              更换头像
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mobile-card mt-3">
        <div className="mobile-profile-form">
          <label className="mobile-profile-field">
            <span>姓名</span>
            <Input
              value={profileValues.realName}
              maxLength={50}
              placeholder="请输入姓名"
              onChange={(realName) => setProfileValues((values) => ({ ...values, realName }))}
            />
          </label>
          <label className="mobile-profile-field">
            <span>昵称</span>
            <Input
              value={profileValues.nickname}
              maxLength={50}
              placeholder="请输入昵称"
              onChange={(nickname) => setProfileValues((values) => ({ ...values, nickname }))}
            />
          </label>
          <Button
            block
            color="primary"
            loading={profileSaving}
            onClick={() => void handleProfileSave()}
          >
            保存资料
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

      <Popup
        visible={!!cropDraft}
        onMaskClick={closeCropSheet}
        bodyStyle={{ borderRadius: '18px 18px 0 0' }}
      >
        <div className="mobile-popup-body mobile-avatar-crop-sheet">
          <div className="mobile-popup-header">
            <strong>裁剪头像</strong>
            <Button size="mini" fill="none" onClick={closeCropSheet}>
              关闭
            </Button>
          </div>

          {cropDraft ? (
            <>
              <div
                className="mobile-avatar-crop-frame"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerEnd}
                onPointerCancel={handleCropPointerEnd}
              >
                <img src={cropDraft.previewUrl} style={cropImageStyle} alt="头像预览" />
                <div className="mobile-avatar-crop-mask" />
              </div>

              <div className="mobile-avatar-crop-controls">
                <label>
                  <span>缩放</span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={cropDraft.scale}
                    onChange={(event) => updateCropScale(Number(event.target.value))}
                  />
                </label>
              </div>

              <div className="mobile-sheet-actions">
                <Button size="small" fill="outline" onClick={resetCrop}>
                  重置
                </Button>
                <div>
                  <Button size="small" fill="outline" onClick={closeCropSheet}>
                    取消
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    loading={avatarUploading}
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
