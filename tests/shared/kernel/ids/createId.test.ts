import { describe, expect, it } from 'vitest';

import { createId } from '@shared/kernel/ids/createId';

describe('createId', () => {
  it('creates IDs prefixed with evt_', () => {
    const id = createId('evt');
    expect(id.startsWith('evt_')).toBe(true);
  });

  it('creates IDs prefixed with aud_', () => {
    const id = createId('aud');
    expect(id.startsWith('aud_')).toBe(true);
  });
});
