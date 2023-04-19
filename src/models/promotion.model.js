const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const promotionSchema = mongoose.Schema(
	{
		profile: { type:  mongoose.SchemaTypes.ObjectId, ref: 'Profile' },
		profileId: { type: String, index: true, required: true },
		publicationId: { type: String, index: true, required: true },
		active: { type: Boolean, default: false },
		mustFollow: { type: Boolean, default: false },
		duration: { type: Number, default: 0 },		
		createdTimestamp: { type: String, default: '0' },
		promotedAt: { type: String, default: '0' },
		budget: { type: String, default: '0' },
		locked: { type: String, default: '0' },
		payout: { type: String, default: '0' },
		budgetNum: { type: Number, default: 0 },
		lockedNum: { type: Number, default: 0 },
		payoutNum: { type: Number, default: 0 },
		profileEligibility: {
			minPosts: { type: Number, default: 0 },
			minComments: { type: Number, default: 0 },
			minAge: { type: Number, default: 0 },
			minPostsToMirrorsRatio: { type: Number, default: 0 },
			maxMirrors: { type: Number, default: 0 },
			mirrorsForLastDuration: { type: Number, default: 0 },
		},
		rewardParameters: {
			publishDuration: { type: Number, default: 0 },
			commentsReceived: { type: Number, default: 0 },
			likesReceived: { type: Number, default: 0 },
			receiveDuration: { type: Number, default: 0 },
		},
		rewardTiers: {
			type : [ { followers: { type: Number }, amount: { type: String }, amountNum: { type: Number } } ],
		  	default :[ { followers: 0, amount: '0', amountNum: 0 } ]
		},
		mirrorsCount: { type: Number, default: 0 },
		//mirrors: [],
		//mirrors: [{
		//	type: mongoose.SchemaTypes.ObjectId,
		//	ref: 'Mirror',
		//}]
		endsAt: { type: Date, default: Date.now() },

		discordCreatedSent: { type: Boolean, default: false, private: true },
	},
	{
		timestamps: true,
		includeUpdatedAt: true,
		includeCreatedAt: true,
	}
);

// add plugin that converts mongoose to json
promotionSchema.plugin(toJSON);
promotionSchema.plugin(paginate);

const Promotion = mongoose.model("Promotion", promotionSchema);
module.exports = { Promotion, promotionSchema };
