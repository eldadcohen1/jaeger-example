const { initTracer: initJaegerTracer } = require("jaeger-client");

module.exports.initTracer = serviceName => {
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
  const options={
    
  }
  return initJaegerTracer(config, options);
};
