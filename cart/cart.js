const express = require('express');
const app = express();
const delay = require('delay')

const { initTracer } = require('../utils/tracer.js');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');

const tracer = initTracer('cart');

const port = 9090;

app.listen(port, () => {
    console.log('cart service listening on port ' + port);
})
const cartStub={

}
const getCart = async (userId)=>{
    await delay(Math.random()*300+50);
    return cartStub[userId];
}

app.get('/cart/:userId', async (req, res)=>{
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('cart', {
        childOf: parentSpanContext,
        tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    const cart=await getCart();
    span.finish();
    
    res.json(cart);
    
})
