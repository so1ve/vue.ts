export type TransformDaemon = {};

export function ensureDaemon() {
	if (!(globalThis as any).__UNPLUGIN_VUE_COMPLEX_DAEMON__) {
		//TODO
		(globalThis as any).__UNPLUGIN_VUE_COMPLEX_DAEMON__ = {};
	}
}

export function getDaemon() {
	ensureDaemon();
	return (globalThis as any).__UNPLUGIN_VUE_COMPLEX_DAEMON__;
}
