const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const delay = require('delay')

const { initTracer } = require('../utils/tracer');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const httpGet = require('../utils/http').get;

const tracer = initTracer('cart');
const get = httpGet(tracer);

const port = 9090;
const STORE_PORT = 9091;

app.use(bodyParser.json())
app.listen(port, () => {
    console.log('cart service listening on port ' + port);
})
const cartStub = {

}
const getCart = async (userId) => {
    await delay(Math.random() * 300 + 50);
    return cartStub[userId];
}
const addToCart = async (rootSpan, userId, item) => {
    const span = tracer.startSpan('addToCart', { childOf: rootSpan.context() });
    await delay(Math.random() * 300 + 50);
    if (!cartStub[userId]) {
        cartStub[userId] = [];
    }
    cartStub[userId] = cartStub[userId].filter(i => i.id != item.id);
    cartStub[userId].push(item);
    span.setTag(Tags.HTTP_STATUS_CODE, 200)
    span.finish();
}

const getStoreItem = async (rootSpan, userId, itemId) => {
    const span = tracer.startSpan('getStoreItem', { childOf: rootSpan.context() });
    span.setTag('userName', userId);
    try {
        const url = `http://localhost:${STORE_PORT}/item/${itemId}`;
        const res = await get(url, span);
        return res;
        span.setTag(Tags.HTTP_STATUS_CODE, 200)
        span.finish();
    } catch (error) {
        span.setTag(Tags.ERROR, true)
        span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
        span.finish();
    }
}

app.get('/cart/:userId', async (req, res) => {
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('get', {
        childOf: parentSpanContext,
        tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER }
    });
    const userId = req.params.userId
    const cart = await getCart(userId);
    span.finish();

    res.json(cart);
})

app.post('/cart/:userId', async (req, res) => {
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('add', {
        childOf: parentSpanContext,
        tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER }
    });
    const itemIdToAdd = req.body.itemId;
    const userId = req.params.userId




    const item = await getStoreItem(span, userId, itemIdToAdd);
    await addToCart(span,userId, item);
    span.finish();

    res.json({});
})
