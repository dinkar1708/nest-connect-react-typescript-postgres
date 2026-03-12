import * as path from 'path';
import { config } from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
const envPath = path.resolve(process.cwd(), envFile);
config({ path: envPath });
