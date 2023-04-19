const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
//const { ethers, utils } = require("ethers");

const mirrorSchema = mongoose.Schema(
	{
		promotion: { type:  mongoose.SchemaTypes.ObjectId, ref: 'Promotion' },
		profile: { type:  mongoose.SchemaTypes.ObjectId, ref: 'Profile' }, 
		profileId: { type: String, index: true, required: true },
		publicationId: { type: String, index: true, required: true },
		promoterProfileId: { type: String, index: true, required: true },
		lensId: { type: String, required: true },

		reward: { type: String, default: '0' },
		serviceFee: { type: String, default: '0' },		
		rewardNum: { type: Number, default: 0 },
		serviceFeeNum: { type: Number, default: 0 },	
		
		createdTimestamp: { type: String, default: '0' },
		mirroredAt: { type: Date },		
		
		status: { type: String, default: 'NONE' },
		isReward: { type: Boolean, default: false },
		rewardTireIdx: { type: Number, default: 0 },
		tx: {},
		
		publishCheckAt: { type: Date, default: null },
		publishSuccess: { type: Boolean, default: false },
		publishCompleted: { type: Boolean, default: false },
		
		receivedCheckAt: { type: Date, default: null },
		receivedSuccess: { type: Boolean, default: false },
		receivedCompleted: { type: Boolean, default: false },
		likesCollected: { type: Number, default: 0 },
		commentsCollected: { type: Number, default: 0 },

		errorMessage: { type: String, default: null },
		errorsCount: { type: Number, default: 0 },
		logs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Log" }],
    },
	{
		timestamps: true,
		includeUpdatedAt: true,
		includeCreatedAt: true,
	}
);

// add plugin that converts mongoose to json
mirrorSchema.plugin(toJSON);
mirrorSchema.plugin(paginate);

const Mirror = mongoose.model("Mirror", mirrorSchema);
module.exports = { Mirror, mirrorSchema };
