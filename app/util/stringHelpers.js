// @flow
import { findGameURL } from 'util/gameInfo';
import type { GameRecord } from 'models/session';

export const buildTimeString = (duration: number): string => {
	const totalMinutes = (duration / 1000) / 60;
	const dayPart = Math.floor(totalMinutes / (60 * 24));
	const hourPart = Math.floor((totalMinutes / 60) % 24);
	const minutePart = Math.floor(totalMinutes % 60);

	let timeString: string = '*';
	timeString += (dayPart > 0) ? (dayPart + 'd ') : '';
	timeString += (hourPart > 0) ? (hourPart + 'h ') : '';
	timeString += minutePart + 'min*';

	return timeString;
};

export const buildRichGameString = (game: GameRecord): Promise<string> => {
	const pTitle = new Promise((resolve, reject) => {
		let entry: string = '';
		let formattedTitle: string = '';

		findGameURL(game._id)
			.then((result) => {
				formattedTitle = `**[${game._id}](${result})**`;
				entry = formattedTitle + ': ' + buildTimeString(game.total);
				resolve(entry);
			}).catch((err) => {
				formattedTitle = '**' + game._id + '**';
				entry = formattedTitle + ': ' + buildTimeString(game.total);
				resolve(entry);
			});
	});
	return pTitle;
};

/**
 * Searches for the best point to break string into a second string and splits it there,
 * where the point will be before lineLength.
 * Priority for breaking opportunities is as following:
 * 1. Before last [\n\r\u2028\u2029]
 * 2. After last \s
 * 3. Break right at lineLength
 * @param  {string}  string      The string to search in
 * @param  {number}  lineLength  The desired lineLength
 */
export const splitAtLineBreakPoint = (string: string, lineLength: number): [string, string] => {
	const target = string.substring(0, lineLength);

	let index = target.search(/[\n\r\u2028\u2029][^\n\r\u2028\u2029]*$/);
	if (index !== -1) {
		return [string.substring(0, index).trim(), string.substring(index).trim()];
	}

	index = target.search(/\s[^\s]*$/);
	if (index !== -1) {
		return [string.substring(0, index).trim(), string.substring(index).trim()];
	}

	return [target, string.substring(lineLength)];
};
