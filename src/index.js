const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const { indexer } = require("./services");

let server;
mongoose.set("strictQuery", true);
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
	logger.info("Connected to MongoDB");
	server = app.listen(config.port, () => {
		logger.info(`Listening to port ${config.port}`);

		//indexer.reset()		
		indexer.profileEvents(30000, 1000);
		indexer.peripheryEvents(30000, 1000)

		//indexer.profileEventsLost(300, 1000);

		//indexer.updateUid(1000)
		//indexer.parseEvents(10000);		
	});	
});

const exitHandler = () => {
	if (server) {
		server.close(() => {
			logger.info("Server closed !");
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

const unexpectedErrorHandler = (error) => {
	logger.error(error);
	exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
	logger.info("SIGTERM received");
	if (server) {
		server.close();
	}
});
