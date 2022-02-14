const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;
const mongoose = require('mongoose');

app.use(express.json());

var whitelist = ['https://dropchats.web.app/','http://localhost:3000/']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


app.use(cors());

const roomSchema = new mongoose.Schema({
  roomCount: Number,
  roomID : String,
  owner: String,
  topic: String,
  password: String,
});

const respSchema = new mongoose.Schema({
    responseCount : Number,
    roomID : String,
    responseMsg: String,
    date: String,
});

const apiRoutes = [
  {
    allRooms : "/all/rooms",
    createRoom : "/create/room",
    specificRoom : "/all/rooms/:roomID",
    postRespond : "/all/rooms/:roomID/respond",
    viewResponses : "/all/rooms/:roomID/view-responses",
    login : "/user/login/room",
  }
]


var rooms = mongoose.model('rooms', roomSchema);
var responses = mongoose.model('responses', respSchema);
// const rooms = [];
// const responses = [];

const CONNECTION_URL = 'mongodb+srv://snape:snape@cluster0.1t67b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

app.get('/', (req, res) => {
    res.send(apiRoutes);
});

app.get('/all/rooms', (req, res) => {
  // res.send(rooms);
  // rooms.find({},(err,result)=>{
  //   res.status(200).json(result);
  //   console.log(result);
  // });
  rooms.find({},(err,result)=>{
    res.status(200).json(result);
    console.log(result);
  });
});

app.post('/create/room/', (req, res) => {
    const room = new rooms ({
        // roomCount : rooms.length + 1,
        roomCount : 69,
        roomID : req.body.roomID,
        // token
        owner: req.body.owner,
        topic: req.body.topic,
        password: req.body.password,
        // date: req.body.date,
    })

    // rooms.push(room);
    // res.send(room);

    room.save().then(() => {
      res.json(req.body);
    }).catch((err) => res.json({error : "Can't save to mongo!"}));
});

app.get('/all/rooms/:roomID', async (req, res) =>  {
  // const room = rooms.find(e => e.roomID == req.params.roomID);
  // const room = rooms.find({"roomID": req.params.roomID},(err,result)=>{
  //     console.log(result);
  //     return result;
  //   });
  const room = await rooms.findOne({"roomID": req.params.roomID});
  if(room) res.status(200).json(room);
  else res.status(200).json("Sorry the room couldn't be found! Kindly check the spelling.");
});

app.post('/all/rooms/:roomID/respond', (req, res) => {
  const response = new responses ({
      responseCount : responses.length + 1,
      roomID : req.params.roomID,
      // token
      responseMsg: req.body.response,
      date: req.body.date,
      // date
  })

  // responses.push(response);

  // res.send(response);
  response.save().then(() => {
    res.json(req.body);
  }).catch((err) => res.json({error : "Can't save to mongo!"}));
});

app.get('/all/rooms/:roomID/view-responses', async (req, res) => {
  // const response = responses.filter(e => e.roomID == req.params.roomID);
  const response = await responses.filter({"roomID":req.params.roomID},(err,result)=>{
    console.log(result);
    return result;
  });

  if(response) {
    res.send(response);
  }
  else res.send("Sorry the room responses couldn't be found! Kindly check the spelling.");
});

app.post('/user/login/room', async (req, res) => {
  // const room = rooms.find(e => e.roomID == req.body.roomID);
  const room = await rooms.find({"roomID":req.params.roomID},(err,result)=>{
    console.log(result);
    return result;
  })

  console.log(room);

  if(room){
    if(room.password != req.body.password){
      res.send("0");
    }else res.send(room);
  }
  else res.send("-1");
  // -1 ---> when room not found
  // 0 ----> password doesnot match
  // object ----> room and password match! R A R E   S E L E N A    G O M E Z
});



app.listen(port, ()=> {
  console.log(`Example app listening at http://localhost:${port}`)
  mongoose.connect(CONNECTION_URL,{
      useNewUrlParser: true ,
      useUnifiedTopology: true
  }).then(()=>{
      console.log('Connection Succesful !!!')
  }).catch((err)=> console.log(err))
})