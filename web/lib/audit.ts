/**
 * Audit log helper — fire-and-forget writes to AuditLog.
 * Call from server actions and route handlers.
 */

import { db } from './db'
import type { Prisma } from '@prisma/client'

export type AuditAction =
  | 'article.publish'
  | 'article.retract'
  | 'article.save'
  | 'article.create'
  | 'article.delete'
  | 'correction.issue'
  | 'figure.create'
  | 'figure.update'
  | 'figure.delete'
  | 'media.upload'
  | 'media.delete'
  | 'moderation.approve'
  | 'moderation.reject'
  | 'user.role_change'
  | 'user.suspend'
  | 'synthesis.publish'
  | 'reference.create'
  | 'reference.delete'

export async function writeAuditLog(
  userId: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  } catch {
    // Audit log failure should never break the primary action
    console.error('[audit] Failed to write audit log:', { userId, action, entityId })
  }
}
