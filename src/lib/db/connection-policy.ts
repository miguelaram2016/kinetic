/** Keep database configuration separate from connection state for predictable tests. */
type MongoEnvironment = Pick<NodeJS.ProcessEnv, 'MONGODB_URI' | 'NODE_ENV'>;

export function getMongoConnectionOptions(env: MongoEnvironment) {
  const configuredUri = env.MONGODB_URI?.trim();
  const uri = configuredUri || (env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/kinetic' : undefined);

  if (!uri) {
    throw new Error('MONGODB_URI must be configured outside development');
  }

  return {
    uri,
    options: {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    },
  };
}
