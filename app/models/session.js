// @flow
import mongoose from 'mongoose';
import logging from 'util/log';

const logger = logging('playtime:db:sessions');
const Schema = mongoose.Schema;

export type GameRecord = {
	_id: string,
	total: number,
};

export type PlayerRecord = {
	_id: string,
	total: number,
};

const sessionSchema = new Schema({
	uid: { type: String, index: true },
	game: { type: String, index: true },
	duration: Number,
	ended: Date,
	guilds: { type: [String], index: true },
});

/**
 * Fetches GameRecords for each game played by the player with the given id.
 * Records are sorted by total time played
 * @param  {string}                 id The user id of the player
 * @return {Promise<GameRecord[]>}  GameRecords for each game recorded for the player
 */
sessionSchema.statics.findGameRecordsForPlayer = function(id: string): Promise<GameRecord[]> {
	logger.debug('Querying games for player %s', id);

	const query = this.aggregate(
		[
			{ $match: { uid: id } },
			{ $group: {
				_id: '$game',
				total: { $sum: '$duration' },
			} },
			{ $sort: { total: -1 } },
		])
		.cursor({});

	const pResult = new Promise((resolve, reject) => {
		const records = [];
		query.exec()
			.eachAsync(doc => records.push(doc))
			.then(() => {
				if (records.length === 0) {
					reject('I have never seen that user play, please try again later');
				} else {
					resolve(records);
				}
			}).catch((err) => {
				logger.error('Failed Database Query\n%s', err);
				reject('Error querying database. Please try again later');
			});
	});
	return pResult;
};

/**
 * Fetches PlayerRecords for each player that has played
 * the game with the given name on the given guild.
 * Records are sorted by total time played
 * @param  {string}                     id     The name of the game to find records for
 * @param  {string}                     guild  The guild to search for
 * @return {Promise<PlayerRecord[]>}    PlayerRecords for each player recorded for the game
 */
sessionSchema.statics.findPlayerRecordsForGame = function(id: string, guild: string): Promise<PlayerRecord[]> {
	logger.debug('Querying players for game %s', id);

	const query = this.aggregate(
		[
			{ $match: { game: id, guilds: guild } },
			{ $group: { _id: '$uid', total: { $sum: '$duration' } } },
			{ $sort: { total: -1 } },
		])
		.cursor({});

	const pResult = new Promise((resolve, reject) => {
		const records = [];
		query.exec()
			.eachAsync(doc => records.push(doc))
			.then(() => {
				if (records.length === 0) {
					// No data available
					reject('I have never seen anyone play that game, please try again later');
				} else {
					resolve(records);
				}
			}).catch((err) => {
				logger.error('Failed Database Query\n%s', err);
				reject('Error querying database. Please try again later');
			});
	});
	return pResult;
};

/**
 * Fetches PlayerRecords for the 5 players with the most time played on the given guild
 * @param  {string}                        guild The guild to search on
 * @return {Promise<PlayerRecord[]>}       PlayerRecords for the 5 players with the most time played
 */
sessionSchema.statics.findTopPlayersForGuild = function(guild: string): Promise<PlayerRecord[]> {
	logger.debug('Querying top players for server %s', guild);

	const query = this.aggregate(
		[
			{ $match: { guilds: guild } },
			{ $group: { _id: '$uid', total: { $sum: '$duration' } } },
			{ $sort: { total: -1 } },
			{ $limit: 5 },
		])
		.cursor({});

	const pResult = new Promise((resolve, reject) => {
		const records = [];
		query.exec()
			.eachAsync(doc => records.push(doc))
			.then(() => {
				resolve(records);
			}).catch((err) => {
				logger.error('Failed Database Query\n%s', err);
				reject('Error querying database. Please try again later');
			});
	});
	return pResult;
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
