import { context, trace } from "@opentelemetry/api";

export class TraceService {
  getTracer() {
    return trace.getTracer("default");
  }

  getSpan() {
    return trace.getSpan(context.active());
  }

  startSpan(name: string) {
    return this.getTracer().startSpan(name);
  }
}

export const traceService = new TraceService();
