Moralis.initialize("IFFbErUlZh9fWkqDiN7hTC0rFcgYHl3INyKAsdsc"); // Application id from moralis.io
Moralis.serverURL = "https://vbomok1hrisb.usemoralis.com:2053/server"; //Server url from moralis.io
const CONTRACT_ADDRESS = "0x2e64B0919c2891Ce0916e9d42A7bd3a94A897f74";
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

function getAbi() {
	return new Promise((res) => {
		$.getJSON("../../build/contracts/Token.json", (json) => {
			res(json.abi);
		});
	});
}

init();
getUserActivity(Moralis.User.current().get("ethAddress"));

/*
	  event Mint(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
	event ListAnItem(address indexed owner, uint256 indexed tokenId, uint256 price, uint256 duration, uint256 timestamp);
	event CancelAnListedItem(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
	event PurchaseAnItem(address indexed buyer, uint256 indexed tokenId, address indexed seller, uint256 price, uint256 timestamp);
*/

async function getUserActivity(userAddress) {
	let allActivities = [];
	await Moralis.enableWeb3();
	let web3 = new window.Web3(Moralis.provider);

	let query = new Moralis.Query(Moralis.Object.extend("MintEvents"));
	query.equalTo("owner", userAddress);
	let results = await query.find();
	for (let i = 0; i < results.length; i++) {
		const object = results[i];
		let d = new Date(object.attributes.block_timestamp);
		let date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.toLocaleTimeString("it-IT");
		allActivities.push({ event: "Generate", owner: object.attributes.owner, TokenId: object.attributes.tokenId, time: date });
	}

	query = new Moralis.Query(Moralis.Object.extend("ListingEvents"));
	query.equalTo("owner", userAddress);
	results = await query.find();
	for (let i = 0; i < results.length; i++) {
		const object = results[i];
		let d = new Date(object.attributes.block_timestamp);
		let date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.toLocaleTimeString("it-IT");
		let price = web3.utils.fromWei(object.attributes.price, "ether");
		allActivities.push({
			event: "Listing",
			owner: object.attributes.owner,
			TokenId: object.attributes.tokenId,
			price: price,
			time: date,
		});
	}

	query = new Moralis.Query(Moralis.Object.extend("CancelListingEvents"));
	query.equalTo("owner", userAddress);
	results = await query.find();
	for (let i = 0; i < results.length; i++) {
		const object = results[i];
		let d = new Date(object.attributes.block_timestamp);
		let date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.toLocaleTimeString("it-IT");
		allActivities.push({
			event: "Cancel Listing",
			owner: object.attributes.owner,
			TokenId: object.attributes.tokenId,
			time: date,
		});
	}

	query = new Moralis.Query(Moralis.Object.extend("PurchaseEvents"));
	query.equalTo("buyer", userAddress);
	results = await query.find();
	for (let i = 0; i < results.length; i++) {
		const object = results[i];
		let d = new Date(object.attributes.block_timestamp);
		let date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.toLocaleTimeString("it-IT");
		let price = web3.utils.fromWei(object.attributes.price, "ether");
		allActivities.push({
			event: "Purchase",
			buyer: object.attributes.buyer,
			TokenId: object.attributes.tokenId,
			seller: object.attributes.seller,
			price: price,
			time: date,
		});
	}

	query = new Moralis.Query(Moralis.Object.extend("PurchaseEvents"));
	query.equalTo("seller", userAddress);
	results = await query.find();
	for (let i = 0; i < results.length; i++) {
		const object = results[i];
		let d = new Date(object.attributes.block_timestamp);
		let date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.toLocaleTimeString("it-IT");
		let price = web3.utils.fromWei(object.attributes.price, "ether");
		console.log(price);
		allActivities.push({
			event: "Sold",
			buyer: object.attributes.buyer,
			TokenId: object.attributes.tokenId,
			seller: object.attributes.seller,
			price: price,
			time: date,
		});
	}
	allActivities.sort(sortByDate());
	renderActivities(allActivities);
}

function sortByDate() {
	return function (a, b) {
		if (a["time"] > b["time"]) return -1;
		else if (a["time"] < b["time"]) return 1;

		return 0;
	};
}

function renderActivities(allActivities) {
	allActivities.forEach((obj) => {
		let htmlString = ``;
		switch (obj.event) {
			case "Generate":
				htmlString = `
				<tr class="trgenerate">
					<td>${obj.event}</td>
					<td>TokenId:\n${obj.TokenId}</td>
					<td>N/A</td>
					<td>N/A</td>
					<td>${obj.time}</td>
				</tr>
				`;
				break;
			case "Listing":
				htmlString = `
				<tr class = "trlisting">
					<td>${obj.event}</td>
					<td>TokenId:\n${obj.TokenId}</td>
					<td>N/A</td>
					<td>Price:\n${obj.price} eth</td>
					<td>${obj.time}</td>
				</tr>
				`;
				break;
			case "Cancel Listing":
				htmlString = `
				<tr class = "trcancelListing">
					<td>${obj.event}</td>
					<td>TokenId:\n${obj.TokenId}</td>
					<td>N/A</td>
					<td>N/A</td>
					<td>${obj.time}</td>
				</tr>
				`;
				break;
			case "Purchase":
				htmlString = `
				<tr class = "trpurchase">
					<td>${obj.event}</td>
					<td>TokenId:\n${obj.TokenId}</td>
					<td>Seller:\n${obj.seller}</td>
					<td>Price:\n${obj.price} eth</td>
					<td>${obj.time}</td>
				</tr>
				`;
				break;
			case "Sold":
				htmlString = `
				<tr class ="trsold">
					<td>${obj.event}</td>
					<td>TokenId:\n${obj.TokenId}</td>
					<td>Buyer:\n${obj.buyer}</td>
					<td>Price:\n${obj.price}  eth</td>
					<td>${obj.time}</td>
				</tr>
				`;
				break;
		}
		let element = $.parseHTML(htmlString);

		$(".container_activity tbody").append(element);
	});
}
