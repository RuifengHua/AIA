Moralis.initialize("IFFbErUlZh9fWkqDiN7hTC0rFcgYHl3INyKAsdsc"); // Application id from moralis.io
Moralis.serverURL = "https://vbomok1hrisb.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x2e64B0919c2891Ce0916e9d42A7bd3a94A897f74";
async function init() {
	try {
		let user = Moralis.User.current();
		if (!user) {
			$("#btn-login").show();
			$("#btn-start").hide();
			$("#btn-logout").hide();
		} else {
			$("#btn-login").hide();
			$("#btn-start").show();
			$("#btn-logout").show();
		}
	} catch (error) {
		console.log(error);
	}
}

async function login() {
	let user = Moralis.User.current();
	if (!user) {
		try {
			user = await Moralis.authenticate({ signingMessage: "Welcome to AIA Beta" });
			$("#btn-login").hide();
			$("#btn-start").show();
			$("#btn-logout").show();
		} catch (error) {
			console.log(error);
		}
	}
}

async function logOut() {
	await Moralis.User.logOut();
	$("#btn-login").show();
	$("#btn-start").hide();
	$("#btn-logout").hide();
}

function userStart() {
	location.href = "html/generate.html";
}

function getAbi() {
	return new Promise((res) => {
		$.getJSON("../build/contracts/Token.json", (json) => {
			res(json.abi);
		});
	});
}

async function getBalance() {
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	let balance = await contract.methods.getBalance().call({ from: ethereum.selectedAddress });
	console.log((balance / 1000000000000000000).toString());
}

async function withdrawBalance() {
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	contract.methods
		.withdrawBalance()
		.send({ from: ethereum.selectedAddress })
		.on("receipt", () => {
			console.log("Withdrawed!!");
		});
}

async function requestRandom() {
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	contract.methods
		.requestRandomWords()
		.send({ from: ethereum.selectedAddress })
		.on("receipt", () => {
			console.log("requested!!");
		});
}

async function shuffle() {
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

	contract.methods
		.shuffle()
		.send({ from: ethereum.selectedAddress })
		.on("transactionHash", function (hash) {
			popupLoading();
		})
		.on("receipt", () => {
			popupComplete();
			console.log("shuffled!!");
		});
}

async function getShuffle() {
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

	let result = await contract.methods.getOrder().call({ from: ethereum.selectedAddress });
	console.log(result);
}

document.getElementById("btn-start").onclick = userStart;
document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;
/*
document.getElementById("btn-getBalance").onclick = getBalance;
document.getElementById("btn-withdrawBalance").onclick = withdrawBalance;
document.getElementById("btn-requestRandom").onclick = requestRandom;
document.getElementById("btn-shuffle").onclick = shuffle;
document.getElementById("btn-getShuffle").onclick = getShuffle;
*/
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
