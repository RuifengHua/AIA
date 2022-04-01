Moralis.initialize("taWsDU6fLPsqbQZLBwjB9xVNmrekwEaBB1qdVxws"); // Application id from moralis.io
Moralis.serverURL = "https://rfyl3h4u7zc0.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0xB692a710049F8D08502421b1C53448D0a0c8a7ae";
async function init() {
	try {
		let user = Moralis.User.current();
		if (!user) {
			location.href = "index.html";
		}
	} catch (error) {
		console.log(error);
	}
}

async function logOut() {
	await Moralis.User.logOut();
	location.href = "index.html";
}

document.getElementById("btn-logout").onclick = logOut;
document.getElementById("btn-mint").onclick = mint;

function getAbi() {
	return new Promise((res) => {
		$.getJSON("Token.json", (json) => {
			res(json.abi);
		});
	});
}

async function mint() {
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	contract.methods
		.mint(2, 2, 2, 2)
		.send({ from: ethereum.selectedAddress, value: 1000000000000000000 })
		.on("receipt", () => {
			console.log("done");
		});
}

init();
