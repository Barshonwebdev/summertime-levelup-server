const express = require('express');
const app=express();
const cors = require('cors');
require('dotenv').config();
const port=process.env.PORT||5000;

// middleware 
app.use(cors());
app.use(express.json());

// mongodb database connect 

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7di2jdk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collections 
    const userCollection = client.db('summertime-levelup').collection('users');
    const classesCollection=client.db('summertime-levelup').collection('classes');


    //users api
    app.post('/users',async(req,res)=>{
      const user=req.body;
      const query={email:user.email};
      const existingUser=await userCollection.findOne(query);
      if(existingUser){
       return res.send({message: 'user already exists'});
      }
      const result=await userCollection.insertOne(user);
      res.send(result);
    })

    app.get('/users',async(req,res)=>{
      const result=await userCollection.find().toArray();
      res.send(result);
    })

    app.delete('/users/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=await userCollection.deleteOne(query);
      res.send(result);
    })
    //make admin api
    app.patch('/users/admin/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const updateDoc={
        $set:{
          role:'admin'
        },
      }

      const result= await userCollection.updateOne(filter,updateDoc);
      res.send(result);
    })

    // isadmin api 
    app.get('/users/admin/:email', async (req,res)=>{
      const email=req.params.email;
      const query={email:email};
      const user=await userCollection.findOne(query);
      const result={admin:user?.role==='admin'};
      res.send(result);
    })

    //isinstructor api
    app.get('/users/instructor/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email};
      const user=await userCollection.findOne(query);
      const result={instructor:user?.role==='instructor'};
      res.send(result);
    })
    //make instructor api
    app.patch('/users/instructor/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const updateDoc={
        $set:{
          role:'instructor'
        },
      }

      const result= await userCollection.updateOne(filter,updateDoc);
      res.send(result);
    })

    //instructor list filter api
    app.get('/users/instructors',async(req,res)=>{
      const query={
       role:"instructor"
      } 
      const result=await userCollection.find(query).toArray();
      res.send(result);
    })

    //create class api
    app.post('/createclass',async(req,res)=>{
      const classEntity=req.body;
      const result=await classesCollection.insertOne(classEntity);
      console.log(classEntity);
    })

    //see the classes api
    app.get('/classes',async(req,res)=>{
      const result=await classesCollection.find().toArray();
      res.send(result);
    })

    //approve class api
    app.patch('/classses/approved/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const updateDoc={
        $set:{
          status:'Approved'
        },
      }
       const result = await classesCollection.updateOne(filter, updateDoc);
       res.send(result);
    })
    //deny class api
    app.patch('/classes/denied/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const updateDoc={
        $set:{
          status:'Denied'
        },
      }
      const result=await classesCollection.updateOne(filter,updateDoc);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('summertime levelup running functional');
})

app.listen(port,()=>{
    console.log(`server listening in port: ${port}`);
})