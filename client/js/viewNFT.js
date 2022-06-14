Moralis.initialize("IFFbErUlZh9fWkqDiN7hTC0rFcgYHl3INyKAsdsc"); // Application id from moralis.io
Moralis.serverURL = "https://vbomok1hrisb.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x9C614f63A8A48C1821C8F51F5546D5781CD5E80E";

async function init() {
	try {
		let user = Moralis.User.current();
		if (!user) {
			location.href = "index.html";
		}

		let searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has("id")) {
			let param = searchParams.get("id");
			renderGame(param);
		} else {
		}
	} catch (error) {
		console.log(error);
	}
}

async function logOut() {
	await Moralis.User.logOut();
}

document.getElementById("btn-logout").onclick = logOut;

async function renderGame(tokenId) {
	$(".viewNFTimg").html("");
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	let tokenDetail = await contract.methods.getItemDetail(tokenId).call({ from: ethereum.selectedAddress });
	let status = await checkStatus(tokenId, contract, tokenDetail);
	let json = await contract.methods.tokenURI(tokenId).call({ from: ethereum.selectedAddress });
	let data = await $.getJSON(json);
	let color = rarityColor(data.attributes[0]["value"]);
	let htmlString = ``;
	switch (status) {
		case "userOwn":
			htmlString = `
			<div class= "nftimage">
				<img src = "${data.image}"  width="700" height="700">
			</div>
			<div class= "viewNFTDescription">
				<p>Title: ${data.name}</p>
				<p>Id: ${tokenId}</p>
				<p>Theme: ${data.attributes[1]["value"]}</p>
				<p>Tech: ${data.attributes[2]["value"]}</p>
				<p>Owner: ${Moralis.User.current().get("ethAddress")}</p>
				<p style = "background-color: ${color}; border-radius: 5px; height: 70px">Rarity: ${data.attributes[0]["value"]}</p>
				<div>
					<div class="link-wrapper">
						<a id="btn_sell_${tokenId}" class="animated-link" href="#">
							<svg width="210" height="40">
								<rect class="shape" width="210" height="40"></rect>
							</svg>
							<div class="text">Sell</div>
						</a>
					</div>
				</div>
			</div>
			`;
			break;
		case "userListing":
			htmlString = `
			<div class= "nftimage">
				<img src = "${data.image}"  width="700" height="700">
			</div>
			<div class= "viewNFTDescription">
				<p>Title: ${data.name}</p>
				<p>Id: ${tokenId}</p>
				<p>Theme: ${data.attributes[1]["value"]}</p>
				<p>Tech: ${data.attributes[2]["value"]}</p>
				<p>Owner: ${Moralis.User.current().get("ethAddress")}</p>
				<p>Price: ${tokenDetail.price}</p>
				<p style = "background-color: ${color}; border-radius: 5px; height: 70px">Rarity: ${data.attributes[0]["value"]}</p>
				<div>
					<div class="link-wrapper">
						<a id="btn_cancel_sell_${tokenId}" class="animated-link" href="#">
							<svg width="210" height="40">
								<rect class="shape" width="210" height="40"></rect>
							</svg>
							<div class="text">Cancel</div>
						</a>
					</div>
				</div>
			</div>
			`;
			break;
		default:
			htmlString = `
			<div class= "nftimage">
				<img src = "${data.image}"  width="700" height="700">
			</div>
			<div class= "viewNFTDescription">
				<p>Title: ${data.name}</p>
				<p>Id: ${tokenId}</p>
				<p>Theme: ${data.attributes[1]["value"]}</p>
				<p>Tech: ${data.attributes[2]["value"]}</p>
				<p>Owner: ${tokenDetail.seller}</p>
				<p>Price: ${tokenDetail.price}</p>
				<p style = "background-color: ${color}; border-radius: 5px; height: 70px">Rarity: ${data.attributes[0]["value"]}</p>
				<div>
					<div class="link-wrapper">
						<a id="btn_purchase_${tokenId}" class="animated-link" href="#">
							<svg width="210" height="40">
								<rect class="shape" width="210" height="40"></rect>
							</svg>
							<div class="text">Purchase</div>
						</a>
					</div>
				</div>
			</div>
			`;
			break;
	}
	let element = $.parseHTML(htmlString);

	$(".viewNFTimg").append(element);

	$("#game").show();

	$(`#btn_sell_${tokenId}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		const amount = web3.utils.toWei("0.01", "ether");
		contract.methods
			.sell(tokenId, amount)
			.send({ from: ethereum.selectedAddress })
			.on("transactionHash", function (hash) {
				popupLoading();
			})
			.on("receipt", () => {
				popupComplete();
				renderGame(tokenId);
			});
	});

	$(`#btn_cancel_sell_${tokenId}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		contract.methods
			.cancelSell(tokenId)
			.send({ from: ethereum.selectedAddress })
			.on("transactionHash", function (hash) {
				popupLoading();
			})
			.on("receipt", () => {
				popupComplete();
				renderGame(tokenId);
			});
	});

	$(`#btn_purchase_${tokenId}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		const amount = web3.utils.toWei("0.012", "ether");
		contract.methods
			.purchaseItem(tokenId)
			.send({ from: ethereum.selectedAddress, value: amount })
			.on("transactionHash", function (hash) {
				popupLoading();
			})
			.on("receipt", () => {
				popupComplete();
				renderGame(tokenId);
			});
	});
}

function rarityColor(rarity) {
	if (rarity == "Prestigious") {
		return "#ff3a3a";
	} else if (rarity == "Legendary") {
		return "#f16625";
	} else if (rarity == "Epic") {
		return "#9c329c";
	} else if (rarity == "Rare") {
		return "#55a8ad";
	} else if (rarity == "Uncommon") {
		return "#58a55e";
	} else {
		return "#7c7c7c";
	}
}

async function checkStatus(tokenId, contract, tokenDetail) {
	let status = "undefined";
	let owner = await contract.methods.ownerOf(tokenId).call({ from: ethereum.selectedAddress });
	if (owner.toLowerCase() == Moralis.User.current().get("ethAddress")) {
		status = "userOwn";
	} else if (owner == CONTRACT_ADDRESS && tokenDetail.seller.toLowerCase() == Moralis.User.current().get("ethAddress")) {
		status = "userListing";
	} else {
		status = "otherUserOwn";
	}
	return status;
}

function getAbi() {
	return new Promise((res) => {
		$.getJSON("../../build/contracts/Token.json", (json) => {
			res(json.abi);
		});
	});
}

init();

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
