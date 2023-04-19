const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const peripheryEventsSchema = mongoose.Schema(
  {           
    uid: { type: String, index: true, unique: true, required: true }, // 
    name: { type: String, index: true, required: true }, 
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
peripheryEventsSchema.plugin(toJSON);
peripheryEventsSchema.plugin(paginate);

const PeripheryEvent = mongoose.model('PeripheryEvent', peripheryEventsSchema);

module.exports = { PeripheryEvent, peripheryEventsSchema };
