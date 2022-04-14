Moralis.initialize("WjhjvrFqH8ySfeGF8v8Ip7MTjL8XPPKKI6jSuFxX"); // Application id from moralis.io
Moralis.serverURL = "https://rcoy3yxqob8k.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0xa74c18eCedA4d0b0D6c100BCF232F8cC96f4D857";

async function init() {
	try {
		let user = Moralis.User.current();
		if (!user) {
			location.href = "index.html";
		}
		renderGame();
	} catch (error) {
		console.log(error);
	}
}

async function logOut() {
	await Moralis.User.logOut();
}

document.getElementById("btn-logout").onclick = logOut;

async function renderGame() {
	$(".container ul").html("");
	//render properties from SC
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	let userAIAs = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
	if (userAIAs.length != 0) {
		userAIAs.forEach(async (AIAId) => {
			let json = await contract.methods.tokenURI(AIAId).call({ from: ethereum.selectedAddress });
			$.getJSON(json, function (data) {
				renderAIA(AIAId, data, false);
			});
		});
	}

	let useronAuctionAIAs = await contract.methods.getListedItemsForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
	if (useronAuctionAIAs.length != 0) {
		useronAuctionAIAs.forEach(async (AIAId) => {
			let json = await contract.methods.tokenURI(AIAId).call({ from: ethereum.selectedAddress });
			$.getJSON(json, function (data) {
				renderAIA(AIAId, data, true);
			});
		});
	}

	$("#game").show();
}

function renderAIA(id, data, onAuction) {
	console.log(data);
	let htmlString = ``;
	if (!onAuction) {
		htmlString = `
		<li class="card" id="card_AIA_${id}">
			<a class="card-image" href="#" target="_blank">
				<img src="${data.image}"/>
			</a>
			<div class="card-bottom">
				<p class="description">Id:${id}</p>
				<p class="description">${data.name}</p>
				<p class="description">${data.attributes[0]["value"]}</p>
				<div>
					<div class="link-wrapper">
						<a id="btn_sell_${id}" class="animated-link" href="#">
							<svg width="210" height="40">
								<rect class="shape" width="210" height="40"></rect>
							</svg>
							<div class="text">Sell</div>
						</a>
					</div>
				</div>
			<div>
		</li>`;
	} else {
		htmlString = `
		<li class="card" id="card_AIA_${id}">
			<a class="card-image" href="#" target="_blank">
				<img src="${data.image}"/>
			</a>
			<div class="card-bottom">
				<p class="description">id:${id}</p>
				<p class="description">rarity:${data.attributes[0]["value"]}</p>
				<p class="description">collection:${data.attributes[1]["value"]}</p>
				<div class="link-wrapper">
				<a id="btn_cancel_sell_${id}" class="animated-link" href="#">
					<svg width="210" height="40">
						<rect class="shape" width="210" height="40"></rect>
					</svg>
					<div class="text">Cancel</div>
				</a>
			</div>
			</div>
		</li>`;
	}
	let element = $.parseHTML(htmlString);

	$(".container ul").append(element);

	$(`#btn_sell_${id}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		const amount = web3.utils.toWei("0.01", "ether");
		contract.methods
			.sell(id, amount, 3600000)
			.send({ from: ethereum.selectedAddress })
			.on("transactionHash", function (hash) {
				popupLoading();
			})
			.on("receipt", () => {
				popupComplete();
				renderGame();
			});
	});

	$(`#btn_cancel_sell_${id}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		contract.methods
			.cancelSell(id)
			.send({ from: ethereum.selectedAddress })
			.on("transactionHash", function (hash) {
				popupLoading();
			})
			.on("receipt", () => {
				popupComplete();
				renderGame();
			});
	});
}

function getAbi() {
	return new Promise((res) => {
		$.getJSON("../../build/contracts/Token.json", (json) => {
			res(json.abi);
		});
	});
}

function popupLoading() {
	$("#wrap").show();
	$("#reminder").show();
	$(".success-animation").hide();
	$(".popup-close").hide();
	$(".popup-wrap").fadeIn(500);
	$(".popup-box").removeClass("transform-out").addClass("transform-in");
}

function popupComplete() {
	$("#wrap").hide();
	$("#reminder").hide();
	$(".success-animation").show();
	$(".popup-close").show();
}

