const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const Ninja = require('../models/ninja')
const config = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}

const app = express();
mongoose.connect('mongodb://localhost/ninjago', config);
mongoose.Promise = global.Promise;

const handlebars = exphbs.create({
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  defaultLayout: 'main',
  extname: 'handlebars',

});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));


app.get('/', (req, res, next) => {
  res.render('home')
});

//ADD A NEW NINJA TO THE DB
app.post('/', (req, res, next) => {
  Ninja.create(req.body).then((ninja) => {
    res.send(ninja)
  }).catch(next);
})

//UPDATE A  NINJA IN THE DB
app.put('/:id', (req, res, next) => {
  Ninja.findByIdAndUpdate({ _id: req.params.id }, req.body).then(() => {
    Ninja.findOne({ _id: req.params.id }).then((ninja) => {
      res.send(ninja)
    })
  })
})

//DELETE A  NINJA FROM THE DB
app.delete('/:id', (req, res, next) => {
  Ninja.findByIdAndRemove({ _id: req.params.id }).then(function (ninja) {
    res.send(ninja)
  })
})

//GET NINJAS BASED ON LOCATION

app.get('/api/ninjas', (req, res, next) => {

  Ninja.aggregate([
    {
      "$geoNear": {
        "near": {
          "type": "Point",
          "coordinates": [parseFloat(req.query.lng), parseFloat(req.query.lat)]
        },
        "distanceField": "dist.calculated",
        "maxDistance": 100000,
        "distanceMultiplier": 0.001,
        "spherical": true
      }
    }]
  ).then((ninjas) => {
    res.render('home', { ninjas })
  })
})

//GET LIST OF NINJAS SORTED BY NAME
app.get('/list', (req, res, next) => {
  const firstNames = [];
  Ninja.find({}).sort({ name: 1 }).then((ninjas) => {
    ninjas.forEach((ninja) => {
      const ninjaNamesList = firstNames.push(ninja.name);
      const ninjaRankList = firstNames.push(ninja.rank);
    })
    res.render('ninjasList', { ninjas })
  })
})

//GET ADMIN PAGE
app.get('/admin', (req, res, next) => {
  res.status(404).send("404 Error - Page in construction")
});

//error handling middleware
app.use(function (err, req, res, next) {
  res.status(422).send({ err: err._message })
})

app.listen(port, () => console.log(`app listening on port ${port}`))