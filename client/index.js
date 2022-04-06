Moralis.initialize("WjhjvrFqH8ySfeGF8v8Ip7MTjL8XPPKKI6jSuFxX"); // Application id from moralis.io
Moralis.serverURL = "https://rcoy3yxqob8k.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x4f13d75C86722Ef4483a7ab650eC0c5eE6806811";
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
			user = await Moralis.authenticate({ signingMessage: "Hello World!" });
			console.log(user);
			console.log(user.get("ethAddress"));
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

function start() {
	location.href = "generate.html";
}

function getAbi() {
	return new Promise((res) => {
		$.getJSON("Token.json", (json) => {
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
	console.log(balance.toString());
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

document.getElementById("btn-start").onclick = start;
document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;
document.getElementById("btn-getBalance").onclick = getBalance;
document.getElementById("btn-withdrawBalance").onclick = withdrawBalance;

init();
