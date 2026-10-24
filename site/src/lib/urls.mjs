export const BASE = '/rigorkit/';
export const ORIGIN = 'https://harrypotter48.github.io';
export const REPOSITORY = 'https://github.com/harrypotter48/rigorkit';
/** @param {string} route */
export function withBase(route = '/') { return BASE + route.replace(/^\/+/, ''); }
