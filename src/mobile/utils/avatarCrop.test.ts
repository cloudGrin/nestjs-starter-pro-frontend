import { describe, expect, it } from 'vitest';
import {
  AVATAR_CROP_SIZE,
  clampCropOffset,
  getAvatarPreviewMetrics,
  normalizeAvatarRotation,
  resizeAvatarCropState,
  rotateAvatarCropState,
  type AvatarCropState,
} from './avatarCrop';

function createState(overrides: Partial<AvatarCropState> = {}): AvatarCropState {
  return {
    imageWidth: 800,
    imageHeight: 400,
    cropSize: AVATAR_CROP_SIZE,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    ...overrides,
  };
}

describe('avatarCrop', () => {
  it('uses the measured crop frame size when calculating preview dimensions', () => {
    const metrics = getAvatarPreviewMetrics(createState({ cropSize: 240 }));

    expect(metrics.displayWidth).toBe(480);
    expect(metrics.displayHeight).toBe(240);
    expect(metrics.frameSize).toBe(240);
  });

  it('clamps offsets against the rotated image bounds', () => {
    const offset = clampCropOffset(120, 200, createState({ cropSize: 280, rotation: 90 }));

    expect(offset).toEqual({
      offsetX: 0,
      offsetY: 140,
    });
  });

  it('keeps offsets inside bounds after the crop frame is resized', () => {
    const nextState = resizeAvatarCropState(createState({ cropSize: 280, offsetX: 120 }), 240);

    expect(nextState.cropSize).toBe(240);
    expect(nextState.offsetX).toBe(120);
    expect(nextState.offsetY).toBe(0);
  });

  it('normalizes avatar rotation to quarter turns', () => {
    expect(normalizeAvatarRotation(-90)).toBe(270);
    expect(normalizeAvatarRotation(450)).toBe(90);
  });

  it('rotates crop state and reclamps existing offsets', () => {
    const nextState = rotateAvatarCropState(createState({ offsetX: 140 }), 90);

    expect(nextState.rotation).toBe(90);
    expect(nextState.offsetX).toBe(0);
    expect(nextState.offsetY).toBe(0);
  });
});
