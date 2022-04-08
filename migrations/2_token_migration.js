const Token = artifacts.require("Token");

module.exports = async function (deployer) {
	await deployer.deploy(Token, "AI Arts", "AIA", "2522");
};
