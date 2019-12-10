var express = require('express')
var router = express.Router()
var paths = require('./paths')
const Ninja = require('../models/ninja')

function getAdmin(req, res, next) {
  res.render('admin')
}

function getHome(req, res, next) {
  res.render('home')
}

function postApiNinjas(req, res, next) {
  const newNinja = {
    name: req.body['name'],
    available: req.body['available'],
    rank: req.body['rank'],
    geometry: {
      coordinates: [req.body.lng, req.body.lat]
    }
  }
  Ninja.create(newNinja).then((ninja) => {
    res.render('admin-success', ninja)
  })
}

function getList(req, res, next) {
  const firstNames = [];
  Ninja.find({}).sort({ name: 1 }).then((ninjas) => {
    ninjas.forEach((ninja) => {
      const ninjaNamesList = firstNames.push(ninja.name);
      const ninjaRankList = firstNames.push(ninja.rank);
      const ninjaIdList = firstNames.push(ninja._id);
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
    ninjas.forEach((ninja) => {
      const name = myNinjas.push(ninja.name);
      const rank = myNinjas.push(ninja.rank);
      const available = myNinjas.push(ninja.available);
    })
    res.render('results', { ninjas })
  })
}

function deleteApiNinjas(req, res, next) {
  Ninja.findByIdAndRemove({ _id: req.params.id }).then((ninja) => {
    const deletedNinja = {
      name: ninja['name'],
      rank: ninja['rank'],
      available: ninja['available'],
      lng: ninja.geometry['coordinates'][0],
      lat: ninja.geometry['coordinates'][1]
    }
    res.render('deletedNinjas', deletedNinja)
  })
}

function getUpdatedNinja(req, res, next) {
  Ninja.findById({ _id: req.params.id }).then((ninja) => {
    const lng = ninja.geometry.coordinates[0];
    const lat = ninja.geometry.coordinates[1];
    res.render('updatedNinjas', { ninja, lng, lat })
  })
}

function postUpdatedNinja(req, res, next) {
  const updatedNinja = {
    name: req.body['name'],
    rank: req.body['rank'],
    available: req.body['available'],
    geometry: {
      coordinates: [req.body.lng, req.body.lat]
    }
  }
  Ninja.findByIdAndUpdate({ _id: req.params.id }, updatedNinja).then((ninja) => {
    res.redirect(paths.list)
  })
}

router.get(paths.home, getHome);

router.get(paths.admin, getAdmin)
router.get(paths.list, getList)

router.get(paths.updateNinja + '/:id', getUpdatedNinja)
router.post(paths.updateNinja + '/:id', postUpdatedNinja)

router.get(paths.api, getApiNinjas)
router.post(paths.api, postApiNinjas)
router.delete(paths.api + '/:id', deleteApiNinjas);

module.exports = router