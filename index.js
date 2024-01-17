const express = require("express")
const cors = require("cors")
require("dotenv").config();
const app = express()
const port = process.env.port || 5000

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.49cfwvw.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();




        const recipeCollection = client.db("recipeNext").collection("allRecipe")

        // API For Crate Recipe
        app.post("/api/v1/createRecipe", async (req, res) => {
            try {
                const recipe = req.body;
                const result = await recipeCollection.insertOne(recipe)
                res.send(result)
            }
            catch (error) {
                console.error('Error processing create recipe:', error.message);
                res.status(500).send({ error: 'Error processing create recipe' });
            }
        })

        //API For Get All Recipe
        app.get('/api/v1/allRecipe', async (req, res) => {
            try {
                const result = await recipeCollection.find().toArray()
                res.send(result)
            }
            catch (error) {
                console.error("Error processing on get all recipe", error.message)
                res.status(500).send({ error: "Error processing on get all recipe" })
            }
        })

        //API For Get single recipe
        app.get("/api/v1/singleRecipe/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await recipeCollection.findOne(query)
                res.send(result)
            }
            catch (error) {
                console.error("Error processing on get single recipe", error.message)
                res.status(500).send({ error: "Error processing on get single recipe" })
            }
        })

        // API For update a recipe
        app.put("/api/v1/updateRecipe/:id", async (req, res) => {
            try {
                const recipe = req.body
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const options = { upsert: true };
                const updateRecipe = {
                    $set: {
                        title: recipe.title,
                        ingredients: recipe.ingredients,
                        instructions: recipe.instructions,
                        photo: recipe.photo
                    }
                }
                const result = await recipeCollection.updateOne(query, updateRecipe, options)
                res.send(result)
            }
            catch (error) {
                console.error("Error processing on update recipe", error.message)
                res.status(500).send("Error processing on update recipe")
            }
        })

        // API for delete a recipe
        app.delete("/api/v1/deleteRecipe/:id",async(req,res)=>{
            try{
                const id = req.params.id;
                const query = {_id: new ObjectId(id)}
                const result = await recipeCollection.deleteOne(query)
                res.send(result)
            }
            catch(error){
                console.error("Error processing on delete a recipe",error.message)
                res.status(500).send("Error processing on delete a recipe")
            }
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("The recipe server is running")
})
app.listen(port, () => {
    console.log(`The server is running on port ${port}`)
})