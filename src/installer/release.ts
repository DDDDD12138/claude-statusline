export const REPO = 'DDDDD12138/claude-statusline';
export const ASSET = 'statusline.mjs';

/** Download URL for a release asset; `latest` resolves to the newest non-prerelease. */
export function assetUrl(version = 'latest'): string {
  const path = version === 'latest' ? 'latest/download' : `download/${version}`;
  return `https://github.com/${REPO}/releases/${path}/${ASSET}`;
}

const BANNER = /^\/\/ claude-statusline (.+)$/m;

/** The build label from the bundle's first line. Throws when the text is not our bundle. */
export function bundleLabel(text: string): string {
  const match = BANNER.exec(text.split('\n', 1)[0] ?? '');
  if (!match?.[1]) throw new Error('downloaded file is not a claude-statusline bundle');
  return match[1];
}
