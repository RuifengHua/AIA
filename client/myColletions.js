Moralis.initialize("WjhjvrFqH8ySfeGF8v8Ip7MTjL8XPPKKI6jSuFxX"); // Application id from moralis.io
Moralis.serverURL = "https://rcoy3yxqob8k.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x99103926148E153F45C141c34D2410a74a393fA0";

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
	let htmlString = ``;
	if (!onAuction) {
		htmlString = `
		<div class="col-md-3 mx-1 card id="pet_${id}">						
			<img class="card-img-top pet_img" src="${data.image}" />
			<div class="card-body">
				<div>Id: <span class="pet_id">${id}</span></div>
				<div>
					<button id="btn_sell_${id}" class="btn btn-primary btn-block">Sell</button>
					<button id="btn_view_${id}" class="btn btn-primary btn-block">View</button>
				</div>
			</div>
		</div>`;
	} else {
		htmlString = `
		<div class="col-md-3 mx-1 card id="pet_${id}">						
			<img class="card-img-top pet_img" src="${data.image}" />
			<div class="card-body">
				<div>Id: <span class="pet_id">${id}</span></div>
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
		const amount = web3.utils.toWei("0.01", "ether");
		contract.methods
			.sell(id, amount, 3600000)
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
			.cancelSell(id)
			.send({ from: ethereum.selectedAddress })
			.on("receipt", () => {
				console.log("on cancel");
				renderGame();
			});
	});

	$(`#btn_view_${id}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		let json = await contract.methods.tokenURI(id).call({ from: ethereum.selectedAddress });
		$.getJSON(json, function (data) {
			console.log(data.image);
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
