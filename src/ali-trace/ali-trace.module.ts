import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import os from "os";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { Metadata, credentials } from "@grpc/grpc-js";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

import {
  AliTraceProviderOptions,
  AliTraceExporterOptions,
} from "./ali-trace.interface";
import { AliTraceSpanProcessorOptions } from ".";

export class AliTrace {
  private provider?: NodeTracerProvider;
  private exporter?: OTLPTraceExporter;
  private spanProcessor?: BatchSpanProcessor;

  getExporter() {
    return this.exporter;
  }

  getProvider() {
    return this.provider;
  }

  getSpanProcessor() {
    return this.spanProcessor;
  }

  initExporter(options: AliTraceExporterOptions) {
    if (this.exporter) {
      return this.exporter;
    }

    const { internal, projectName, instanceId, accessKeyId, accessKeySecret } =
      options;

    const url = internal
      ? `${projectName}.cn-hangzhou-intranet.log.aliyuncs.com:10010`
      : `${projectName}.cn-hangzhou.log.aliyuncs.com:10010`;

    const meta = new Metadata();
    meta.add("x-sls-otel-project", projectName);
    meta.add("x-sls-otel-instance-id", instanceId);
    meta.add("x-sls-otel-ak-id", accessKeyId);
    meta.add("x-sls-otel-ak-secret", accessKeySecret);

    const grpcExporter = new OTLPTraceExporter({
      url,
      credentials: credentials.createSsl(),
      metadata: meta,
    });

    this.exporter = grpcExporter;

    return grpcExporter;
  }

  initSpanProcessor(options: AliTraceSpanProcessorOptions) {
    if (this.spanProcessor) {
      return this.spanProcessor;
    }

    const { debug } = options;

    if (debug) {
      const spanProcessor = new BatchSpanProcessor(new ConsoleSpanExporter());

      this.spanProcessor = spanProcessor;

      return spanProcessor;
    }

    const exporter = this.initExporter(options);

    const spanProcessor = new BatchSpanProcessor(exporter);

    this.spanProcessor = spanProcessor;

    return spanProcessor;
  }

  initProvider(options: AliTraceProviderOptions) {
    if (this.provider) {
      return this.provider;
    }

    const { serviceName, serviceVersion } = options;

    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
      }),
    });

    provider.addSpanProcessor(this.initSpanProcessor(options));

    this.provider = provider;

    return provider;
  }
}
