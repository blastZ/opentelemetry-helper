import { context, SpanStatusCode, trace } from "@opentelemetry/api";

export function Span(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    const metadataKeys = Reflect.getMetadataKeys(method);

    descriptor.value = function (...args: any[]) {
      const tracer = trace.getTracer("default");
      const span = tracer.startSpan(
        name || `${target.constructor.name}.${propertyKey}`
      );

      return context.with(trace.setSpan(context.active(), span), () => {
        if (method.constructor.name === "AsyncFunction") {
          return method
            .apply(this, args)
            .catch((err: any) => {
              span.recordException(err);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: err.message,
              });

              throw err;
            })
            .finally(() => {
              span.end();
            });
        }

        try {
          const result = method.apply(this, args);

          return result;
        } catch (err: any) {
          span.recordException(err);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: err.message,
          });

          throw err;
        } finally {
          span.end();
        }
      });
    };

    for (const metadataKey of metadataKeys) {
      const metadata = Reflect.getMetadata(metadataKey, method);

      Reflect.defineMetadata(metadataKey, metadata, descriptor.value);
    }

    return descriptor;
  };
}
