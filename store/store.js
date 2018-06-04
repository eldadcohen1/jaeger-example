const express = require('express');
const delay = require('delay')
const app = express();

const { itemsStub } = require('./items');

const port = 9091;

// simulate delay and failures
const getItems = async () => {
    await delay(Math.random() * 1000 + 100);
    return itemsStub;
}

const getItem = async (id) => {
    await delay(Math.random() * 1000 + 100);
    // throw new Error(`item ${id} not found`);
    return itemsStub.find(i => i.id == id);
}
app.listen(port, () => {
    console.log('store service listening on port ' + port);
})

app.get('/items', async (req, res) => {
    const items = await getItems();
    res.json(items);
})

app.get('/item/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const item = await getItem(id);
        res.json(item);
    } catch (error) {
        return next(error)
    }
})
