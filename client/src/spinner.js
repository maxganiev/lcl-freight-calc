export const spinner = {
	main: document.querySelector('main'),
	spinner: document.createElement('div'),

	addSpinner: function () {
		this.removeSpinner();

		this.spinner.setAttribute('class', 'spinner');
		this.spinner.innerHTML = `
		<div class="d-flex justify-content-center">
		<div class="spinner-border text-light" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	</div>`;

		this.main.insertAdjacentElement('afterbegin', this.spinner);
	},

	removeSpinner: function () {
		this.spinner.remove();
	},
};
