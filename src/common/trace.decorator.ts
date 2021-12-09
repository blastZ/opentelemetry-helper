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
        const newDescriptor = Span()(target.prototype, key, descriptor);

        Object.defineProperty(target.prototype, key, newDescriptor);
      }
    }

    return target;
  };
}
