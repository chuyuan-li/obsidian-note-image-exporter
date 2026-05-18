declare type FileFormat = 'png0' | 'png1' | 'jpg' | 'pdf' | 'webp';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare type ISettings = {
  width?: number;
  showFilename: boolean;
  resolutionMode: ResolutionMode;
  format: FileFormat;
  showMetadata: boolean;
  recursive: boolean;
  quickExportSelection: boolean;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unified?: boolean;
  };
  authorInfo: {
    show: boolean;
    name?: string;
    remark?: string;
    avatar?: string;
    align?: 'left' | 'center' | 'right';
    position?: 'top' | 'bottom';
  };
  watermark: {
    enable: boolean;
    type?: 'text' | 'image';
    text: {
      content?: string;
      fontSize?: number;
      fontFamily?: string;
      color?: string;
    };
    image: {
      src?: string;
    };
    opacity?: number;
    rotate?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  split: {
    height: number;
    overlap: number;
    mode: SplitMode;
  };
};

type SettingPath<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: NonNullable<T[K]> extends object
        ? `${K}.${SettingPath<NonNullable<T[K]>>}`
        : K;
    }[Extract<keyof T, string>]
  : never;

type SettingPathValue<T, P extends SettingPath<T>> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends SettingPath<NonNullable<T[K]>>
        ? SettingPathValue<NonNullable<T[K]>, Rest>
        : never
      : never
    : P extends keyof T
      ? T[P]
      : never;

type ConditionObject<T> = {
  [P in SettingPath<T>]: {
    flag: SettingPathValue<T, P>;
    path: P;
  };
}[SettingPath<T>];

type ConditionType<T> = ConditionObject<T> | ((data: T) => boolean);

type ValueType = 'number' | 'string' | 'boolean' | 'file';

type FieldValueType<T, P extends SettingPath<T>> =
  NonNullable<SettingPathValue<T, P>> extends number
    ? 'number'
    : NonNullable<SettingPathValue<T, P>> extends boolean
      ? 'boolean'
      : NonNullable<SettingPathValue<T, P>> extends string
        ? 'string' | 'file'
        : never;

type BaseFieldSchema<T, P extends SettingPath<T>> = {
  label: string;
  path: P;
  type: FieldValueType<T, P>;
  when?: ConditionType<T>;
  desc?: string;
};
type SelectFieldSchema<T, P extends SettingPath<T>> = {
  label: string;
  path: P;
  type: 'select';
  options: Array<{
    text: string;
    value: Extract<NonNullable<SettingPathValue<T, P>>, string>;
  }>;
  when?: ConditionType<T>;
  desc?: string;
};

declare type FieldSchema<T> = {
  [P in SettingPath<T>]: BaseFieldSchema<T, P> | SelectFieldSchema<T, P>;
}[SettingPath<T>];
declare type FormSchema<T> = Array<FieldSchema<T>>;

declare type MetadataType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'checkbox'
  | 'multitext'
  | 'number'
  | 'tags'
  | 'aliases';

declare type SplitMode = 'none' | 'fixed' | 'hr' | 'auto';

declare type ResolutionMode = '1x' | '2x' | '3x' | '4x';
