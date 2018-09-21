const delay = require('delay')
const {get: httpGet, post: httpPost} = require('../utils/http');
const { initTracer } = require('../utils/tracer.js');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');

const tracer = initTracer('client');
const get = httpGet(tracer);
const post = httpPost(tracer);
const STORE_PORT = 9091;
const CART_PORT = 9090;
const USER_NAME = 'yehiyam'

const getStoreItems = (rootSpan) => {
    const url = `http://localhost:${STORE_PORT}/items`;
    const span = tracer.startSpan('getStoreItems', { childOf: rootSpan.context() });
    return get(url, span);
}



const addItemToCart = async (rootSpan, itemIdToAdd) =>{
    const span = tracer.startSpan('addItemToCart',{childOf:rootSpan.context()});
    span.setTag('userName', USER_NAME);
    try {
        const url = `http://localhost:${CART_PORT}/cart/${USER_NAME}`;
        
        await post(url, span,{itemId: itemIdToAdd});
        
        span.setTag(Tags.HTTP_STATUS_CODE, 200)
        span.finish();
    } catch (error) {
        span.setTag(Tags.ERROR, true)
        span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
        span.finish();
    }
}

const getCart = async (rootSpan) =>{
    const span = tracer.startSpan('get cart',{childOf:rootSpan.context()});
    span.setTag('userName', USER_NAME);
    try {
        const url = `http://localhost:${CART_PORT}/cart/${USER_NAME}`;
        
        const cart = await get(url, span);
        console.log(JSON.stringify(cart, null, 2));

        span.setTag(Tags.HTTP_STATUS_CODE, 200)
        span.finish();
    } catch (error) {
        span.setTag(Tags.ERROR, true)
        span.log({ 'error.message': error.message });
        span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
        span.finish();
    }
}

const main = async () => {
    // get list of items from the store
    const rootSpan = tracer.startSpan('client transaction');

    let span = tracer.startSpan('get-items',{childOf:rootSpan.context()});
    span.setTag('userName', USER_NAME);
    try {
        const items = await getStoreItems(span);
        console.log(JSON.stringify(items, null, 2));

        span.setTag(Tags.HTTP_STATUS_CODE, 200)
        span.finish();
    } catch (error) {
        span.setTag(Tags.ERROR, true)
        span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
        span.finish();
    }


    // add item 1 to cart

    await Promise.all([
        addItemToCart(rootSpan,1),
        addItemToCart(rootSpan,3)
    ]);
    

    await getCart(rootSpan);
    

    rootSpan.finish();
    await delay(5000);
    tracer.close();
};

main();