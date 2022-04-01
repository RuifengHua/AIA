Moralis.initialize("taWsDU6fLPsqbQZLBwjB9xVNmrekwEaBB1qdVxws"); // Application id from moralis.io
Moralis.serverURL = "https://rfyl3h4u7zc0.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0xB692a710049F8D08502421b1C53448D0a0c8a7ae";
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
	let array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
	if (array.length == 0) {
		return;
	}
	array.forEach(async (AIAId) => {
		let details = await contract.methods.getTokenDetails(AIAId).call({ from: ethereum.selectedAddress });
		renderAIA(AIAId, details);
	});

	$("#game").show();
}

function renderAIA(id, data) {
	let htmlString = `
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
	let element = $.parseHTML(htmlString);
	$("#AIA_row").append(element);

	$(`#btn_sell_${id}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		const amount = web3.utils.toWei("1", "ether");
		contract.methods
			.createAuction(id, amount, 3600000)
			.send({ from: ethereum.selectedAddress })
			.on("receipt", () => {
				console.log("on Auction");
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
