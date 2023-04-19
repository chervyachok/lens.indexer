const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const eventsSchema = mongoose.Schema(
  {           
    uid: { type: String, index: true, unique: true, required: true }, // 
    name: { type: String, required: true }, 
    blockNumber: { type: Number, required: true },
    logIndex: { type: Number, required: true },
    data: {}, 
    rawEvent: {       
      data: { type: String }, 
      transactionHash: { type: String, required: true }, 
      removed: { type: Boolean, required: true }, 
      topics: [],
    }, 
    scanError: { type: String }, 
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// add plugin that converts mongoose to json
eventsSchema.plugin(toJSON);
eventsSchema.plugin(paginate);

const Event = mongoose.model('Event', eventsSchema);

module.exports = { Event, eventsSchema };