$(".popup-close").click(() => {
	$(".popup-wrap").fadeOut(500);
	$(".popup-box").removeClass("transform-in").addClass("transform-out");
});

init();

var $body = document.body,
	$wrap = document.getElementById("wrap"),
	areawidth = window.innerWidth,
	areaheight = window.innerHeight,
	canvassize = 500,
	length = 30,
	radius = 5.6,
	rotatevalue = 0.035,
	acceleration = 0,
	animatestep = 0,
	toend = false,
	pi2 = Math.PI * 2,
	group = new THREE.Group(),
	mesh,
	ringcover,
	ring,
	camera,
	scene,
	renderer;

camera = new THREE.PerspectiveCamera(65, 1, 1, 10000);
camera.position.z = 150;

scene = new THREE.Scene();
// scene.add(new THREE.AxisHelper(30));
scene.add(group);

mesh = new THREE.Mesh(
	new THREE.TubeGeometry(
		new (THREE.Curve.create(
			function () {},
			function (percent) {
				var x = length * Math.sin(pi2 * percent),
					y = radius * Math.cos(pi2 * 3 * percent),
					z,
					t;

				t = (percent % 0.25) / 0.25;
				t = (percent % 0.25) - (2 * (1 - t) * t * -0.0185 + t * t * 0.25);
				if (Math.floor(percent / 0.25) == 0 || Math.floor(percent / 0.25) == 2) {
					t *= -1;
				}
				z = radius * Math.sin(pi2 * 2 * (percent - t));

				return new THREE.Vector3(x, y, z);
			}
		))(),
		200,
		1.1,
		2,
		true
	),
	new THREE.MeshBasicMaterial({
		color: 0xffffff,
		// , wireframe: true
	})
);
group.add(mesh);

ringcover = new THREE.Mesh(
	new THREE.PlaneGeometry(50, 15, 1),
	new THREE.MeshBasicMaterial({
		color: 0x121212,
		opacity: 0,
		transparent: true,
	})
);
ringcover.position.x = length + 1;
ringcover.rotation.y = Math.PI / 2;
group.add(ringcover);

ring = new THREE.Mesh(
	new THREE.RingGeometry(4.3, 5.55, 32),
	new THREE.MeshBasicMaterial({
		color: 0xffffff,
		opacity: 0,
		transparent: true,
	})
);
ring.position.x = length + 1.1;
ring.rotation.y = Math.PI / 2;
group.add(ring);

// fake shadow
(function () {
	var plain, i;
	for (i = 0; i < 10; i++) {
		plain = new THREE.Mesh(
			new THREE.PlaneGeometry(length * 2 + 1, radius * 3, 1),
			new THREE.MeshBasicMaterial({
				color: 0x121212,
				transparent: true,
				opacity: 0.13,
			})
		);
		plain.position.z = -2.5 + i * 0.5;
		group.add(plain);
	}
})();

renderer = new THREE.WebGLRenderer({
	antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvassize, canvassize);
renderer.setClearColor("#121212");

$wrap.appendChild(renderer.domElement);

$body.addEventListener("mousedown", start, false);
$body.addEventListener("touchstart", start, false);
$body.addEventListener("mouseup", back, false);
$body.addEventListener("touchend", back, false);

animate();

function start() {
	toend = true;
}

function back() {
	toend = false;
}

function tilt(percent) {
	group.rotation.y = percent * 0.5;
}

function render() {
	var progress;

	animatestep = Math.max(0, Math.min(240, toend ? animatestep + 1 : animatestep - 4));
	acceleration = easing(animatestep, 0, 1, 240);

	if (acceleration > 0.35) {
		progress = (acceleration - 0.35) / 0.65;
		group.rotation.y = (-Math.PI / 2) * progress;
		group.position.z = 50 * progress;
		progress = Math.max(0, (acceleration - 0.97) / 0.03);
		mesh.material.opacity = 1 - progress;
		ringcover.material.opacity = ring.material.opacity = progress;
		ring.scale.x = ring.scale.y = 0.9 + 0.1 * progress;
	}

	renderer.render(scene, camera);
}

function animate() {
	mesh.rotation.x += rotatevalue + acceleration;
	render();
	requestAnimationFrame(animate);
}

function easing(t, b, c, d) {
	if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
	return (c / 2) * ((t -= 2) * t * t + 2) + b;
}
