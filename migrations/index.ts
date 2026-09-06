import * as migration_20260903_145532_initial_payload_schema from './20260903_145532_initial_payload_schema';
import * as migration_20260903_160937_stable_content_keys from './20260903_160937_stable_content_keys';
import * as migration_20260904_222234_markdown_posts from './20260904_222234_markdown_posts';

export const migrations = [
  {
    up: migration_20260903_145532_initial_payload_schema.up,
    down: migration_20260903_145532_initial_payload_schema.down,
    name: '20260903_145532_initial_payload_schema',
  },
  {
    up: migration_20260903_160937_stable_content_keys.up,
    down: migration_20260903_160937_stable_content_keys.down,
    name: '20260903_160937_stable_content_keys',
  },
  {
    up: migration_20260904_222234_markdown_posts.up,
    down: migration_20260904_222234_markdown_posts.down,
    name: '20260904_222234_markdown_posts'
  },
];
