pragma solidity 0.8.13;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Token is Ownable, IERC721Receiver, ReentrancyGuard, VRFConsumerBaseV2, ERC721URIStorage {
    

    /////////////////////////////////Random number//////////////////////////////
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // Rinkeby coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 100000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords =  1;

    uint256 private baseSeed;
    uint256 public s_requestId;
    address s_owner;
    // Assumes the subscription is funded sufficiently.
    function requestRandomWords() external onlyOwner {
        // Will revert if subscription is not set and funded.
        s_requestId = COORDINATOR.requestRandomWords(keyHash,s_subscriptionId,requestConfirmations,callbackGasLimit,numWords);
    }
    
    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        baseSeed = randomWords[0];
    }

    constructor (string memory name, string memory symbol, uint64 subscriptionId, uint64 _totalSupply) ERC721(name, symbol) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
        totalSupply = _totalSupply;
    }

    uint256 increment = 0;
    uint256[190] private order;
    uint256 totalSupply;
    function shuffle() external onlyOwner{
        uint256[] memory unshuffled = new uint256[](totalSupply);
        uint8 i;
        uint8 j = 1;
        for (i=0; i < totalSupply; i++) {
            if (j == 15 || j == 185 || j == 165 || j == 127 || j == 37 || j == 133 || j == 25 || j == 109 || j == 48 || j == 57)
            {
                unshuffled[i] = j+1;
                j = j + 1;
            }
            else
            {
                unshuffled[i] = j;
            }
            j = j + 1;
            
        }
        uint idx;
        for (i=0; i < totalSupply; i++) {
            idx = uint256(keccak256(abi.encode(baseSeed, increment))) % (totalSupply - i);
            increment++;
            order[i] = unshuffled[idx];
            unshuffled[idx] = unshuffled[totalSupply - i - 1];
        }
    }

    function getOrder() external onlyOwner view returns (uint256[] memory){
        uint256[] memory result = new uint256[](totalSupply);
        uint256 i;
        for(i=0; i < totalSupply; i++)
        {
            result[i] = order[i];
        }
        return result;
    }


    /////////////////////////////////Random number//////////////////////////////


    event Mint(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
    event ListAnItem(address indexed owner, uint256 indexed tokenId, uint256 price, uint256 timestamp);
    event CancelAnListedItem(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
    event PurchaseAnItem(address indexed buyer, uint256 indexed tokenId, address indexed seller, uint256 price, uint256 timestamp);
    /////////////////////////////////////////////Token Contract///////////////////////////////////////////////////

    uint256 private nextId = 10;
    
    string prefix = "https://ruifenghua-aia-beta.s3.amazonaws.com/metadata/";
    string sub = ".json";

    function getTotalnumMint() public view returns (uint256){
        return nextId;
    }

    function mint() external payable {
        require(msg.value >= 0.01 ether, "Not enough ETH sent; check price!");
        _safeMint(msg.sender, nextId);
        _setTokenURI(nextId,  string(abi.encodePacked(prefix, uintToString(order[nextId]), sub)));
        emit Mint(msg.sender, nextId, block.timestamp);
        nextId++;
    }

    function owner_mint() external payable onlyOwner {
        _safeMint(msg.sender, 0);
        _setTokenURI(0,  string(abi.encodePacked(prefix, uintToString(15), sub)));
        _safeMint(msg.sender, 1);
        _setTokenURI(1,  string(abi.encodePacked(prefix, uintToString(185), sub)));
        _safeMint(msg.sender, 2);
        _setTokenURI(2,  string(abi.encodePacked(prefix, uintToString(165), sub)));
        _safeMint(msg.sender, 3);
        _setTokenURI(3,  string(abi.encodePacked(prefix, uintToString(127), sub)));
        _safeMint(msg.sender, 4);
        _setTokenURI(4,  string(abi.encodePacked(prefix, uintToString(37), sub)));
        _safeMint(msg.sender, 5);
        _setTokenURI(5,  string(abi.encodePacked(prefix, uintToString(133), sub)));
        _safeMint(msg.sender, 6);
        _setTokenURI(6,  string(abi.encodePacked(prefix, uintToString(25), sub)));
        _safeMint(msg.sender, 7);
        _setTokenURI(7,  string(abi.encodePacked(prefix, uintToString(109), sub)));
        _safeMint(msg.sender, 8);
        _setTokenURI(8,  string(abi.encodePacked(prefix, uintToString(48), sub)));
        _safeMint(msg.sender, 9);
        _setTokenURI(9,  string(abi.encodePacked(prefix, uintToString(57), sub)));

    }


    function getBalance() public view onlyOwner returns (uint256){
        return address(this).balance;
    }

    function withdrawBalance() external payable onlyOwner {
        require(msg.sender == owner(), "");
        (bool sent, bytes memory data) = payable(address(owner())).call{value:address(this).balance}("");

    }

    function getAllTokensForUser(address user) public view returns (uint256[] memory){
        uint256 tokenCount = balanceOf(user);
        if(tokenCount ==0){
            return new uint256[](0);
        }
        else{
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalAIAs = nextId;
            uint256 resultIndex = 0;
            uint256 i;
            for(i=0; i < totalAIAs; i++)
            {
                if(ownerOf(i) == user)
                {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            }
            return result;
        }
    }



    /////////////////////////////////////////////Marketplace Contract//////////////////////////////////////////////

    struct Item {
        address payable seller;
        uint256 price;
        uint256 startedAt;
        bool isSelling;
    }

    mapping (address => uint256) userToListedItems;
    mapping (uint256 => Item) tokenIdToItem;

    function getItemDetail(uint256 _tokenId) external view returns (Item memory){
        return tokenIdToItem[_tokenId];
    }

    function sell(uint256 _tokenId, uint256 _price) external nonReentrant {
        require(ownerOf(_tokenId) == msg.sender);
        tokenIdToItem[_tokenId] = Item(
            payable(msg.sender),
            _price,
            block.timestamp,
            true
        );
        safeTransferFrom(msg.sender, address(this), _tokenId);
        userToListedItems[msg.sender] ++;
        emit ListAnItem(msg.sender, _tokenId, _price, block.timestamp);
    }

    function cancelSell(uint256 _tokenId) external nonReentrant {
        Item storage item = tokenIdToItem[_tokenId];
        require(item.startedAt > 0);
        require(item.isSelling);
        require(msg.sender == item.seller);
        userToListedItems[msg.sender] --;
        item.isSelling = false;
        this.safeTransferFrom(address(this), item.seller, _tokenId);
        delete tokenIdToItem[_tokenId];
        emit CancelAnListedItem(msg.sender, _tokenId, block.timestamp);
    }

    function purchaseItem(uint256 _tokenId) external payable nonReentrant {
        // Get a reference to the auction struct
        Item storage item = tokenIdToItem[_tokenId];
        address payable seller = item.seller;
        require(item.startedAt > 0);
        require(item.isSelling);
        require(item.price / 5 + item.price == msg.value);
        uint256 price = item.price;
        delete tokenIdToItem[_tokenId];
        // Transfer proceeds to seller (if there are any!)
        if (price > 0) {
            (bool sent, bytes memory data) = payable(seller).call{value:price}("");
        }
        this.safeTransferFrom(address(this), msg.sender, _tokenId);
        userToListedItems[seller]--;
        emit PurchaseAnItem(msg.sender, _tokenId, seller, price, block.timestamp);
    }

    function getListedItemsForUser(address user) public view returns (uint256[] memory){
        if(userToListedItems[user] ==0){
            return new uint256[](0);
        }
        else{
            uint256[] memory result = new uint256[](userToListedItems[user]);
            uint256 totalAIAs = nextId;
            uint256 resultIndex = 0;
            uint256 i;
            for(i=0; i < totalAIAs; i++)
            {
                Item memory item = tokenIdToItem[i];
                if(item.seller == user)
                {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            }
            return result;
        }
    }


    /////////////////////////////////////////////Helper Functions///////////////////////////////////////////////////
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function uintToString(uint v) public pure returns (string memory) {
        if (v == 0){
            string memory zero = "0";
            return zero;
        }
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i); // i + 1 is inefficient
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1]; // to avoid the off-by-one error
        }
        string memory str = string(s);  // memory isn't implicitly convertible to storage
        return str;
    }
}