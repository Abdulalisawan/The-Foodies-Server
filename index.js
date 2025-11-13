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
const dealcollection = Alldata.collection("Dealdata");
const favouritecollection = Alldata.collection("favouritedata");

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
      app.post('/Add-review',async(req , res)=>{
        const data = req.body
        const result = await reviewscollection.insertOne(data)
        res.send(result)
        console.log(`succesfull`)
      })
      app.get('/myreview/:email',async(req,res)=>{
        const email= req.params.email
        const query={ReviewerEmail:email}
        const result= await reviewscollection.find(query).toArray()
        res.send(result)
      })

      app.get('/deals',async(req , res)=>{
        
        const result = await dealcollection.find().toArray()
        res.send(result)
      })
      app.delete('/myreview/:id',async(req ,res)=>{
        const data= req.params.id
        const query={_id: new ObjectId(data)}
        const result= await reviewscollection.deleteOne(query)
        res.send(result)
      })
      app.put('/edit-review/:id', async(req,res)=>{
        const ID= req.params.id
        const data= req.body
        const result= await reviewscollection.updateOne(
          {_id: new ObjectId(ID)},
          {$set:data}
        )
        res.send(result)
      })
      app.post('/favourite-data',async(req, res)=>{
        const data = req.body
        const result = await favouritecollection.insertOne(data)
        res.send(result)
      })
      app.get('/favourite', async(req, res)=>{
        const result= await favouritecollection.find().toArray()
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
