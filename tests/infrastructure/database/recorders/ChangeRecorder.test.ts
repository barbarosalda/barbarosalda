import { describe, expect, it } from 'vitest';

import { ChangeRecorder } from '@shared/infrastructure/database/recorders/ChangeRecorder.ts';

describe('ChangeRecorder', () => {
  it('validates and stores parsed audit change intents', () => {
    const recorder = new ChangeRecorder();

    recorder.record({
      action: 'user.updated',
      target: { type: 'USER', id: 'usr_1' },
      category: 'USER_ACTION',
      severity: 'INFO',
      beforeSnapshot: {
        entityType: 'User',
        entityId: 'usr_1',
        schemaVersion: 1,
        data: { status: 'PENDING' },
      },
      afterSnapshot: {
        entityType: 'User',
        entityId: 'usr_1',
        schemaVersion: 1,
        data: { status: 'ACTIVE' },
      },
      diffJson: { status: ['PENDING', 'ACTIVE'] },
    });

    const [stored] = recorder.list();
    expect(stored?.action).toBe('user.updated');
    expect(stored?.category).toBe('USER_ACTION');
    expect(stored?.severity).toBe('INFO');
  });

  it('list() returns a copy', () => {
    const recorder = new ChangeRecorder();
    recorder.record({
      action: 'entity.changed',
      target: { type: 'ENTITY', id: 'id-1' },
      category: 'SYSTEM_ACTION',
      severity: 'WARNING',
    });

    const firstRead = recorder.list();
    firstRead.push({
      action: 'tampered',
      target: { type: 'ENTITY', id: 'id-2' },
      category: 'SYSTEM_ACTION',
      severity: 'WARNING',
    });

    expect(recorder.list()).toHaveLength(1);
  });

  it('clear() removes all stored changes', () => {
    const recorder = new ChangeRecorder();
    recorder.record({
      action: 'entity.changed',
      target: { type: 'ENTITY', id: 'id-1' },
      category: 'USER_ACTION',
      severity: 'INFO',
    });

    recorder.clear();
    expect(recorder.list()).toEqual([]);
  });

  it('throws when a change is invalid', () => {
    const recorder = new ChangeRecorder();

    expect(() =>
      recorder.record({
        action: '',
        target: { type: 'ENTITY', id: 'id-1' },
        category: 'USER_ACTION',
        severity: 'INFO',
      }),
    ).toThrow();
  });
});
