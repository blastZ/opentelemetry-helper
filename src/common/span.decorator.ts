import { context, Exception, SpanStatusCode, trace } from "@opentelemetry/api";

export function Span(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const tracer = trace.getTracer("default");
      const currentSpan =
        trace.getSpan(context.active()) || tracer.startSpan("default");

      return context.with(trace.setSpan(context.active(), currentSpan), () => {
        const span = tracer.startSpan(
          name || `${target.constructor.name}.${propertyKey}`
        );

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
          span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });

          throw err;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}
