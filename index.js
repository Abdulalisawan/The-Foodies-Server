const express = require('express')
require('dotenv').config({ path: '.env.local' });

const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var cors = require('cors')
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@the-foodies.yh0yuh6.mongodb.net/?appName=The-foodies`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

 async function Run(){
    try{
await client.connect();
await client.db("admin").command({ ping: 1 });
console.log("Pinged your deployment. You successfully connected to MongoDB!");
const Alldata = client.db("Alldata");
const reviewscollection = Alldata.collection("UserReviews");

      app.get('/reviews',async(req , res)=>{
        try{
            const cursor = reviewscollection.find()
            const result= await cursor.toArray()
            res.send(result)
        }catch(error){
            console.error("Error fetching data:", error);
    res.status(500).send({ message: "Failed to fetch reviews" });
        }
      })

      app.get('/search-reviews', async(req ,res)=>{
        const search = req.query.search || "";
        const query= { foodName:{$regex: search , $options: "i"}};
        const result = await reviewscollection.find(query).toArray()
        res.send(result)

      })
      app.get('/review-detail/:id', async(req , res)=>{
        const params= req.params.id
        const query={_id: new ObjectId(params)}
        const result= await reviewscollection.findOne(query)
        res.send(result)
      })



    }finally{}

}
Run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
