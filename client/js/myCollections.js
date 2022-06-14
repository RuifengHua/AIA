Moralis.initialize("IFFbErUlZh9fWkqDiN7hTC0rFcgYHl3INyKAsdsc"); // Application id from moralis.io
Moralis.serverURL = "https://vbomok1hrisb.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x2e64B0919c2891Ce0916e9d42A7bd3a94A897f74";
var sell_id = 0;
async function init() {
	try {
		let user = Moralis.User.current();
		if (!user) {
			location.href = "index.html";
		}
		renderGame(true, "SID", "");
	} catch (error) {
		console.log(error);
	}
}

async function logOut() {
	await Moralis.User.logOut();
}

document.getElementById("btn-logout").onclick = logOut;

async function renderGame(showOwned, sort, keyWord) {
	$(".container ul").html("");
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	let dataArray = [];
	if (showOwned) {
		let userAIAs = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
		if (userAIAs.length != 0) {
			for (const AIAId of userAIAs) {
				let json = await contract.methods.tokenURI(AIAId).call({ from: ethereum.selectedAddress });
				let data = await $.getJSON(json);
				if (sort == "SID") {
					if (keyWord == "" || data.name.includes(keyWord) || AIAId.toString() == keyWord) {
						renderAIA(AIAId, data, false);
					}
				} else {
					if (keyWord == "" || data.name.includes(keyWord) || AIAId.toString() == keyWord) {
						{
							data["id"] = AIAId;
							dataArray.push(data);
						}
					}
				}
			}
		}
		if (sort != "SID") {
			dataArray.sort(sortByRarity());
			if (sort == "RHL") {
				for (const data of dataArray.reverse()) {
					renderAIA(data["id"], data, false);
				}
			} else {
				for (const data of dataArray) {
					renderAIA(data["id"], data, false);
				}
			}
		}
	} else {
		let useronAuctionAIAs = await contract.methods.getListedItemsForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
		if (useronAuctionAIAs.length != 0) {
			for (const AIAId of useronAuctionAIAs) {
				let json = await contract.methods.tokenURI(AIAId).call({ from: ethereum.selectedAddress });
				let data = await $.getJSON(json);
				if (sort == "SID") {
					if (keyWord == "" || data.name.includes(keyWord) || AIAId.toString() == keyWord) {
						renderAIA(AIAId, data, true);
					}
				} else {
					if (keyWord == "" || data.name.includes(keyWord) || AIAId.toString() == keyWord) {
						data["id"] = AIAId;
						dataArray.push(data);
					}
				}
			}
		}
		if (sort != "SID") {
			dataArray.sort(sortByRarity());
			if (sort == "RHL") {
				for (const data of dataArray.reverse()) {
					renderAIA(data["id"], data, true);
				}
			} else {
				for (const data of dataArray) {
					renderAIA(data["id"], data, true);
				}
			}
		}
	}

	$("#game").show();
}

function sortByRarity() {
	return function (a, b) {
		if (rarityNum(a.attributes[0]["value"]) > rarityNum(b.attributes[0]["value"])) return 1;
		else if (rarityNum(a.attributes[0]["value"]) < rarityNum(b.attributes[0]["value"])) return -1;

		return 0;
	};
}

function rarityNum(rarity) {
	if (rarity == "Prestigious") {
		return 5;
	} else if (rarity == "Legendary") {
		return 4;
	} else if (rarity == "Epic") {
		return 3;
	} else if (rarity == "Rare") {
		return 2;
	} else if (rarity == "Uncommon") {
		return 1;
	} else {
		return 0;
	}
}

function rarityName(rarity) {
	if (rarity == "Prestigious") {
		return "card-bottomP";
	} else if (rarity == "Legendary") {
		return "card-bottomL";
	} else if (rarity == "Epic") {
		return "card-bottomE";
	} else if (rarity == "Rare") {
		return "card-bottomR";
	} else if (rarity == "Uncommon") {
		return "card-bottomU";
	} else {
		return "card-bottomC";
	}
}

function renderAIA(id, data, onAuction) {
	let card_bottom = rarityName(data.attributes[0]["value"]);
	let htmlString = ``;
	if (!onAuction) {
		htmlString = `
		<li class="card" id="card_AIA_${id}">
			<a class="card-image" href="viewNFT.html?id=${id}">
				<img loading="lazy" src="${data.image}"/>
			</a>
			<div class="${card_bottom}">
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
			<a class="card-image" href="viewNFT.html?id=${id}">
				<img loading="lazy" src="${data.image}"/>
			</a>
			<div class="${card_bottom}">
			<p class="description">Id:${id}</p>
			<p class="description">${data.name}</p>
			<p class="description">${data.attributes[0]["value"]}</p>
			<div>
				<div class="link-wrapper">
					<a id="btn_cancel_sell_${id}" class="animated-link" href="#">
						<svg width="210" height="40">
							<rect class="shape" width="210" height="40"></rect>
						</svg>
						<div class="text">Cancel</div>
					</a>
				</div>
			</div>
		<div>
		</li>`;
	}
	let element = $.parseHTML(htmlString);

	$(".container ul").append(element);

	$(`#btn_sell_${id}`).click(async () => {
		sell_id = id
		popupLoading_sell()
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
				renderGame(false, "SID", "");
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


$(".popup-close-sell-close").click(() => {
	$(".popup-wrap-sell").fadeOut(500);
	$(".popup-box-sell").removeClass("transform-in").addClass("transform-out");
});

$(".popup-close-sell").click(async() => {
	$(".popup-wrap-sell").fadeOut(500);
	$(".popup-box-sell").removeClass("transform-in").addClass("transform-out");
	var amount_eth = $("#input-amount").val();
	if (isNaN(amount_eth)) 
	{
	  alert("Must input numbers");
	  return false;
	}
	else{
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		const amount = web3.utils.toWei(amount_eth, "ether");
		contract.methods
			.sell(sell_id, amount)
			.send({ from: ethereum.selectedAddress })
			.on("transactionHash", function (hash) {
				popupLoading();
			})
			.on("receipt", () => {
				popupComplete();
				renderGame(true, "SID", "");
			});
	}

});




function popupLoading_sell() {
	$("#wrap_sell").show();
	$("#sell_prompt").show();
	$(".popup-close-sell").show();
	$(".popup-close-sell-close").show();
	$(".popup-wrap-sell").fadeIn(500);
	$(".popup-box-sell").removeClass("transform-out").addClass("transform-in");
}



var currentValue = true;
var currentOrder = "SID";
function handleClick(myRadio) {
	if (myRadio.value == 2) {
		renderGame(false, "SID", "");
	} else {
		renderGame(true, "SID", "");
	}
	if (myRadio.value == 1) {
		currentValue = true;
	} else {
		currentValue = false;
	}
}

$(".RHL").click(() => {
	renderGame(currentValue, "RHL", "");
	currentOrder = "RHL";
});
$(".RLH").click(() => {
	renderGame(currentValue, "RLH", "");
	currentOrder = "RLH";
});
$(".SID").click(() => {
	renderGame(currentValue, "SID", "");
	currentOrder = "SID";
});

$("#searchKeyword").keyup(function (e) {
	if (e.keyCode == 13) {
		var keyWord = $("#searchKeyword").val();
		if (keyWord != "") {
			renderGame(currentValue, currentOrder, keyWord);
		}
	}
});

$(".clearSearch").click(() => {
	renderGame(currentValue, "SID", "");
	currentOrder = "SID";
});

init();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
