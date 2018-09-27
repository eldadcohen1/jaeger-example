import delay from 'delay';
import Http from '../utils/http';
import TracerUtils from '../utils/tracer';
import { Span } from 'opentracing';
import  { Tags } from 'opentracing';

const tracer = TracerUtils.initTracer('client');
const STORE_PORT = 9091;
const CART_PORT = 9090;
const USER_NAME = 'yehiyam'

const getStoreItems = (rootSpan : Span) => {
    const url = `http://localhost:${STORE_PORT}/items`;
    const span = tracer.startSpan('getStoreItems', { childOf: rootSpan.context() });
    return Http.get(tracer,url, span);
}



const addItemToCart = async (rootSpan: Span, itemIdToAdd: number) =>{
    const span = tracer.startSpan('addItemToCart',{childOf:rootSpan.context()});
    span.setTag('userName', USER_NAME);
    try {
        const url = `http://localhost:${CART_PORT}/cart/${USER_NAME}`;
        
        await Http.post(tracer,url, span,{itemId: itemIdToAdd});
        
        span.setTag(Tags.HTTP_STATUS_CODE, 200)
        span.finish();
    } catch (error) {
        span.setTag(Tags.ERROR, true)
        span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
        span.finish();
    }
}

const getCart = async (rootSpan: Span) =>{
    const span = tracer.startSpan('get cart',{childOf:rootSpan.context()});
    span.setTag('userName', USER_NAME);
    try {
        const url = `http://localhost:${CART_PORT}/cart/${USER_NAME}`;
        
        const cart = await Http.get(tracer,url, span);
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
    (<any>tracer).close();
};

main();