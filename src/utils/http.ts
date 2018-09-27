import * as request from 'request-promise';
import { Tags, FORMAT_HTTP_HEADERS, Tracer , Span} from 'opentracing';

export default class Http {
    static get(tracer : Tracer, url : string, span : Span){
        const method = 'GET';
        const headers = {};

        span.setTag(Tags.HTTP_URL, url);
        span.setTag(Tags.HTTP_METHOD, method);
        span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);
        // Send span context via request headers (parent id etc.)
        tracer.inject(span, FORMAT_HTTP_HEADERS, headers);

        return request({ url, method, headers, json: true })
            .then(data => {
                span.finish();
                return data;
            }, e => {
                span.finish();
                throw e;
            });
        }

    static post(tracer : Tracer, url : string, span : Span, body: object){
        const method = 'POST';
        const headers = {};

        span.setTag(Tags.HTTP_URL, url);
        span.setTag(Tags.HTTP_METHOD, method);
        span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);
        // Send span context via request headers (parent id etc.)
        tracer.inject(span, FORMAT_HTTP_HEADERS, headers);

        return request({ url, method, headers, body, json: true })
            .then(data => {
                span.finish();
                return data;
            }, e => {
                span.finish();
                throw e;
            });
    }
}
