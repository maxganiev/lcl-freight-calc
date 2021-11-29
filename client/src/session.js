import { setAlert } from './alert';

export const checkSession = () => {
	if (!sessionStorage.getItem('session_start')) {
		setAlert('info', 'Выберите способ доставки, чтобы начать расчет.');
		sessionStorage.setItem('session_start', 'true');
	}

	setTimeout(() => {
		sessionStorage.removeItem('session_start');
	}, 120000);
};
