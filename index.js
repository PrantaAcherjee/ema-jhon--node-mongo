const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const port = 5000;
const cors = require('cors');
require("dotenv").config();

//middle ware
app.use(cors())
app.use(express.json())

//link collected from database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrj86.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {
        await client.connect();
        // console.log('database connected')
        const database = client.db('Online_shop');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        // Get Products API 
        app.get('/products', async (req, res) => {
            // console.log(req.query)
            const cursor = productsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            // console.log(page, size)
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }


            res.send({
                count,
                products

            });

        })
        // use POST data by keys
        app.post('/products/byKeys', async (req, res) => {
            // console.log(req.body)
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productsCollection.find(query).toArray();
            res.json(products)
        })

        //Add orders api
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            // console.log('hit the order', orders)
            const result = await ordersCollection.insertOne(orders)
            res.json(result)
        })

    }
    finally {

        // await client.close()
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('this is ema-jhon')
})

app.listen(port, () => {
    console.log('running ema-jhon', port)
})