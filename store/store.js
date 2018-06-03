const express = require('express');
const delay = require('delay')
const app = express();

const { initTracer } = require('../utils/tracer.js');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');

const { itemsStub } = require('./items');

const tracer = initTracer('store');

const port = 9091;

// simulate delay and failures
const getItems = async ()=>{
    await delay(Math.random()*1000+100);
    return itemsStub;
}

const getItem = async (id)=>{
    await delay(Math.random()*1000+100);
    return itemsStub.find(i=>i.id==id);
}
app.listen(port, () => {
    console.log('store service listening on port ' + port);
})

app.get('/items', async (req, res)=>{
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan(req.originalUrl, {
        childOf: parentSpanContext,
        tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    const items=await getItems();
    span.finish();
    
    res.json(items);
    
})

app.get('/item/:id', async (req, res)=>{
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan(req.originalUrl, {
        childOf: parentSpanContext,
        tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    const id = req.params.id;
    const item = await getItem(id);
    span.finish();
    res.json(item);
})
