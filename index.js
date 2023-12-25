const express = require('express');
const app = express();

const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

//middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bmgmcoi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //  await client.connect();

        const database = client.db("TaskManDB");
        const userCollection = database.collection("users");
        const taskCollection = database.collection("tasks");

        // API to insert users data
        app.post('/users', async (req, res) => {
            const user = req.body;

            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null });
            }

            const result = await userCollection.insertOne({ ...user, createdAt: new Date() });

            res.send(result);
        });

        //API to get a user info based on email queryParam
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await userCollection.findOne(query);
            res.send(result);
        });

        // API to insert a new task
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        // API to get all tasks of a user by email 
        app.get('/tasks', async (req, res) => {
            const email = req.query.email;
            const query = { createdBy: email }
            const result = await taskCollection.find(query).toArray();
            res.send(result);
        });

        //API to delete task based on id 
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        });


        //API to change a task status
        app.patch('/tasks/changeStatus/:id', async (req, res) => {
            const id = req.params.id;
            const statusToChange = req.query.status;

            const filter = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    status: statusToChange,
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc);
            
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('::TaskMan:: server is running...')
})

app.listen(port, () => {
    console.log(`TaskMan Server is listening on port ${port}`)
})
