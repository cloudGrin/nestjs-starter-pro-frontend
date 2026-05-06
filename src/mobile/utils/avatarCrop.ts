import type { FileEntity } from '@/features/file/types/file.types';

export const AVATAR_CROP_SIZE = 280;
export const AVATAR_OUTPUT_SIZE = 512;

export interface AvatarCropState {
  imageWidth: number;
  imageHeight: number;
  cropSize: number;
  scale: number;
  offsetX: number;
  offsetY: number;
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
  state: Pick<AvatarCropState, 'imageWidth' | 'imageHeight' | 'cropSize' | 'scale'>
) {
  const displayScale = getDisplayScale(state);
  const displayWidth = state.imageWidth * displayScale;
  const displayHeight = state.imageHeight * displayScale;
  const maxX = Math.max(0, (displayWidth - state.cropSize) / 2);
  const maxY = Math.max(0, (displayHeight - state.cropSize) / 2);

  return {
    offsetX: clamp(offsetX, -maxX, maxX),
    offsetY: clamp(offsetY, -maxY, maxY),
  };
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

  const displayScale = getDisplayScale(state);
  const sourceSize = state.cropSize / displayScale;
  const sourceX = state.imageWidth / 2 - state.offsetX / displayScale - sourceSize / 2;
  const sourceY = state.imageHeight / 2 - state.offsetY / displayScale - sourceSize / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE
  );

  const mimeType = getOutputMimeType(file.type);
  const blob = await canvasToBlob(canvas, mimeType);
  return new File([blob], createAvatarFileName(file.name, mimeType), { type: mimeType });
}

export function getUploadedAvatarUrl(uploaded: Pick<FileEntity, 'id' | 'url'>) {
  return uploaded.url || `/api/v1/files/${uploaded.id}/public`;
}

function getDisplayScale(
  state: Pick<AvatarCropState, 'imageWidth' | 'imageHeight' | 'cropSize' | 'scale'>
) {
  return (state.cropSize / Math.min(state.imageWidth, state.imageHeight)) * state.scale;
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
