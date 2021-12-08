import { getNodeAutoInstrumentations as getInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { KoaLayerType } from "@opentelemetry/instrumentation-koa/build/src/types";
import { ExpressLayerType } from "@opentelemetry/instrumentation-express";
import {
  TypeormInstrumentation,
  TypeormInstrumentationConfig,
} from "opentelemetry-instrumentation-typeorm";
import { Instrumentation } from "@opentelemetry/instrumentation";
// import { SocketIoInstrumentation } from "opentelemetry-instrumentation-socket.io";

export interface AutoInstrumentationOptions {
  typeorm?: TypeormInstrumentationConfig;
}

export function getNodeAutoInstrumentations(
  options?: AutoInstrumentationOptions
) {
  const typeormInstrumentation = new TypeormInstrumentation({
    suppressInternalInstrumentation: false,
    collectParameters: true,
    ...(options?.typeorm || {}),
  });

  // const socketIoInstrumentation = new SocketIoInstrumentation();

  return getInstrumentations({
    "@opentelemetry/instrumentation-koa": {
      ignoreLayersType: [KoaLayerType.MIDDLEWARE],
    },
    "@opentelemetry/instrumentation-express": {
      ignoreLayersType: [ExpressLayerType.MIDDLEWARE],
    },
  }).concat([
    typeormInstrumentation,
    // socketIoInstrumentation,
  ] as unknown[] as Instrumentation[]);
}
