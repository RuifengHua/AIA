Moralis.initialize("XVakVBb5UPhYx6PL1ODCc9XltLKYQKnpEQmksnuc"); // Application id from moralis.io
Moralis.serverURL = "https://jhoas5yvsout.usemoralis.com:2053/serverr"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x8bB7a02Cebe8E2D551FfF8a2e6F046241662f146";

async function init() {
	try {
		let user = Moralis.User.current();
		if (!user) {
			location.href = "index.html";
		}

		let searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has('id')) {
			let param = searchParams.get('id')
			renderGame(param);
		}
		else { }
	} catch (error) {
		console.log(error);
	}
}

async function logOut() {
	await Moralis.User.logOut();
}

document.getElementById("btn-logout").onclick = logOut;

async function renderGame(tokenId) {
	$(".container ul").html("");
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	let json = await contract.methods.tokenURI(tokenId).call({ from: ethereum.selectedAddress });
	let data = await $.getJSON(json);
	let htmlString = `
	<img class= "nftimage" src = "${data.image}"/>
	<div class= "viewNFTDescription">
		<p>${data.name}</p>
		<p>Id:${tokenId}</p>
		<p>${data.attributes[0]["value"]}</p>
	</div>
	
	`;
	let element = $.parseHTML(htmlString);

	$(".viewNFTimg").append(element);

	$("#game").show();
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


function getAbi() {
	return new Promise((res) => {
		$.getJSON("../../build/contracts/Token.json", (json) => {
			res(json.abi);
		});
	});
}



init();


