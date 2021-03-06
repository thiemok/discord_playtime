// @flow
/* eslint-disable no-console */
import logFactory from 'debug';

export default function log(namespace: string) {
	const debug = logFactory(namespace);

	const error = logFactory(namespace);
	error.log = console.error.bind(console);

	const trace = logFactory(namespace);
	trace.log = console.trace.bind(console);

	return {
		debug,
		error,
		trace,
	};
}
