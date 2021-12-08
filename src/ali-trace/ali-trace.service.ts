import { AliTrace } from "./ali-trace.module";
import { AliTraceProviderOptions } from "./ali-trace.interface";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { AliTraceSpanProcessorOptions } from ".";

const aliTrace = new AliTrace();

export function registerProvider(options: AliTraceProviderOptions) {
  const provider = aliTrace.initProvider(options);

  provider.register();

  return provider;
}

export function registerAutoInstrumentations(instrumentations: any) {
  registerInstrumentations({
    instrumentations,
  });
}

export function getSpanProcessor(options: AliTraceSpanProcessorOptions) {
  return aliTrace.initSpanProcessor(options);
}

export const provider = aliTrace.getProvider();
export const exporter = aliTrace.getExporter();
