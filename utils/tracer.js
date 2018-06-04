const { initTracer: initJaegerTracer } = require("jaeger-client");
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const { curry } = require('ramda');

const withSpan = async (tracer, userName, taskName, task, parentSpan) => {
  const span = tracer.startSpan(taskName, {
    childOf: parentSpan ? parentSpan.context() : undefined
  });

  span.setTag('userName', userName);
  let res;
  try {
    res = await task(span);

    span.setTag(Tags.HTTP_STATUS_CODE, 200)
    span.finish();
  } catch (error) {
    span.setTag(Tags.ERROR, true);
    span.log({ 'error.message': error.message });
    span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
    span.finish();
  }

  return res;
}
const initTracer = serviceName => {
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
};

module.exports = {
  initTracer,
  withSpanGeneric: curry(withSpan)
}
