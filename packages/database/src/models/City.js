import mongoose from "mongoose"

const citySchema = new mongoose.Schema({
  geonameid: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  countryCode: {
    type: String,
    trim: true
  },
  population: {
    type: Number,
    required: true,
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  searchFrequency: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

citySchema.index({ name: 1, population: -1 });

const City = mongoose.model('City', citySchema);

export default City;