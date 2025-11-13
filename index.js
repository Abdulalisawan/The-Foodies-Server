const express = require('express')
require('dotenv').config({ path: '.env.local' });

const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var cors = require('cors')
const admin = require("firebase-admin");
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@the-foodies.yh0yuh6.mongodb.net/?appName=The-foodies`;


// index.js
const decoded = Buffer.from(process.env.FIREBASE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const veryfytoken= async(req , res , next)=>{
 
  if(!req.headers.authorization){   
     return res.status(401).send({ message: "No token provided" });
    }
    const token = req.headers.authorization.split(' ')[1]
    if(!token){
      return res.status(401).send({ message: "No token provided" });

    }
    try{
      const userinfo = await admin.auth().verifyIdToken(token)
      console.log(`verified doen`,userinfo)
      req.token_email= userinfo.email
      next()
    }catch(error){
      console.error("Error verifying token:", error);
      return res.status(401).send({ message: "No token provided" });

    }
    

}

 async function Run(){
    try{
await client.connect();

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
        try{
          const search = req.query.search || "";
          const query= { foodName:{$regex: search , $options: "i"}};
          const result = await reviewscollection.find(query).toArray()
          res.send(result)
        }catch(error){
          console.error("Error searching reviews:", error);
          res.status(500).send({ message: "Failed to search reviews" });
        }
      })
      app.get('/review-detail/:id', async(req , res)=>{
        try{
          const params= req.params.id
          const query={_id: new ObjectId(params)}
          const result= await reviewscollection.findOne(query)
          res.send(result)
        }catch(error){
          console.error("Error fetching review detail:", error);
          res.status(500).send({ message: "Failed to fetch review detail" });
        }
      })
      app.post('/Add-review',async(req , res)=>{
        try{
          const data = req.body
          const result = await reviewscollection.insertOne(data)
          res.send(result)
          console.log(`succesfull`)
        }catch(error){
          console.error("Error adding review:", error);
          res.status(500).send({ message: "Failed to add review" });
        }
      })
      app.get('/myreview/:email',veryfytoken,async(req,res)=>{
        try{
          console.log(req)
          const email= req.params.email
          if(email!== req.token_email){
            return res.status(403).send({ message: "Unauthorizedacces" })

          }
          const query={ReviewerEmail:email}

          const result= await reviewscollection.find(query).toArray()
          res.send(result)
        }catch(error){
          console.error("Error fetching my reviews:", error);
          res.status(500).send({ message: "Failed to fetch reviews" });
        }
      })

      app.get('/deals',async(req , res)=>{
        try{
          const result = await dealcollection.find().toArray()
          res.send(result)
        }catch(error){
          console.error("Error fetching deals:", error);
          res.status(500).send({ message: "Failed to fetch deals" });
        }
      })
      app.delete('/myreview/:id',async(req ,res)=>{
        try{
          const data= req.params.id
          const query={_id: new ObjectId(data)}
          const result= await reviewscollection.deleteOne(query)
          res.send(result)
        }catch(error){
          console.error("Error deleting review:", error);
          res.status(500).send({ message: "Failed to delete review" });
        }
      })
      app.put('/edit-review/:id', async(req,res)=>{
        try{
          const ID= req.params.id
          const data= req.body
          const result= await reviewscollection.updateOne(
            {_id: new ObjectId(ID)},
            {$set:data}
          )
          res.send(result)
        }catch(error){
          console.error("Error updating review:", error);
          res.status(500).send({ message: "Failed to update review" });
        }
      })
      app.post('/favourite-data',async(req, res)=>{
        try{
          const data = req.body
          const result = await favouritecollection.insertOne(data)
          res.send(result)
        }catch(error){
          console.error("Error adding favourite:", error);
          res.status(500).send({ message: "Failed to add favourite" });
        }
      })
      app.get('/favourite/:email',veryfytoken, async(req, res)=>{
        try{
          const value = req.params.email
          if(value !== req.token_email ){
            return res.status(403).send({ message: "Unauthorizedacces" })

          }
          const query={_email:value}

          const result= await favouritecollection.find(query).toArray()
          res.send(result)
        }catch(error){
          console.error("Error fetching favourites:", error);
          res.status(500).send({ message: "Failed to fetch favourites" });
        }

      })


    }finally{
      // Graceful shutdown - close MongoDB connection
      // Client will be closed when the process terminates
    }

}

// Start the server and initialize database
Run().then(() => {
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}).catch(error => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
