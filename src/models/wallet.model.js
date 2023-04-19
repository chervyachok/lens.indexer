const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const walletSchema = mongoose.Schema(
	{
        address: { type: String, required: true, index: true, unique: true },
		profiles: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Profile' }],
    },
	{
		timestamps: true,
	}
);

// add plugin that converts mongoose to json
walletSchema.plugin(toJSON);

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = { Wallet, walletSchema };
