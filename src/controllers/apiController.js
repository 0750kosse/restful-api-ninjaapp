const express = require('express')
const paths = require('../paths')
const Ninja = require('../../models/ninja')

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

function setupApiController() {
  const router = express.Router();

  router.get(paths.api, getApiNinjas);
  router.put(paths.api + '/:id', putApiNinjas);
  router.delete(paths.api + '/:id', deleteApiNinjas);
  return router;
}

module.exports = setupApiController;

