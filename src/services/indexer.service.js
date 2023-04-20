const config = require('../config/config');
const { web3 } = require('.');
const { ethers } = require('ethers');
const { Event, LastBlock, LostEvent, PeripheryEvent } = require('../models');
const dayjs = require('dayjs')

const chainId = config.chainId
const lensHub = new ethers.Contract(config.bc.lensHub.address, config.bc.lensHubProfileEvents, web3.rpc);   
const topics = Object.keys(lensHub.filters).filter(f=>!f.includes('(')).reduce((acc, f)=>{
    acc = [...acc, lensHub.filters[f]().topics[0]]        
    return acc
}, [])

const lensPeriphery = new ethers.Contract(config.bc.lensPeriphery.address, config.bc.lensPeripheryEvents, web3.rpc);   
const lensPeripheryTopics = Object.keys(lensPeriphery.filters).filter(f=>!f.includes('(')).reduce((acc, f)=>{
    acc = [...acc, lensPeriphery.filters[f]().topics[0]]        
    return acc
}, [])

console.log(topics)

const reset = async function() {
    //await LastBlock.deleteMany({})
	//await Event.deleteMany({})	
    console.log('RESET COMPLETED')
}

const profileEvents = async function(delay, step) {	
    //await reset()
	console.log(`PROFILE EVENTS SCAN STARTED chainId: ${chainId}`)	
    let startBlock, startTime = dayjs()
    	
	setTimeout(async function tick() {
        try {			
			const currentBlock = await web3.rpc.getBlockNumber()									
			let lastBlock = await LastBlock.findOne({ chainId, name: 'main' })
			if (!lastBlock) lastBlock = await LastBlock.create({ blockNumber: config.bc.startBlock, chainId, name: 'main' })		
						
			if (lastBlock.blockNumber < currentBlock) {	                
				let fromBlock = lastBlock.blockNumber + 1
				let toBlock = lastBlock.blockNumber + step - 1			
				if (toBlock > currentBlock) toBlock = currentBlock
                if (!startBlock) startBlock = fromBlock
                                
                const blocksLeft = currentBlock - toBlock
                let statMsg = ''
                if (blocksLeft > 0) {
                    const blocksDone = fromBlock - startBlock 
                    const totalBlocks = blocksDone + blocksLeft
                    const percentDone = parseFloat(blocksDone / (totalBlocks / 100)).toFixed(2)                   
                    const secondsPast = parseInt((dayjs() - startTime).valueOf() / 1000) 
                    const blocksPerSecond = blocksDone / secondsPast                    
                    const secondsLeft = parseInt(blocksLeft / blocksPerSecond) 
                    const timeLeft = secondsToHMS(secondsLeft)   
                    statMsg = `done: ${percentDone}% time left: ${timeLeft}`                                     
                } 
             
                const rawEvents = await lensHub.queryFilter(topics, fromBlock, toBlock)                               	
				const events = []
                
				console.log(`SCAN from: ${fromBlock} to: ${toBlock} current: ${currentBlock} left: ${blocksLeft} events: ${rawEvents.length} ${statMsg}`)
				
				for (let i = 0; i < rawEvents.length; i++) {
					const rawEvent = rawEvents[i];      
                                  
                    if (rawEvent.event) {
                        const event = {
                            uid: `${rawEvent.blockNumber}-${rawEvent.logIndex}`,
                            blockNumber: rawEvent.blockNumber,
                            logIndex: rawEvent.logIndex,                            
                            name: rawEvent.event,                            
                            data: {},   
                            rawEvent: {
                                topics: rawEvent.topics,
                                transactionHash: rawEvent.transactionHash,
                                removed: rawEvent.removed
                            }                                                     						
                        }
                        
                        try {                                                
                            const data = lensHub.interface.decodeEventLog(rawEvent.event, rawEvent.data, rawEvent.topics);
                            Object.keys(data).filter(k => isNaN(k)).map(key => event.data[key] = data[key].toString())                               
                        } catch (error) {
                            event.rawEvent.data = rawEvent.data
                            event.scanError = error.toString()
                            console.error('SCAN ERROR', event.uid)                            
                        }

                        events.push(event)                         
                    } 
                }
                				
                if (events.length) {
                    await Event.bulkWrite(events.map((e) => { 
						return { updateOne: {
							filter: { uid: e.uid },
							update: { $set: e },
							upsert: true
						}}},
                        { ordered : false }
                    ))                   
				}
												
				lastBlock.blockNumber = toBlock
				await lastBlock.save()
			}			
        } catch (error) {
            console.log('EVENTS LISTENER ERROR', error)			
        }
      	setTimeout(tick, delay);             
    }, 1000)	
}

