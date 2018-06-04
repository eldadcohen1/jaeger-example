const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const delay = require('delay')

const { get } = require('../utils/http');

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
const addToCart = async (userId, item) => {
    await delay(Math.random() * 300 + 50);
    if (!cartStub[userId]) {
        cartStub[userId] = [];
    }
    cartStub[userId] = cartStub[userId].filter(i => i.id != item.id);
    cartStub[userId].push(item);
}

const getStoreItem = async (userId, itemId) => {
    try {
        const url = `http://localhost:${STORE_PORT}/item/${itemId}`;
        const res = await get(url);
        return res;
    } catch (error) {
        return null;
    }
}

app.get('/cart/:userId', async (req, res) => {
    const userId = req.params.userId
    const cart = await getCart(userId);
    res.json(cart);
})

app.post('/cart/:userId', async (req, res) => {
    const itemIdToAdd = req.body.itemId;
    const userId = req.params.userId
    const item = await getStoreItem(userId, itemIdToAdd);
    await addToCart(userId, item);

    res.json({});
})
