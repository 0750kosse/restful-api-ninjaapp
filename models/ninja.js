const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create geolocation Schema
const GeoSchema = new Schema({
  type: {
    type: String,
    default: "Point",

  },
  coordinates: {
    type: [Number],
    index: "2dsphere"
  }
})

//create ninja Schema and model
//this is how we are structuring our ninja object is going to look

const NinjaSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  rank: {
    type: String
  },
  available: {
    type: Boolean,
    default: false
  },
  geometry: GeoSchema
})

//we create our model, pass 
const Ninja = mongoose.model('ninja', NinjaSchema)

module.exports = Ninja;