const peripheryEvents = async function(delay, step) {	
    //await reset()
	console.log(`PERIPHERY EVENTS SCAN STARTED chainId: ${chainId}`)	
    let startBlock, startTime = dayjs()
    	
	setTimeout(async function tick() {
        try {			
			const currentBlock = await web3.rpc.getBlockNumber()									
			let lastBlock = await LastBlock.findOne({ chainId, name: 'main_periphery' })
			if (!lastBlock) lastBlock = await LastBlock.create({ blockNumber: config.bc.startBlock, chainId, name: 'main_periphery' })		
						
			if (lastBlock.blockNumber < currentBlock) {	                
				let fromBlock = lastBlock.blockNumber + 1
				let toBlock = lastBlock.blockNumber + step - 1			
				if (toBlock > currentBlock) toBlock = currentBlock
                if (!startBlock) startBlock = fromBlock
                                
                const blocksLeft = currentBlock - toBlock
                let statMsg = ''
                if (blocksLeft > 0) {
                    const blocksDone = fromBlock - startBlock 
                    const totalBlocks = blocksDone + blocksLeft
                    const percentDone = parseFloat(blocksDone / (totalBlocks / 100)).toFixed(2)                   
                    const secondsPast = parseInt((dayjs() - startTime).valueOf() / 1000) 
                    const blocksPerSecond = blocksDone / secondsPast                    
                    const secondsLeft = parseInt(blocksLeft / blocksPerSecond) 
                    const timeLeft = secondsToHMS(secondsLeft)   
                    statMsg = `done: ${percentDone}% time left: ${timeLeft}`                                     
                } 
             
                const rawEvents = await lensPeriphery.queryFilter(lensPeripheryTopics, fromBlock, toBlock)                               	
				const events = []
                
				console.log(`PERIPHERY SCAN from: ${fromBlock} to: ${toBlock} current: ${currentBlock} left: ${blocksLeft} events: ${rawEvents.length} ${statMsg}`)
				
				for (let i = 0; i < rawEvents.length; i++) {
					const rawEvent = rawEvents[i];      
                                  
                    if (rawEvent.event) {
                        const event = {
                            uid: `${rawEvent.blockNumber}-${rawEvent.logIndex}`,
                            blockNumber: rawEvent.blockNumber,
                            logIndex: rawEvent.logIndex,                            
                            name: rawEvent.event,                            
                            data: {},   
                            rawEvent: {
                                topics: rawEvent.topics,
                                transactionHash: rawEvent.transactionHash,
                                removed: rawEvent.removed
                            }                                                     						
                        }
                        
                        try {                                                
                            const data = lensPeriphery.interface.decodeEventLog(rawEvent.event, rawEvent.data, rawEvent.topics);
                            Object.keys(data).filter(k => isNaN(k)).map(key => event.data[key] = data[key].toString())                               
                        } catch (error) {
                            event.rawEvent.data = rawEvent.data
                            event.scanError = error.toString()
                            console.error('PERIPHERY SCAN ERROR', event.uid)                            
                        }

                        events.push(event)                         
                    } 
                }
                				
                if (events.length) {
                    await PeripheryEvent.bulkWrite(events.map((e) => { 
						return { updateOne: {
							filter: { uid: e.uid },
							update: { $set: e },
							upsert: true
						}}},
                        { ordered : false }
                    ))                   
				}
												
				lastBlock.blockNumber = toBlock
				await lastBlock.save()
			}			
        } catch (error) {
            console.log('PERIPHERY EVENTS LISTENER ERROR', error)			
        }
      	setTimeout(tick, delay);             
    }, 1000)	
}

const profileEventsLost = async function(delay, step) {	
    //await reset()
	console.log(`PROFILE LOST EVENTS SCAN STARTED chainId: ${chainId}`)	
    let startBlock, startTime = dayjs()
    	
	setTimeout(async function tick() {
        try {			
			const currentBlock = await web3.rpc.getBlockNumber()		
            							
			let lastBlock = await LastBlock.findOne({ chainId, name: 'lost' })
			if (!lastBlock) lastBlock = await LastBlock.create({ blockNumber: config.bc.startBlock, chainId, name: 'lost' })	
                             28472554
            if (lastBlock >= 28461698 ) {
                console.log('FINISH')
                return 
            }
						
			if (lastBlock.blockNumber < currentBlock) {	                
				let fromBlock = lastBlock.blockNumber + 1
				let toBlock = lastBlock.blockNumber + step - 1			
				if (toBlock > currentBlock) toBlock = currentBlock
                if (!startBlock) startBlock = fromBlock
                                
                const blocksLeft = currentBlock - toBlock
                let statMsg = ''
                if (blocksLeft > 0) {
                    const blocksDone = fromBlock - startBlock 
                    const totalBlocks = blocksDone + blocksLeft
                    const percentDone = parseFloat(blocksDone / (totalBlocks / 100)).toFixed(2)                   
                    const secondsPast = parseInt((dayjs() - startTime).valueOf() / 1000) 
                    const blocksPerSecond = blocksDone / secondsPast                    
                    const secondsLeft = parseInt(blocksLeft / blocksPerSecond) 
                    const timeLeft = secondsToHMS(secondsLeft)   
                    statMsg = `done: ${percentDone}% time left: ${timeLeft}`                                     
                } 
             
                const rawEvents = await lensHub.queryFilter(topics, fromBlock, toBlock)                               	
				const events = []
                
				console.log(`SCAN from: ${fromBlock} to: ${toBlock} current: ${currentBlock} left: ${blocksLeft} events: ${rawEvents.length} ${statMsg}`)
				
				for (let i = 0; i < rawEvents.length; i++) {
					const rawEvent = rawEvents[i];                    
                    if (rawEvent.event) {
                        const event = {
                            uid: `${rawEvent.blockNumber}-${rawEvent.logIndex}`,
                            blockNumber: rawEvent.blockNumber,
                            logIndex: rawEvent.logIndex,                            
                            name: rawEvent.event,                            
                            data: {},   
                            rawEvent: {
                                topics: rawEvent.topics,
                                transactionHash: rawEvent.transactionHash,
                                removed: rawEvent.removed
                            }                                                     						
                        }
                        
                        try {                                                
                            const data = lensHub.interface.decodeEventLog(rawEvent.event, rawEvent.data, rawEvent.topics);
                            Object.keys(data).filter(k => isNaN(k)).map(key => event.data[key] = data[key].toString())                               
                        } catch (error) {
                            event.rawEvent.data = rawEvent.data
                            event.scanError = error.toString()
                            console.error('SCAN ERROR', event.uid)                            
                        }

                        events.push(event)                         
                    } 
                }
                				
                if (events.length) {
                    await LostEvent.bulkWrite(events.map((e) => { 
						return { updateOne: {
							filter: { uid: e.uid },
							update: { $set: e },
							upsert: true
						}}},
                        { ordered : false }
                    ))                   
				}
												
				lastBlock.blockNumber = toBlock
				await lastBlock.save()
			}			
        } catch (error) {
            console.log('EVENTS LISTENER ERROR', error)			
        }
      	setTimeout(tick, delay);             
    }, 1000)	
}

