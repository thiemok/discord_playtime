/* eslint-env jest */
import generateEmbeds from '../embedHelpers';
import MockDate from 'mockdate';

beforeAll(() => {
	MockDate.set(1434319925275);
});

afterAll(() => {
	MockDate.reset();
});

const generateStringOfLength = (length) => {
	let string = '';
	for (let i = 0; i < length; i++) {
		string += 'a';
	}
	return string;
};

describe('EmbedHelpers', () => {

	test('generates defaults correctly', () => {
		const expectedEmbed = {
			color: 0,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
		};

		expect.assertions(1);
		return expect(generateEmbeds({}))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('Sets author', () => {
		const sourceData = {
			author: {
				name: 'Test',
				url: 'https://discordapp.com',
				icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
		};

		const expectedEmbed = {
			color: 0,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
			author: {
				name: 'Test',
				url: 'https://discordapp.com',
				icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
		};

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('Author.name field gets truncated', () => {
		const sourceData = {
			author: {
				name: generateStringOfLength(270),
				url: 'https://discordapp.com',
				icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
		};

		const expectedEmbed = {
			color: 0,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
			author: {
				name: generateStringOfLength(256),
				url: 'https://discordapp.com',
				icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
		};

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('Sets color', () => {
		const sourceData = {
			color: 2,
		};

		const expectedEmbed = {
			color: 2,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
		};

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('Sets thumbnail', () => {
		const sourceData = {
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/1.png',
			},
		};

		const expectedEmbed = {
			color: 0,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/1.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
		};

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('adds single Field', () => {
		const sourceData = {
			fields: [
				{ name: 'General stats', value: 'Total time played: *0min*' },
			],
		};

		const expectedEmbed = {
			color: 0,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
			fields: [
				{ name: 'General stats', value: 'Total time played: *0min*' },
			],
		};

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('Field.name field gets truncated', () => {
		const sourceData = {
			fields: [
				{ name: generateStringOfLength(270), value: 'Total time played: *0min*' },
			],
		};

		const expectedEmbed = {
			color: 0,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
			fields: [
				{ name: generateStringOfLength(256), value: 'Total time played: *0min*' },
			],
		};

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('Field.value.length > 1024 initiates creation of new field at closest line break', () => {
		const sourceData = {
			fields: [
				{ name: 'General stats', value: `${generateStringOfLength(1020)}\n${generateStringOfLength(200)}` },
			],
		};

		const expectedEmbed = {
			color: 0,
			timestamp: Date().toISOString(),
			thumbnail: {
				url: 'https://cdn.discordapp.com/embed/avatars/0.png',
			},
			footer: {
				icon_url: 'https://assets-cdn.github.com/favicon.ico',
				text: 'Powered by discord-playtime',
			},
			fields: [
				{ name: 'General stats', value: generateStringOfLength(1020) },
				{ name: '\u200B', value: generateStringOfLength(200) },
			],
		};

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual([expectedEmbed]);
	});

	test('Extra fields from oversized fields respect order when the following field is inlined', () => {
		const sourceData = {
			fields: [
				{ name: 'General stats', value: `${generateStringOfLength(1020)}\n${generateStringOfLength(200)}`, inline: true },
				{ name: 'General stats 2', value: `${generateStringOfLength(1020).toUpperCase()}\n${generateStringOfLength(200).toUpperCase()}`, inline: true },
			],
		};

		const expectedEmbeds = [
			{
				color: 0,
				timestamp: Date().toISOString(),
				thumbnail: {
					url: 'https://cdn.discordapp.com/embed/avatars/0.png',
				},
				footer: {
					icon_url: 'https://assets-cdn.github.com/favicon.ico',
					text: 'Powered by discord-playtime',
				},
				fields: [
					{ name: 'General stats', value: generateStringOfLength(1020), inline: true },
					{ name: 'General stats 2', value: generateStringOfLength(1020).toUpperCase(), inline: true },
					{ name: '\u200B', value: generateStringOfLength(200), inline: true },
					{ name: '\u200B', value: generateStringOfLength(200).toUpperCase(), inline: true },
				],
			},
		];

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual(expectedEmbeds);
	});

	test('Creation of more than 25 fields results in the generation of a second embed', () => {
		const fields = (num) => {
			const content = [];
			for (let i = 0; i < num; i++) {
				content.push({
					name: 'A',
					value: 'test',
				});
			}
			return content;
		};

		const sourceData = {
			fields: fields(26),
		};

		const expectedEmbeds = [
			{
				color: 0,
				timestamp: Date().toISOString(),
				thumbnail: {
					url: 'https://cdn.discordapp.com/embed/avatars/0.png',
				},
				footer: {
					icon_url: 'https://assets-cdn.github.com/favicon.ico',
					text: 'Powered by discord-playtime',
				},
				fields: fields(25),
			},
			{
				color: 0,
				timestamp: Date().toISOString(),
				thumbnail: {
					url: 'https://cdn.discordapp.com/embed/avatars/0.png',
				},
				footer: {
					icon_url: 'https://assets-cdn.github.com/favicon.ico',
					text: 'Powered by discord-playtime',
				},
				fields: fields(1),
			},
		];

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual(expectedEmbeds);
	});

	test('Exceeding the overall characterlimit of 6000 results in the generation of a second embed', () => {
		const sourceData = {
			fields: [
				{ name: generateStringOfLength(256), value: generateStringOfLength(1024) },
				{ name: generateStringOfLength(256), value: generateStringOfLength(1024) },
				{ name: generateStringOfLength(256), value: generateStringOfLength(1024) },
				{ name: 'AA', value: generateStringOfLength(110) },
			],
		};

		const expectedEmbeds = [
			{
				color: 0,
				timestamp: Date().toISOString(),
				thumbnail: {
					url: 'https://cdn.discordapp.com/embed/avatars/0.png',
				},
				footer: {
					icon_url: 'https://assets-cdn.github.com/favicon.ico',
					text: 'Powered by discord-playtime',
				},
				fields: [
					{ name: generateStringOfLength(256), value: generateStringOfLength(1024) },
					{ name: generateStringOfLength(256), value: generateStringOfLength(1024) },
					{ name: generateStringOfLength(256), value: generateStringOfLength(1024) },
				],
			},
			{
				color: 0,
				timestamp: Date().toISOString(),
				thumbnail: {
					url: 'https://cdn.discordapp.com/embed/avatars/0.png',
				},
				footer: {
					icon_url: 'https://assets-cdn.github.com/favicon.ico',
					text: 'Powered by discord-playtime',
				},
				fields: [
					{ name: 'AA', value: generateStringOfLength(110) },
				],
			},
		];

		expect.assertions(1);
		return expect(generateEmbeds(sourceData))
			.resolves
			.toEqual(expectedEmbeds);
	});
});
