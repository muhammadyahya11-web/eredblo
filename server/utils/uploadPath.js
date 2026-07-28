import os from 'os';
import path from 'path';

export const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.AWS_EXECUTION_ENV ||
  process.cwd().startsWith('/var/task')
);

export const uploadsDir = isServerlessRuntime
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(process.cwd(), 'uploads');
