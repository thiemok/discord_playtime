/* eslint-env jest */

const mockGuildMemberFactory = (id) => {
	return {
		displayName: 'mockGuildMember' + id,
		user: {
			avatarURL: 'https://testurl.com',
		},
		highestRole: {
			color: 0,
		},
		permissions: {
			hasPermission: jest.fn(() => true),
		},
		sendFile: jest.fn(() => new Promise((res, rej) => res())),
	};
};

export default mockGuildMemberFactory;