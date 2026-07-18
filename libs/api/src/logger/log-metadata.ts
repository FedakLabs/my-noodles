export type LogMetadataValue = Readonly<{
  appName: string;
  appVersion: string;
}>;

export class LogMetadata {
  private static value: LogMetadataValue = {
    appName: 'app',
    appVersion: 'dev',
  };

  static get(): LogMetadataValue {
    return LogMetadata.value;
  }

  static set(value: LogMetadataValue): void {
    LogMetadata.value = value;
  }
}
