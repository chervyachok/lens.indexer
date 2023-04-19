const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const blockSchema = mongoose.Schema(
	{
		chainId: {
			type: String,
			//index: true,
			required: true,
		},
        blockNumber: {
			type: Number,
			//index: true,
			required: true,
		},	
		name: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// add plugin that converts mongoose to json
blockSchema.plugin(toJSON);

const LastBlock = mongoose.model("LastBlock", blockSchema);

module.exports = { LastBlock, blockSchema };
