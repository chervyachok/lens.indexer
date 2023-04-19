const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");
const bcConfig = (require('./bcConfig.json'))

process.env.NODE_ENV === "production"
	? dotenv.config({ path: path.join(__dirname, "../../.env") })
	: dotenv.config({ path: path.join(__dirname, "../../.env.dev") });

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string()
			.valid("production", "development", "test")
			.required(),
		PORT: Joi.number().default(3000),

		CHAIN_ID: Joi.string().required(),
		CHAIN_RPC: Joi.string().required(),
		LENS_API: Joi.string().required(),
		

		MONGODB_URL: Joi.string().required().description("Mongo DB url"),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: "key" } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,

	chainId: envVars.CHAIN_ID,
	chainRpc: envVars.CHAIN_RPC,
	lensApi: envVars.LENS_API,
	bc: bcConfig[envVars.CHAIN_ID],
	
	mongoose: {
		url: envVars.MONGODB_URL + (envVars.NODE_ENV === "test" ? "-test" : ""),
		options: {
			//useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
	},
};
