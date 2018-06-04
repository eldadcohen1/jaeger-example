const delay = require('delay')
const { get, post } = require('../utils/http');

const STORE_PORT = 9091;
const CART_PORT = 9090;
const USER_NAME = 'yehiyam'

const getStoreItems = () => {
    const url = `http://localhost:${STORE_PORT}/items`;
    return get(url);
}



const addItemToCart = async (itemIdToAdd) => {
    const url = `http://localhost:${CART_PORT}/cart/${USER_NAME}`;
    await post(url, { itemId: itemIdToAdd });
}

const getCart = async () => {
    const url = `http://localhost:${CART_PORT}/cart/${USER_NAME}`;
    const cart = await get(url);
    console.log(JSON.stringify(cart, null, 2));
}

const main = async () => {
    // get list of items from the store

        const items = await getStoreItems();
        console.log(JSON.stringify(items, null, 2));

    // add item 1 to cart
    await addItemToCart(1);
    await addItemToCart(3);

    await getCart();
};

main();