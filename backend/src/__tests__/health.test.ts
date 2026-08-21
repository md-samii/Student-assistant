import app from '../server';

export const runHealthCheckTest = () => {
  if (!app) {
    throw new Error('Server app is not defined');
  }
  console.log('✅ Health Check Test Passed: App initialized successfully');
  return true;
};
