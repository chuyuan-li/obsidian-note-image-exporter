type PathRecord = Record<string, unknown>;

function isPathRecord(value: unknown): value is PathRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function getSettingPath(
  settings: ISettings,
  path: SettingPath<ISettings>,
): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!isPathRecord(value)) {
      return undefined;
    }
    return value[key];
  }, settings);
}

export function setSettingPath(
  settings: ISettings,
  path: SettingPath<ISettings>,
  value: SettingPathValue<ISettings, SettingPath<ISettings>>,
): void {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current: PathRecord = settings;

  for (const key of keys) {
    const next = current[key];
    if (!isPathRecord(next)) {
      current[key] = {};
    }
    current = current[key] as PathRecord;
  }

  if (lastKey) {
    current[lastKey] = value;
  }
}
