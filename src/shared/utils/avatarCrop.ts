import type { FileEntity } from '@/features/file/types/file.types';

export const AVATAR_CROP_SIZE = 280;
export const AVATAR_OUTPUT_SIZE = 512;
export const AVATAR_MIN_SCALE = 1;
export const AVATAR_MAX_SCALE = 4;

export type AvatarRotation = 0 | 90 | 180 | 270;

export interface AvatarCropState {
  imageWidth: number;
  imageHeight: number;
  cropSize: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: AvatarRotation;
}

export interface AvatarPreviewMetrics {
  frameSize: number;
  imageWidth: number;
  imageHeight: number;
  displayWidth: number;
  displayHeight: number;
  displayScale: number;
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片加载失败'));
    image.src = url;
  });
}

export function clampCropOffset(
  offsetX: number,
  offsetY: number,
  state: Pick<AvatarCropState, 'imageWidth' | 'imageHeight' | 'cropSize' | 'scale'> &
    Partial<Pick<AvatarCropState, 'rotation'>>
) {
  const { displayWidth, displayHeight } = getAvatarPreviewMetrics(state);
  const maxX = Math.max(0, (displayWidth - state.cropSize) / 2);
  const maxY = Math.max(0, (displayHeight - state.cropSize) / 2);

  return {
    offsetX: clamp(offsetX, -maxX, maxX),
    offsetY: clamp(offsetY, -maxY, maxY),
  };
}

export function getAvatarPreviewMetrics(
  state: Pick<AvatarCropState, 'imageWidth' | 'imageHeight' | 'cropSize' | 'scale'> &
    Partial<Pick<AvatarCropState, 'rotation'>>
): AvatarPreviewMetrics {
  const displayScale = getDisplayScale(state);
  const rotation = normalizeAvatarRotation(state.rotation || 0);
  const imageWidth = state.imageWidth * displayScale;
  const imageHeight = state.imageHeight * displayScale;
  const displayWidth = isSidewaysRotation(rotation) ? imageHeight : imageWidth;
  const displayHeight = isSidewaysRotation(rotation) ? imageWidth : imageHeight;

  return {
    frameSize: state.cropSize,
    imageWidth,
    imageHeight,
    displayWidth,
    displayHeight,
    displayScale,
  };
}

export function resizeAvatarCropState<T extends AvatarCropState>(state: T, cropSize: number): T {
  const nextState = { ...state, cropSize };
  return {
    ...nextState,
    ...clampCropOffset(nextState.offsetX, nextState.offsetY, nextState),
  };
}

export function rotateAvatarCropState<T extends AvatarCropState>(
  state: T,
  rotationDelta: number
): T {
  const nextState = {
    ...state,
    rotation: normalizeAvatarRotation(state.rotation + rotationDelta),
  };

  return {
    ...nextState,
    ...clampCropOffset(nextState.offsetX, nextState.offsetY, nextState),
  };
}

export function normalizeAvatarRotation(rotation: number): AvatarRotation {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized;
  }
  return 0;
}

export async function cropAvatarFile(
  file: File,
  imageUrl: string,
  state: AvatarCropState
): Promise<File> {
  const image = await loadImageFromUrl(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('当前浏览器不支持图片裁剪');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const metrics = getAvatarPreviewMetrics(state);
  const outputScale = AVATAR_OUTPUT_SIZE / state.cropSize;

  context.save();
  context.translate(AVATAR_OUTPUT_SIZE / 2, AVATAR_OUTPUT_SIZE / 2);
  context.scale(outputScale, outputScale);
  context.translate(state.offsetX, state.offsetY);
  context.rotate((normalizeAvatarRotation(state.rotation) * Math.PI) / 180);
  context.drawImage(
    image,
    -metrics.imageWidth / 2,
    -metrics.imageHeight / 2,
    metrics.imageWidth,
    metrics.imageHeight
  );
  context.restore();

  const mimeType = getOutputMimeType(file.type);
  const blob = await canvasToBlob(canvas, mimeType);
  return new File([blob], createAvatarFileName(file.name, mimeType), { type: mimeType });
}

export function getUploadedAvatarUrl(uploaded: Pick<FileEntity, 'id' | 'url'>) {
  return uploaded.url || `/api/v1/files/${uploaded.id}/public`;
}

function getDisplayScale(
  state: Pick<AvatarCropState, 'imageWidth' | 'imageHeight' | 'cropSize' | 'scale'> &
    Partial<Pick<AvatarCropState, 'rotation'>>
) {
  const rotation = normalizeAvatarRotation(state.rotation || 0);
  const baseWidth = isSidewaysRotation(rotation) ? state.imageHeight : state.imageWidth;
  const baseHeight = isSidewaysRotation(rotation) ? state.imageWidth : state.imageHeight;
  return (state.cropSize / Math.min(baseWidth, baseHeight)) * state.scale;
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('头像裁剪失败'));
    }, mimeType);
  });
}

function getOutputMimeType(mimeType: string) {
  if (mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/jpeg') {
    return mimeType;
  }

  return 'image/jpeg';
}

function createAvatarFileName(originalName: string, mimeType: string) {
  const safeName = originalName.replace(/[^\w.-]+/g, '-') || 'avatar';
  const hasExtension = /\.[^.]+$/.test(safeName);
  const extension =
    mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';

  return `avatar-${hasExtension ? safeName : `${safeName}${extension}`}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isSidewaysRotation(rotation: AvatarRotation) {
  return rotation === 90 || rotation === 270;
}
