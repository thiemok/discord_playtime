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

const Session = mongoose.model('Session', sessionSchema);

export default Session;
