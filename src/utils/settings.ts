export function syncUnifiedPadding(
  previousSettings: ISettings,
  nextSettings: ISettings,
): ISettings {
  if (nextSettings.padding.unified === false) {
    return nextSettings;
  }

  const becameUnified = previousSettings.padding.unified === false;
  const unifiedValueChanged = nextSettings.padding.top !== previousSettings.padding.top;

  if (becameUnified || unifiedValueChanged) {
    const unifiedPadding = nextSettings.padding.top;
    nextSettings.padding.right = unifiedPadding;
    nextSettings.padding.bottom = unifiedPadding;
    nextSettings.padding.left = unifiedPadding;
  }

  return nextSettings;
}
