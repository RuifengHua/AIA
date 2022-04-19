Moralis.initialize("XVakVBb5UPhYx6PL1ODCc9XltLKYQKnpEQmksnuc"); // Application id from moralis.io
Moralis.serverURL = "https://jhoas5yvsout.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x8bB7a02Cebe8E2D551FfF8a2e6F046241662f146";
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
}

document.getElementById("btn-logout").onclick = logOut;
document.getElementById("btn-mint").onclick = mint;

function getAbi() {
	return new Promise((res) => {
		$.getJSON("../../build/contracts/Token.json", (json) => {
			res(json.abi);
		});
	});
}

async function mint() {
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	const amount = web3.utils.toWei("0.01", "ether");
	const receipt = await contract.methods
		.mint()
		.send({ from: ethereum.selectedAddress, value: amount })
		.on("transactionHash", function (hash) {
			popupLoading();
		})
		.on("receipt", () => {
			popupComplete();
		});
	let mintedTokenId = receipt.events["Mint"]["returnValues"]["tokenId"];
	let json = await contract.methods.tokenURI(mintedTokenId).call({ from: ethereum.selectedAddress });
	$.getJSON(json, function (data) {
		showMintedNFT(mintedTokenId, data);
	});
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

function showMintedNFT(id, data) {
	let card_bottom = rarityName(data.attributes[0]["value"]);
	$(".popup-box-mint-append").html("");
	let htmlString = `
	<div id="newNFTMinted">New NFT Generated!</div>
	<a class="card-image" href="#" target="_blank">
		<img src="${data.image}"/>
	</a>
	<div class=${card_bottom}>
		<p class="description">Id:${id}</p>
		<p class="description">${data.name}</p>
		<p class="description">${data.attributes[0]["value"]}</p>
	<div>
	`;
	let element = $.parseHTML(htmlString);

	$(".popup-box-mint-append").append(element);
}

function popupLoading() {
	$(".popup-box-mint").hide();
	$(".popup-box-minting").show();
	$("#wrap").show();
	$("#reminder_minting").show();
	$(".popup-close").hide();
	$(".popup-wrap").fadeIn(500);
	$(".popup-box-minting").removeClass("transform-out").addClass("transform-in");
	typeEffect(document.getElementById("centeralign"), 70);
}

function popupComplete() {
	$(".popup-box-minting").hide();
	$(".popup-box-mint").show();
	$(".popup-box-mint").removeClass("transform-out").addClass("transform-in");
	$("#wrap").hide();
	$(".popup-close").show();
}

$(".popup-close").click(() => {
	$(".popup-wrap").fadeOut(500);
	$(".popup-box-mint").removeClass("transform-in").addClass("transform-out");
});

init();

function typeEffect(element, speed) {
	var text = element.innerHTML;
	element.innerHTML = "";

	var i = 0;
	var timer = setInterval(function () {
		if (i < text.length) {
			element.append(text.charAt(i));
			i++;
		} else {
			clearInterval(timer);
		}
	}, speed);
}
