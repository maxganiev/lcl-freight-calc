import { globeContext } from '../globeContext';

export const execEvents = function () {
	//remembering height of body:
	const body_screen_param = {
		height: null,

		setBodyHeight: function (value) {
			this.height = value;
		},
	};

	////show brief
	document.getElementById('btn-disclaimer').addEventListener('click', (e) => {
		e.target.parentElement.style.transform = 'translateX(0%)';
		e.target.parentElement.style.transition = 'transform 0.6s ease-in-out';
		e.target.parentElement.style.visibility = 'visible';

		document.body.style.height = body_screen_param.height === null ? '160vh' : body_screen_param.height;
	});

	////hide brief
	document.getElementById('icn-close').addEventListener('click', (e) => {
		e.target.parentElement.style.transform = 'translateX(100%)';
		e.target.parentElement.style.transition = 'transform 0.6s ease-in-out';

		document.body.style.height = '100vh';
		document.body.style.transition = 'all 0.2s ease-in';

		setTimeout(() => {
			e.target.parentElement.style.visibility = 'hidden';
		}, 700);
	});

	////show and hide additional info from brief if required:

	//DOM constants:
	const link_to_expand_collapsible_list_01 = document.getElementById('link-expand-collapsible-01');
	const link_to_collapse_collapsible_list_01 = document.getElementById('link-collapse-collapsible-01');
	const link_to_expand_collapsible_list_02 = document.getElementById('link-expand-collapsible-02');
	const link_to_collapse_collapsible_list_02 = document.getElementById('link-collapse-collapsible-02');
	const link_to_expand_collapsible_list_03 = document.getElementById('link-expand-collapsible-03');
	const link_to_collapse_collapsible_list_03 = document.getElementById('link-collapse-collapsible-03');

	//event handlers:
	link_to_expand_collapsible_list_01.onclick = (e) => expand(e, '01', '0_rules_headers', ['0.png', '1.png']);
	link_to_collapse_collapsible_list_01.onclick = (e) => collapse(e, '01');
	link_to_expand_collapsible_list_02.onclick = (e) => expand(e, '02', '1_rules_fraction', ['0.png', '1.png']);
	link_to_collapse_collapsible_list_02.onclick = (e) => collapse(e, '02');
	link_to_expand_collapsible_list_03.onclick = (e) => expand(e, '03', '2_upload_table', ['0.png', '1.png', '2.png']);
	link_to_collapse_collapsible_list_03.onclick = (e) => collapse(e, '03');

	//expand brief:
	function expand(e, id, dir, srcs) {
		e.preventDefault();

		const element = document.getElementById(`list-collapsible-${id}`);
		element.classList.replace('list-collapsed', 'list-expanded');
		e.target.style.visibility = 'hidden';

		const url = `./assets/brief/${dir}/`;
		const img_srcs = srcs.map((src) => url + src);
		lazyLoadImg(e, element, img_srcs, id);

		document.body.style.height = document.body.scrollHeight * 1.25 + 'px';
		body_screen_param.setBodyHeight(document.body.style.height);
	}

	//collapse brief:
	function collapse(e, id) {
		e.preventDefault();

		const element = document.getElementById(`list-collapsible-${id}`);
		element.classList.replace('list-expanded', 'list-collapsed');

		const link = document.getElementById(`link-expand-collapsible-${id}`);
		link.style.visibility = 'visible';
		lazyLoadImg(e, element);

		document.body.style.height = document.body.scrollHeight / 1.25 + 'px';
		body_screen_param.setBodyHeight(document.body.style.height);
	}

	//lazy load imgs on click:
	function lazyLoadImg(e, parentElem, imgSrcArr, id) {
		const img = Array.from(parentElem.children).filter(
			(child) => child.firstElementChild && child.firstElementChild.className === 'img-mask'
		)[0].firstElementChild.firstElementChild;

		const imgMask = img.parentElement;

		if (e.target.id.includes('expand')) {
			img.removeAttribute('data-src');
			img.setAttribute('src', imgSrcArr[0]);
			document.getElementById(`imgId-${id}`).textContent = `1 из ${imgSrcArr.length}`;
		} else {
			img.removeAttribute('src');
			img.setAttribute('data-src', '/');
		}

		let portion;

		let i = 0;
		function slideLeft() {
			i > 0 ? i-- : (i = 0);
			img.setAttribute('src', imgSrcArr[i]);

			document.getElementById(`imgId-${id}`).textContent = `${i + 1} из ${imgSrcArr.length}`;
		}

		function slideRight() {
			i < imgSrcArr.length - 1 ? i++ : (i = imgSrcArr.length - 1);
			img.setAttribute('src', imgSrcArr[i]);

			document.getElementById(`imgId-${id}`).textContent = `${i + 1} из ${imgSrcArr.length}`;
		}

		imgMask.onclick = (e) => {
			if (portion >= 70) {
				slideRight();
			} else if (portion <= 30) {
				slideLeft();
			}
		};

		img.onload = () => {
			let imgWidth = img.width;

			function resizeImg() {
				imgWidth = img.width;
			}

			globeContext.windowResize(resizeImg);

			img.onmousemove = (e) => {
				portion = (e.offsetX / imgWidth) * 100;

				if (portion >= 70) {
					imgMask.style.background = `linear-gradient(270deg, rgba(1,6,13,1) ${100 - portion}%, rgba(239,236,238,1) ${
						100 - portion
					}%)`;

					img.style.opacity = 0.6;
					imgMask.style.cursor = 'pointer';
				} else if (portion <= 30) {
					imgMask.style.background = `linear-gradient(90deg, rgba(1,6,13,1) ${portion}%, rgba(239,236,238,1) ${portion}%)`;
					img.style.opacity = 0.6;
					imgMask.style.cursor = 'pointer';
				} else {
					imgMask.style.background = 'unset';
					imgMask.style.transform = 'unset';
					img.style.opacity = 1;
					imgMask.style.cursor = 'default';
				}
			};

			img.onmouseleave = () => {
				img.style.opacity = 1;
				imgMask.style.background = 'unset';
				imgMask.style.cursor = 'default';
			};
		};

		setTimeout(() => {
			img.scrollIntoView();
		}, 250);
	}
};
