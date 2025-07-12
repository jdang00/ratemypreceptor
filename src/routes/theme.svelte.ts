import { mode, setMode } from 'mode-watcher';

export class Theme {
	currentMode = $state(mode.current);

	handleThemeToggle = () => {
		if (mode.current === 'light') {
			this.currentMode = 'dark';
			setMode('dark');
		} else {
			this.currentMode = 'light';
			setMode('light');
		}
	};
}
