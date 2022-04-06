Moralis.initialize("WjhjvrFqH8ySfeGF8v8Ip7MTjL8XPPKKI6jSuFxX"); // Application id from moralis.io
Moralis.serverURL = "https://rcoy3yxqob8k.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x4f13d75C86722Ef4483a7ab650eC0c5eE6806811";
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
	location.href = "index.html";
}

document.getElementById("btn-logout").onclick = logOut;

async function renderGame() {
	$("#AIA_row").html("");
	//render properties from SC
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);
	let abi = await getAbi();
	let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
	let userAIAs = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
	if (userAIAs.length != 0) {
		userAIAs.forEach(async (AIAId) => {
			let details = await contract.methods.getTokenDetails(AIAId).call({ from: ethereum.selectedAddress });
			renderAIA(AIAId, details, false);
		});
	}

	let useronAuctionAIAs = await contract.methods.getListedItemsForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
	if (useronAuctionAIAs.length != 0) {
		useronAuctionAIAs.forEach(async (AIAId) => {
			let details = await contract.methods.getTokenDetails(AIAId).call({ from: ethereum.selectedAddress });
			renderAIA(AIAId, details, true);
		});
	}

	$("#game").show();
}

function renderAIA(id, data, onAuction) {
	let htmlString = ``;
	if (!onAuction) {
		htmlString = `
		<div class="col-md-3 mx-1 card id="pet_${id}">						
			<img class="card-img-top pet_img" src="pet.png" />
			<div class="card-body">
				<div>Id: <span class="pet_id">${id}</span></div>
				<div>Attribute1: <span class="AIA_attribute1">${data.attribute1}</span></div>
				<div>Attribute2: <span class="AIA_attribute2">${data.attribute2}</span></div>
				<div>Attribute3: <span class="AIA_attribute3">${data.attribute3}</span></div>
				<div>Attribute4: <span class="AIA_attribute4">${data.attribute4}</span></div>
				<div>
					<button id="btn_sell_${id}" class="btn btn-primary btn-block">Sell</button>
				</div>
			</div>
		</div>`;
	} else {
		htmlString = `
		<div class="col-md-3 mx-1 card id="pet_${id}">						
			<img class="card-img-top pet_img" src="pet.png" />
			<div class="card-body">
				<div>Id: <span class="pet_id">${id}</span></div>
				<div>Attribute1: <span class="AIA_attribute1">${data.attribute1}</span></div>
				<div>Attribute2: <span class="AIA_attribute2">${data.attribute2}</span></div>
				<div>Attribute3: <span class="AIA_attribute3">${data.attribute3}</span></div>
				<div>Attribute4: <span class="AIA_attribute4">${data.attribute4}</span></div>
				<div>
				<button id="btn_cancel_sell_${id}" class="btn btn-primary btn-block">Cancel</button>
			</div>
			</div>
		</div>`;
	}
	let element = $.parseHTML(htmlString);

	$("#AIA_row").append(element);

	$(`#btn_sell_${id}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		const amount = web3.utils.toWei("1", "ether");
		contract.methods
			.createItemToSell(id, amount, 3600000)
			.send({ from: ethereum.selectedAddress })
			.on("receipt", async () => {
				console.log("on Auction");
				renderGame();
			});
	});

	$(`#btn_cancel_sell_${id}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		contract.methods
			.cancelItemToSell(id)
			.send({ from: ethereum.selectedAddress })
			.on("receipt", () => {
				console.log("on cancel");
				renderGame();
			});
	});
}

function getAbi() {
	return new Promise((res) => {
		$.getJSON("Token.json", (json) => {
			res(json.abi);
		});
	});
}

init();
