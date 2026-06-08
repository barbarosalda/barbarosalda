import { describe, expect, it } from 'vitest';

import { EventOutboxRecorder } from '@shared/infrastructure/database/recorders/EventOutboxRecorder.ts';

describe('EventOutboxRecorder', () => {
  it('validates and stores parsed event intents', () => {
    const recorder = new EventOutboxRecorder();

    recorder.enqueue({
      type: 'user.registered',
      category: 'USER',
      target: { type: 'USER', id: 'usr_1' },
      payloadJson: { userId: 'usr_1' },
    });

    const [stored] = recorder.list();
    expect(stored?.type).toBe('user.registered');
    expect(stored?.category).toBe('USER');
    expect(stored?.target).toEqual({ type: 'USER', id: 'usr_1' });
  });

  it('list() returns a copy', () => {
    const recorder = new EventOutboxRecorder();
    recorder.enqueue({
      type: 'evt.original',
      category: 'SYSTEM',
      payloadJson: { ok: true },
    });

    const firstRead = recorder.list();
    firstRead.push({
      type: 'evt.tampered',
      category: 'SYSTEM',
      payloadJson: { ok: false },
    });

    expect(recorder.list()).toHaveLength(1);
  });

  it('clear() removes all stored events', () => {
    const recorder = new EventOutboxRecorder();
    recorder.enqueue({
      type: 'evt.clear',
      category: 'SYSTEM',
      payloadJson: { value: 1 },
    });

    recorder.clear();
    expect(recorder.list()).toEqual([]);
  });

  it('throws when an event is invalid', () => {
    const recorder = new EventOutboxRecorder();

    expect(() =>
      recorder.enqueue({
        type: '',
        category: 'SYSTEM',
        payloadJson: { userId: 'usr_1' },
      }),
    ).toThrow();
  });
});
