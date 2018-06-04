const { initTracer: initJaegerTracer } = require("jaeger-client");
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const { curry } = require('ramda');


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
}
