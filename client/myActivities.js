Moralis.initialize("WjhjvrFqH8ySfeGF8v8Ip7MTjL8XPPKKI6jSuFxX"); // Application id from moralis.io
Moralis.serverURL = "https://rcoy3yxqob8k.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x99103926148E153F45C141c34D2410a74a393fA0";
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

function getAbi() {
	return new Promise((res) => {
		$.getJSON("Token.json", (json) => {
			res(json.abi);
		});
	});
}

init();
