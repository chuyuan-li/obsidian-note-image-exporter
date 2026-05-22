import React, {
  type FC,
} from 'react';
import { type App } from 'obsidian';
import Control from './Control';
import { getSettingPath } from '../../../utils/settingPath';

function isShow(field: FieldSchema<ISettings>, settings: ISettings) {
  if (!field.when) {
    return true;
  }

  if (typeof field.when === 'function') {
    return field.when(settings);
  }

  return getSettingPath(settings, field.when.path) === field.when.flag;
}

function splitDescription(description: string): string[] {
  const lines: string[] = [];
  let start = 0;

  for (let index = 0; index < description.length; index++) {
    const character = description[index];
    const isBreak = character === '.'
      || character === ';'
      || character === '。'
      || character === '；';

    // Keep numbered lists such as "1. PNG" together until the next separator.
    if (!isBreak || (character === '.' && /\d/.test(description[index - 1] ?? ''))) {
      continue;
    }

    const line = description.slice(start, index + 1).trim();
    if (line) {
      lines.push(line);
    }
    start = index + 1;
  }

  const remainder = description.slice(start).trim();
  if (remainder) {
    lines.push(remainder);
  }

  return lines;
}

function renderDescriptionLine(line: string) {
  const labeledLine = line.match(/^(.+?[:：])(\s*)(.+)$/);
  if (labeledLine) {
    const [, label, space, detail] = labeledLine;
    return (
      <>
        <strong>{label}</strong>
        {space}
        {detail}
      </>
    );
  }

  const wordLine = line.match(/^(\S+)(\s+)(.+)$/);
  if (wordLine) {
    const [, firstWord, space, detail] = wordLine;
    return (
      <>
        <strong>{firstWord}</strong>
        {space}
        {detail}
      </>
    );
  }

  return line;
}

const Description: FC<{ text: string }> = ({ text }) => (
  <div className='setting-item-description export-image-setting-description-lines'>
    {splitDescription(text).map((line, index) => (
      <div className='export-image-setting-description-line' key={`${index}-${line}`}>
        {renderDescriptionLine(line)}
      </div>
    ))}
  </div>
);

const FormItems: FC<{
  formSchema: FormSchema<ISettings>;
  settings: ISettings;
  update: (data: ISettings) => void;
  app: App;
}> = ({ formSchema, settings, update, app }) => (
  <>
    {formSchema.map(
      fieldSchema =>
        isShow(fieldSchema, settings) && (
          <div
            className='setting-item'
            key={fieldSchema.path}
            style={{
              padding: '10px 0',
              paddingLeft: fieldSchema.when ? '20px' : undefined,
            }}
          >
            <div className='setting-item-info'>
              <div className={fieldSchema.when
                ? 'setting-item-name'
                : 'setting-item-name export-image-setting-heading'}
              >
                {fieldSchema.label}
              </div>
              {fieldSchema.desc && (
                <Description text={fieldSchema.desc} />
              )}
            </div>
            <div className='setting-item-control'>
              <Control
                fieldSchema={fieldSchema}
                setting={settings}
                update={update}
                app={app}
              ></Control>
            </div>

          </div>
        ),
    )}
  </>
);

export default FormItems;
