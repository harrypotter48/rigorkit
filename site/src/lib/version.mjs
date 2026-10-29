// Resolve VERSION while bundling; prerendered chunks do not share this source path.
import version from '../../../VERSION?raw';

export const VERSION = version.trim();
