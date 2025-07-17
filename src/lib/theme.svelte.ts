import { dark } from '@clerk/themes';
import { get } from 'svelte/store';
import { mode } from 'mode-watcher';

export const clerkTheme = () => (get(mode) === 'dark' ? dark : undefined);
