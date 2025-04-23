import { test } from 'node:test';
import assert from 'node:assert';

test('package can be imported', async (t) => {
  const module = await import('../src/index.js');
  assert.ok(module);
}); 