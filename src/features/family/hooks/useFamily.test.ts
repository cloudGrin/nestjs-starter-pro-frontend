import { describe, expect, it } from 'vitest';
import type { FamilyPaginationResult, FamilyPost } from '../types/family.types';
import { mergeStableFamilyPostMediaUrls } from './useFamily';

function createPost(displayUrl: string, expiresAt: string): FamilyPost {
  return {
    id: 1,
    content: '视频动态',
    authorId: 2,
    media: [
      {
        id: 10,
        fileId: 20,
        mediaType: 'video',
        sort: 0,
        mimeType: 'video/mp4',
        displayUrl,
        expiresAt,
      },
    ],
    comments: [],
    likeCount: 0,
    likedByMe: false,
    createdAt: '2026-05-06T08:00:00.000Z',
    updatedAt: '2026-05-06T08:00:00.000Z',
  };
}

function createResult(post: FamilyPost): FamilyPaginationResult<FamilyPost> {
  return {
    items: [post],
    meta: {
      totalItems: 1,
      currentPage: 1,
    },
  };
}

describe('mergeStableFamilyPostMediaUrls', () => {
  const now = Date.parse('2026-05-06T10:00:00.000Z');

  it('keeps existing media urls during feed refresh when they are still valid', () => {
    const previousPost = createPost(
      '/api/v1/files/20/access?token=old',
      '2026-05-06T10:10:00.000Z'
    );
    const nextPost = {
      ...createPost('/api/v1/files/20/access?token=new', '2026-05-06T11:00:00.000Z'),
      comments: [
        {
          id: 3,
          postId: 1,
          parentCommentId: null,
          replyToUserId: null,
          content: '新评论',
          authorId: 4,
          createdAt: '2026-05-06T10:01:00.000Z',
          updatedAt: '2026-05-06T10:01:00.000Z',
        },
      ],
    };

    const result = mergeStableFamilyPostMediaUrls(
      createResult(previousPost),
      createResult(nextPost),
      now
    );

    expect(result.items[0].comments).toEqual(nextPost.comments);
    expect(result.items[0].media[0].displayUrl).toBe('/api/v1/files/20/access?token=old');
    expect(result.items[0].media[0].expiresAt).toBe('2026-05-06T10:10:00.000Z');
  });

  it('uses refreshed media urls when the existing access link is expiring soon', () => {
    const previousPost = createPost(
      '/api/v1/files/20/access?token=old',
      '2026-05-06T10:00:20.000Z'
    );
    const nextPost = createPost('/api/v1/files/20/access?token=new', '2026-05-06T11:00:00.000Z');

    const result = mergeStableFamilyPostMediaUrls(
      createResult(previousPost),
      createResult(nextPost),
      now
    );

    expect(result.items[0].media[0].displayUrl).toBe('/api/v1/files/20/access?token=new');
    expect(result.items[0].media[0].expiresAt).toBe('2026-05-06T11:00:00.000Z');
  });

  it('uses refreshed media urls when the previous cached media url is missing', () => {
    const previousPost = createPost(undefined as never, '2026-05-06T10:10:00.000Z');
    const nextPost = createPost('/api/v1/files/20/access?token=new', '2026-05-06T11:00:00.000Z');

    const result = mergeStableFamilyPostMediaUrls(
      createResult(previousPost),
      createResult(nextPost),
      now
    );

    expect(result.items[0].media[0].displayUrl).toBe('/api/v1/files/20/access?token=new');
    expect(result.items[0].media[0].expiresAt).toBe('2026-05-06T11:00:00.000Z');
  });
});
