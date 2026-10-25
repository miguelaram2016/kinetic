import assert from 'node:assert/strict';
import test from 'node:test';
import { getMongoConnectionOptions } from '../src/lib/db/connection-policy.ts';

test('production and test environments require an explicit MongoDB URI', () => {
  assert.throws(() => getMongoConnectionOptions({ NODE_ENV: 'production' }), /MONGODB_URI/);
  assert.throws(() => getMongoConnectionOptions({ NODE_ENV: 'test', MONGODB_URI: '   ' }), /MONGODB_URI/);
});

test('local MongoDB fallback is permitted only during development', () => {
  assert.equal(
    getMongoConnectionOptions({ NODE_ENV: 'development' }).uri,
    'mongodb://127.0.0.1:27017/kinetic',
  );
});

test('explicit URI is used unchanged except for surrounding whitespace', () => {
  const config = getMongoConnectionOptions({
    NODE_ENV: 'production',
    MONGODB_URI: '  mongodb+srv://example.invalid/kinetic  ',
  });
  assert.equal(config.uri, 'mongodb+srv://example.invalid/kinetic');
  assert.deepEqual(config.options, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
});
