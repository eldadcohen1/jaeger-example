//@ts-ignore
import {initTracer as initJaegerTracer} from 'jaeger-client';
import { Tracer } from 'opentracing';

export default class TracerUtils {
  static initTracer(serviceName : string) : Tracer {
    const config = {
      serviceName: serviceName,
      sampler: {
        type: "const",
        param: 1,
      },
      reporter: {
        logSpans: true,
      },
    };
    const options = {
  
    }
    return initJaegerTracer(config, options);
  }
}
