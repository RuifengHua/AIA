Moralis.initialize("WjhjvrFqH8ySfeGF8v8Ip7MTjL8XPPKKI6jSuFxX"); // Application id from moralis.io
Moralis.serverURL = "https://rcoy3yxqob8k.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0xAAf4CeA14EB5e40896bf01A72736a22C434A9AD3";
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
	let array = await contract.methods.getAllTokensForUser(CONTRACT_ADDRESS).call({ from: ethereum.selectedAddress });
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
				<button id="btn_purchase_${id}" class="btn btn-primary btn-block">Buy</button>
			</div>
        </div>
    </div>`;
	let element = $.parseHTML(htmlString);
	$("#AIA_row").append(element);

	$(`#btn_purchase_${id}`).click(async () => {
		await Moralis.enableWeb3();
		let web3 = new window.Web3(Moralis.provider);
		let abi = await getAbi();
		let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
		const amount = web3.utils.toWei("0.012", "ether");
		contract.methods
			.purchaseItem(id)
			.send({ from: ethereum.selectedAddress, value: amount })
			.on("receipt", () => {
				console.log("bought");
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
