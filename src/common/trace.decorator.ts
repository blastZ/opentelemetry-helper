import "reflect-metadata";

import { Span } from "./span.decorator";

export function Trace(): ClassDecorator {
  return (target) => {
    for (const key of Object.getOwnPropertyNames(target.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

      if (
        descriptor &&
        descriptor.value !== target &&
        descriptor.value instanceof Function
      ) {
        const method = descriptor.value;
        const metadataKeys = Reflect.getMetadataKeys(method);

        const newDescriptor = Span()(target.prototype, key, descriptor);

        for (const metadataKey of metadataKeys) {
          const metadata = Reflect.getMetadata(metadataKey, method);

          Reflect.defineMetadata(metadataKey, metadata, newDescriptor.value);
        }

        Object.defineProperty(target.prototype, key, newDescriptor);
      }
    }

    return target;
  };
}
