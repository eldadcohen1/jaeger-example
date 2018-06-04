const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const delay = require('delay')

const { initTracer, withSpanGeneric } = require('../utils/tracer.js');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const httpGet = require('../utils/http').get;

const tracer = initTracer('cart');
const get = httpGet(tracer);
const withSpan = withSpanGeneric(tracer);

const port = 9090;
const STORE_PORT = 9091;

app.use(bodyParser.json())
app.listen(port, () => {
    console.log('cart service listening on port ' + port);
})
const cartStub={

}
const getCart = async (userId)=>{
    await delay(Math.random()*300+50);
    return cartStub[userId];
}
const addToCart = async (userId, item)=>{
    await delay(Math.random()*300+50);
    if (!cartStub[userId]){
        cartStub[userId]=[];
    }
    cartStub[userId]=cartStub[userId].filter(i=>i.id!=item.id);
    cartStub[userId].push(item);
}

const getStoreItem = (rootSpan,itemId) => {
    const url = `http://localhost:${STORE_PORT}/item/${itemId}`;
    const span = tracer.startSpan('getStoreItem', { childOf: rootSpan.context() });
    return get(url, span);
}

app.get('/cart/:userId', async (req, res)=>{
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('get', {
        childOf: parentSpanContext,
        tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    const userId = req.params.userId
    const cart=await getCart(userId);
    span.finish();
    
    res.json(cart);
})

app.post('/cart/:userId', async (req,res)=>{
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('add', {
        childOf: parentSpanContext,
        tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    const itemIdToAdd = req.body.itemId;
    const userId = req.params.userId
    const item = await withSpan(userId,'getStoreItem',(span)=>getStoreItem(span,itemIdToAdd), span);
    await withSpan(userId,'addToCart',(span)=>addToCart(userId,item), span);
    span.finish();
    
    res.json({});
})
