import type { Theme } from '@mui/material/styles';

type GetModeInterface = (theme: Theme) => 'light' | 'dark';

export const getMode: GetModeInterface = (theme: Theme) => theme.palette.mode;
export const getReverseMode: GetModeInterface = (theme: Theme) => theme.palette.mode === 'light' ? 'dark' : 'light';
