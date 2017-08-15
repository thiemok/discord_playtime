// @flow
import logging from 'util/log';
import type { CommandContext } from 'commands';
import type { StringResolvable } from 'discord.js';

const logger = logging('playtime:commands:export');
/**
 * Exports all data for the current server as JSON
 * @param  {Array|String} argv    The arguments of the command, not used currently
 * @param  {Object}       context The context in which the export the data
 * @return {Promise}              Resolves when the export has finished, with a sendable object
 */
const exportJSON = (argv: Array<string>, context: CommandContext): Promise<StringResolvable> => {
	logger.debug('Running cmd exportJSON for %s: %s', context.member.displayName, context.member.id);
	const { member, serverID, db } = context;
	const pResult = new Promise((resolve, reject) => {
		// Needs to be admin to export db
		if (member.permissions.has('ADMINISTRATOR')) {
			// Export data
			db.getAllDataForServer(serverID)
				.then((data) => {
				// Create buffer from string representation of data and send it
				// $FlowIssue: Needs to be fixed in flow-typed
					member.send([
						Buffer.from(JSON.stringify(data, null, '\t')),
						'export.JSON',
						'Data export finished',
					])
						.then(() => {
							resolve("psst I'm sending you a private message");
						}).catch((err) => {
							resolve('`Error: ' + err + '`');
						});
				}).catch((err) => {
					resolve('`Error: ' + err + '`');
				});
		} else {
			logger.error('Attempted export with insufficent permissions by %s: %s', member.displayName, member.id);
			resolve('`You have insufficient permissions, only Admins can export`');
		}
	});
	return pResult;
};

export default exportJSON;
