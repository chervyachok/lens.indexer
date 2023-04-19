const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const profileSchema = mongoose.Schema(
	{
		profileId: { type: String, index: true, required: true, unique: true },
		handle: { type: String, default: null },
        
        balance: { type: String, default: '0' },
        locked: { type: String, default: '0' },		
        rewards: { type: String, default: '0' },
        serviceFees: { type: String, default: '0' },	
        balanceNum: { type: Number, default: 0 },
        lockedNum: { type: Number, default: 0 },		
        rewardsNum: { type: Number, default: 0 },
        serviceFeesNum: { type: Number, default: 0 },		

        	
    },
	{
		timestamps: { createdAt: false, updatedAt: true },		
	}
);

// add plugin that converts mongoose to json
profileSchema.plugin(toJSON);

const Profile = mongoose.model("Profile", profileSchema);
module.exports = { Profile, profileSchema };