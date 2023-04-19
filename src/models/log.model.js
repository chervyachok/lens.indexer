const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const logSchema = mongoose.Schema(
  {
    name: {type: String },
    data: {}, 
    errorMsg: {type: String },    
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
logSchema.plugin(toJSON);
logSchema.plugin(paginate);

const Log = mongoose.model('Log', logSchema);

module.exports = { Log, logSchema };
