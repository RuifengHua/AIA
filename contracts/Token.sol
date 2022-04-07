pragma solidity 0.8.13;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Token is ERC721, Ownable, IERC721Receiver, ReentrancyGuard{


    event Mint(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
    event ListAnItem(address indexed owner, uint256 indexed tokenId, uint256 price, uint256 duration, uint256 timestamp);
    event CancelAnListedItem(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
    event PurchaseAnItem(address indexed buyer, uint256 indexed tokenId, address indexed seller, uint256 price, uint256 timestamp);
    /////////////////////////////////////////////Token Contract///////////////////////////////////////////////////

    struct AIA {
        uint256 attribute1; 
        uint256 attribute2;
        uint256 attribute3;
        uint256 attribute4;
    }

    uint256 private nextId = 0;
    
    mapping (uint256 => AIA) private _tokenDetails;

    constructor (string memory name, string memory symbol) ERC721(name, symbol){

    }

    function mint(uint256 attribute1, uint256 attribute2, uint256 attribute3, uint256 attribute4) external payable {
        require(msg.value >= 0.01 ether, "Not enough ETH sent; check price!");
        _tokenDetails[nextId] = AIA(attribute1, attribute2, attribute3, attribute4);
        _safeMint(msg.sender, nextId);
        emit Mint(msg.sender, nextId, block.timestamp);
        nextId++;
    }

    function getTokenDetails (uint256 tokenId) public view returns (AIA memory){
        return _tokenDetails[tokenId];
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
        uint256 duration;
        uint256 startedAt;
        bool isSelling;
    }

    mapping (address => uint256) userToListedItems;
    mapping (uint256 => Item) tokenIdToItem;

    function sell(uint256 _tokenId, uint256 _price, uint256 _duration) external nonReentrant {
        require(ownerOf(_tokenId) == msg.sender);
        require(_duration >= 1 minutes);
        tokenIdToItem[_tokenId] = Item(
            payable(msg.sender),
            _price,
            _duration,
            block.timestamp,
            true
        );
        safeTransferFrom(msg.sender, address(this), _tokenId);
        userToListedItems[msg.sender] ++;
        emit ListAnItem(msg.sender, _tokenId, _price, _duration, block.timestamp);
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
}