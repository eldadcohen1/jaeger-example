const request = require('request-promise');

const get = (url) => {
    const method = 'GET';
    const headers = {};

    return request({ url, method, headers, json: true })
        .then(data => {
            return data;
        }, e => {
            throw e;
        });

}
const post = (url, body) => {
    const method = 'POST';
    const headers = {};
    return request({ url, method, headers, body, json: true })
        .then(data => {
            return data;
        }, e => {
            throw e;
        });

}

module.exports = {
    get,
    post
}