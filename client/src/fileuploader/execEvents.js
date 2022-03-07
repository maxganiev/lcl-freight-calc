import { globeContext } from '../globeContext';

export const execEvents = function () {
	const disclaimer = {
		elem: document.getElementById('disclaimer'),

		bindRef: null,

		setbindRef: function () {
			this.bindRef = this.setDisclaimerHeight.bind(this, this.elem.style.visibility);
		},

		setDisclaimerHeight: function (...args) {
			const elemIsVisible = args[0];
			console.log(args);
			if (elemIsVisible === 'visible') {
				this.elem.style.height =
					Array.from(this.elem.children)
						.filter((child) => child.tagName === 'H3' || child.tagName === 'UL')
						.reduce((acc, curr) => acc + curr.scrollHeight, 0) *
						1.05 +
					'px';
			} else {
				this.elem.style.height = '100vh';
			}
		},
	};

	////show brief
	document.getElementById('btn-disclaimer').addEventListener('click', (e) => {
		e.target.parentElement.style.transform = 'translateX(0%)';
		e.target.parentElement.style.transition = 'transform 0.6s ease-in-out';
		e.target.parentElement.style.visibility = 'visible';

		disclaimer.setDisclaimerHeight(disclaimer.elem.style.visibility);
		disclaimer.setbindRef();
		globeContext.windowResize(disclaimer.bindRef);
	});

	////hide brief
	document.getElementById('icn-close').addEventListener('click', (e) => {
		e.target.parentElement.style.transform = 'translateX(100%)';
		e.target.parentElement.style.transition = 'transform 0.6s ease-in-out';

		setTimeout(() => {
			e.target.parentElement.style.visibility = 'hidden';
			globeContext.windowRemoveEventListener('resize', disclaimer.bindRef);
			disclaimer.setDisclaimerHeight(disclaimer.elem.style.visibility);
		}, 700);
	});

	class Img {
		constructor(linkToExpand, linkToCollapse, listId, imgDir, imgArr, img, imgWidth, bindRef) {
			this.linkToExpand = linkToExpand;
			this.linkToCollapse = linkToCollapse;
			this.listId = listId;
			this.imgDir = imgDir;
			this.imgArr = imgArr;
			this.img = img;
			this.imgWidth = imgWidth;
			this.bindRef = bindRef;
		}
	}

	Img.prototype.expand = function (e) {
		e.preventDefault();

		const element = document.getElementById(`list-collapsible-${this.listId}`);
		element.classList.replace('list-collapsed', 'list-expanded');
		e.target.style.visibility = 'hidden';

		const url = `./assets/brief/${this.imgDir}/`;
		const img_srcs = this.imgArr.map((src) => url + src);

		this.lazyLoadImg(e, element, img_srcs, this.listId);
		this.resizeImg();
		this.setbindRef();

		globeContext.windowResize(this.bindRef);
	};

	Img.prototype.collapse = function (e) {
		e.preventDefault();

		const element = document.getElementById(`list-collapsible-${this.listId}`);
		element.classList.replace('list-expanded', 'list-collapsed');

		const link = document.getElementById(`link-expand-collapsible-${this.listId}`);
		link.style.visibility = 'visible';

		this.lazyLoadImg(e, element);
		disclaimer.setDisclaimerHeight(disclaimer.elem.style.visibility);
		globeContext.windowRemoveEventListener('resize', this.bindRef);
	};

	Img.prototype.lazyLoadImg = function (e, parentElem, imgSrcArr, id) {
		this.img = Array.from(parentElem.children).filter(
			(child) => child.firstElementChild && child.firstElementChild.className === 'img-mask'
		)[0].firstElementChild.firstElementChild;

		const imgMask = this.img.parentElement;

		if (e.target.id.includes('expand')) {
			this.img.removeAttribute('data-src');
			this.img.setAttribute('src', imgSrcArr[0]);
			document.getElementById(`imgId-${id}`).textContent = `1 из ${imgSrcArr.length}`;
		} else {
			this.img.removeAttribute('src');
			this.img.setAttribute('data-src', '/');
		}

		let portion;

		let i = 0;
		const _this = this;

		function slideLeft() {
			i > 0 ? i-- : (i = 0);
			_this.img.setAttribute('src', imgSrcArr[i]);

			document.getElementById(`imgId-${id}`).textContent = `${i + 1} из ${imgSrcArr.length}`;
		}

		function slideRight() {
			i < imgSrcArr.length - 1 ? i++ : (i = imgSrcArr.length - 1);

			_this.img.setAttribute('src', imgSrcArr[i]);

			document.getElementById(`imgId-${id}`).textContent = `${i + 1} из ${imgSrcArr.length}`;
		}

		imgMask.onclick = () => {
			if (portion >= 70) {
				slideRight();
			} else if (portion <= 30) {
				slideLeft();
			}
		};

		this.img.onload = () => {
			this.resizeImg();
			disclaimer.setDisclaimerHeight(disclaimer.elem.style.visibility, parentElem);

			this.img.onmousemove = (e) => {
				portion = (e.offsetX / this.imgWidth) * 100;

				if (portion >= 70) {
					imgMask.style.background = `linear-gradient(270deg, rgba(1,6,13,1) ${100 - portion}%, rgba(239,236,238,1) ${
						100 - portion
					}%)`;

					this.img.style.opacity = 0.6;
					imgMask.style.cursor = 'pointer';
				} else if (portion <= 30) {
					imgMask.style.background = `linear-gradient(90deg, rgba(1,6,13,1) ${portion}%, rgba(239,236,238,1) ${portion}%)`;
					this.img.style.opacity = 0.6;
					imgMask.style.cursor = 'pointer';
				} else {
					imgMask.style.background = 'unset';
					imgMask.style.transform = 'unset';
					this.img.style.opacity = 1;
					imgMask.style.cursor = 'default';
				}
			};

			this.img.onmouseleave = () => {
				this.img.style.opacity = 1;
				imgMask.style.background = 'unset';
				imgMask.style.cursor = 'default';
			};

			setTimeout(() => {
				this.img.scrollIntoView();
			}, 450);
		};
	};

	Img.prototype.resizeImg = function () {
		this.imgWidth = this.img.width;
		console.log('+');
	};

	Img.prototype.setbindRef = function () {
		this.bindRef = this.resizeImg.bind(this);
	};

	const img1 = new Img(
		document.getElementById('link-expand-collapsible-01'),
		document.getElementById('link-collapse-collapsible-01'),
		'01',
		'0_rules_headers',
		['0.png', '1.png'],
		null,
		null,
		null
	);

	const img2 = new Img(
		document.getElementById('link-expand-collapsible-02'),
		document.getElementById('link-collapse-collapsible-02'),
		'02',
		'1_rules_fraction',
		['0.png', '1.png'],
		null,
		null,
		null
	);

	const img3 = new Img(
		document.getElementById('link-expand-collapsible-03'),
		document.getElementById('link-collapse-collapsible-03'),
		'03',
		'2_upload_table',
		['0.png', '1.png', '2.png'],
		null,
		null,
		null
	);

	img1.linkToExpand.onclick = (e) => img1.expand(e);
	img1.linkToCollapse.onclick = (e) => img1.collapse(e);
	img2.linkToExpand.onclick = (e) => img2.expand(e);
	img2.linkToCollapse.onclick = (e) => img2.collapse(e);
	img3.linkToExpand.onclick = (e) => img3.expand(e);
	img3.linkToCollapse.onclick = (e) => img3.collapse(e);
};
