const express = require('express')
const paths = require('../paths')
const Ninja = require('../../models/ninja')

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

function setupFrontendController() {
  const router = express.Router();

  router.get(paths.home, getHome);
  router.get(paths.admin, getAdmin)
  router.post(paths.home, postHome);
  router.get(paths.list, getList)

  return router;
}

module.exports = setupFrontendController;
