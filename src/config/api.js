const getDefaultApiUrl = () => {
	if (typeof window !== 'undefined' && window.location?.origin) {
		return window.location.origin;
	}

	return '';
};

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = import.meta.env.DEV
	? (configuredApiUrl || getDefaultApiUrl())
	: (getDefaultApiUrl() || configuredApiUrl || '');