// fix helpers
const parseEvents = async function(delay) {	
    //await reset()
	
	console.log(`EVENTS PARSE STARTED chainId: ${chainId}`)
	
	setTimeout(async function tick() {
        try {			
			const events = await Event.find({ name: null }).limit(1000)
								
			
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                event.data = {}
                const eventInstance = contract.interface.getEvent(event.event.topics[0]);
                event.name = eventInstance.name

                const data = contract.interface.decodeEventLog(eventInstance.name, event.event.data, event.event.topics);
                Object.keys(data).filter(k => isNaN(k)).map(key => event.data[key] = data[key].toString()) 
                await event.save()
                console.log(event)
            }

            if (events.length) {
                console.time('writeDb')
                const res = await Event.bulkWrite(events.map((event) => { 
                    const eventInstance = contract.interface.getEvent(event.event.topics[0]);
                    return { updateOne: {
                        filter: { _id: event.id },
                        update: { $set: { name: eventInstance.name } },
                    }}
                }))	
                console.timeEnd('writeDb')
                console.log(res.modifiedCount) 
            }

            //if (events.length) {
            //    await Event.bulkWrite(events.map((event) => { 
            //        return { updateOne: {
            //            filter: { event },
            //            update: { $set: event },
            //        }}
            //    }))	
            //}
            
            
        } catch (error) {
            console.log('EVENTS LISTENER ERROR', error)			
        }
      	//setTimeout(tick, delay);             
    }, 1000)	
}
const updateUid = async function(delay) {	
    //await reset()
	
	console.log(`UPDATE UID STARTED chainId: ${chainId}`)
	
	setTimeout(async function tick() {
        try {	
            //const events1 = await Event.find({ uid: { $ne: null }}).limit(10000)			
            //if (events1.length) {
            //    console.time('writeDb')
            //    const res = await Event.bulkWrite(events1.map((event) => { 
            //        return { updateOne: {
            //            filter: { _id: event.id },
            //            update: { $set: { uid: null } },
            //        }}
            //    }))	
            //    console.timeEnd('writeDb')
            //    console.log(res.modifiedCount)                
            //}
            //return

            //await Event.index( { uid: 1 }, { unique: true } )
            //return

			const events = await Event.find({ uid: null }).limit(10000)
			
            if (events.length) {
                console.time('writeDb')
                const res = await Event.bulkWrite(events.map((event) => { 
                    return { updateOne: {
                        filter: { _id: event.id },
                        update: { $set: { uid: `${event.blockNumber}-${event.logIndex}` } },
                    }}
                }))	
                console.timeEnd('writeDb')
                console.log(res.modifiedCount) 
            }
            
            
        } catch (error) {
            console.log('EVENTS LISTENER ERROR', error)			
        }
      	setTimeout(tick, delay);             
    }, 1000)	
}

module.exports = {
	profileEvents,
    parseEvents,
    reset,
    updateUid,
    profileEventsLost,
    peripheryEvents
};

const secondsToHMS = function(value) {
    if (!value) return 0;

    let seconds = Number(value);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    //var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + ' d ' : '';
    var hDisplay = h > 0 ? h + ' h ' : '';
    var mDisplay = m > 0 ? m + ' m' : '';
    //var sDisplay = s > 0 ? s + " second" : " seconds") : "";
    return (dDisplay + hDisplay + mDisplay).trim(); // + sDisplay;
}