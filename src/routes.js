var express = require('express')
var router = express.Router()
var paths = require('./paths')
const Ninja = require('../models/ninja')

function getAdmin(req, res, next) {
  res.send("hello admin")
}

function getHome(req, res, next) {
  res.render('home')
}

//pending : create functionality to post new ninjas

function postHome(req, res, next) {
  Ninja.create(req.body).then((ninja) => {
    res.send(ninja)
  }).catch(next);
}

function getList(req, res, next) {
  const firstNames = [];
  Ninja.find({}).sort({ name: 1 }).then((ninjas) => {
    ninjas.forEach((ninja) => {
      const ninjaNamesList = firstNames.push(ninja.name);
      const ninjaRankList = firstNames.push(ninja.rank);
    })
    res.render('ninjasList', { ninjas })
  })
}

function getApiNinjas(req, res, next) {
  const myNinjas = [];
  Ninja.aggregate([
    {
      "$geoNear": {
        "near": {
          "type": "Point",
          "coordinates": [parseFloat(req.query.lng), parseFloat(req.query.lat)],
        },
        "distanceField": "dist.calculated",
        "maxDistance": 500000,
        "distanceMultiplier": 0.001,
        "spherical": true,
      }
    }, {
      $project: { distanceField: { $round: ["$dist.calculated", 2] }, _id: 1, name: 1, rank: 1, available: 1 }
    }]
  ).then((ninjas) => {
    console.log(ninjas);
    ninjas.forEach((ninja) => {
      const name = myNinjas.push(ninja.name);
      const rank = myNinjas.push(ninja.rank);
      const available = myNinjas.push(ninja.available);
    })
    res.render('results', { ninjas })
  })
}

function putApiNinjas(req, res, next) {
  Ninja.findByIdAndUpdate({ _id: req.params.id }, req.body).then(() => {
    Ninja.findOne({ _id: req.params.id }).then((ninja) => {
      res.send(ninja)
    })
  })
}

function deleteApiNinjas(req, res, next) {
  Ninja.findByIdAndRemove({ _id: req.params.id }).then(function (ninja) {
    res.send(ninja)
  })
}
router.get(paths.home, getHome);
router.get(paths.admin, getAdmin)
router.post(paths.home, postHome);
router.get(paths.list, getList)
router.get(paths.api, getApiNinjas)
router.put(paths.api + '/:id', putApiNinjas);
router.delete(paths.api + '/:id', deleteApiNinjas);

module.exports = router