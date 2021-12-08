export type AliTraceExporterOptions = {
  internal: boolean;
  projectName: string;
  instanceId: string;
  accessKeyId: string;
  accessKeySecret: string;
};

export interface AliTraceSpanProcessorOptions extends AliTraceExporterOptions {
  debug: boolean;
}

export interface AliTraceProviderOptions extends AliTraceExporterOptions {
  serviceName: string;
  serviceVersion: string;
  debug: boolean;
}
