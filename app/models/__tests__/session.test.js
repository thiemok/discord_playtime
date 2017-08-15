/* eslint-env jasmine */
/* eslint-env jest */

import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import MockDate from 'mockdate';
import Session from '../session';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000; // 2 minute timeout

mongoose.Promise = global.Promise;
let mockgoose;

const millisPerDay = 86400000;

let testSessions;
const prepareTestData = async () => {
	MockDate.set(1434319925275);
	const now = Date.now();
	testSessions = [
		{
			uid: '1',
			game: 'Game1',
			duration: millisPerDay / 6,
			ended: now - millisPerDay,
			guilds: ['1'],
		},
		{
			uid: '2',
			game: 'Game1',
			duration: millisPerDay / 4,
			ended: now - millisPerDay,
			guilds: ['1'],
		},
		{
			uid: '1',
			game: 'Game2',
			duration: millisPerDay / 4,
			ended: now - (2 * millisPerDay),
			guilds: ['1'],
		},
		{
			uid: '1',
			game: 'Game1',
			duration: millisPerDay / 6,
			ended: now - (3 * millisPerDay),
			guilds: ['1'],
		},
		{
			uid: '3',
			game: 'Game1',
			duration: millisPerDay / 2,
			ended: now - millisPerDay,
			guilds: ['2'],
		},
		{
			uid: '4',
			game: 'Game3',
			duration: millisPerDay / 6,
			ended: now - (3 * millisPerDay),
			guilds: ['1'],
		},
		{
			uid: '5',
			game: 'Game4',
			duration: millisPerDay / 6,
			ended: now - (3 * millisPerDay),
			guilds: ['1'],
		},
		{
			uid: '6',
			game: 'Game5',
			duration: millisPerDay / 8,
			ended: now - (3 * millisPerDay),
			guilds: ['1'],
		},
		{
			uid: '7',
			game: 'Game6',
			duration: millisPerDay / 6,
			ended: now - (3 * millisPerDay),
			guilds: ['1'],
		},
	];
	return Session.create(testSessions);
};

beforeAll(async () => {
	mockgoose = new Mockgoose(mongoose);
	await mockgoose.prepareStorage();
	await mongoose.connect('mongodb://localhost/test');
	return prepareTestData();
});

afterAll(async () => {
	return mockgoose.helper.reset();
});

describe('Session model', () => {

	test('saves correctly', () => {
		return expect(Session.find().exec())
			.resolves
			.toHaveLength(testSessions.length);
	});

	test('returns correct GameRecords for existing player', () => {
		const expectedRecords = [
			{ _id: 'Game1', total: millisPerDay / 3 },
			{ _id: 'Game2', total: millisPerDay / 4 },
		];
		return expect(Session.findGameRecordsForPlayer('1'))
			.resolves
			.toEqual(expectedRecords);
	});

	test('returns untracked user message for unknown user', () => {
		const expectedError = 'I have never seen that user play, please try again later';
		return expect(Session.findGameRecordsForPlayer('0'))
			.rejects
			.toEqual(expectedError);
	});

	test('returns correct PlayerRecords for existing game', () => {
		const expectedRecords = [
			{ _id: '1', total: millisPerDay / 3 },
			{ _id: '2', total: millisPerDay / 4 },
		];
		return expect(Session.findPlayerRecordsForGame('Game1', '1'))
			.resolves
			.toEqual(expectedRecords);
	});

	test('returns untracked game message for unknown game', () => {
		const expectedError = 'I have never seen anyone play that game, please try again later';
		return expect(Session.findPlayerRecordsForGame('Game0', '1'))
			.rejects
			.toEqual(expectedError);
	});

	test('returns top 5 players for a given guild', () => {
		const expectedRecords = [
			{ _id: '1', total: (millisPerDay / 3) + (millisPerDay / 4) },
			{ _id: '2', total: (millisPerDay / 4) },
			{ _id: '4', total: (millisPerDay / 6) },
			{ _id: '5', total: (millisPerDay / 6) },
			{ _id: '7', total: (millisPerDay / 6) },
		];
		return expect(Session.findTopPlayersForGuild('1'))
			.resolves
			.toEqual(expectedRecords);
	});

	test('returns top 5 games for a given guild', () => {
		const expectedRecords = [
			{ _id: 'Game1', total: (millisPerDay / 2) + (millisPerDay / 3) },
			{ _id: 'Game2', total: (millisPerDay / 4) },
			{ _id: 'Game3', total: (millisPerDay / 6) },
			{ _id: 'Game4', total: (millisPerDay / 6) },
			{ _id: 'Game6', total: (millisPerDay / 6) },
		];
		return expect(Session.findTopGamesForGuild('1'))
			.resolves
			.toEqual(expectedRecords);
	});

	test('returns correct total time played for all members of a given guild', () => {
		let expectedTime = 0;
		testSessions.forEach((session) => {
			if (session.guilds[0] === '1') expectedTime += session.duration;
		});
		return expect(Session.findTotalTimeForGuild('1'))
			.resolves
			.toEqual(expectedTime);
	});

	test('returns all sessions for a given guild', () => {
		return expect(Session.findAllDataForGuild('1'))
			.resloves
			.toHaveLength(testSessions.length - 1);
	});
});
