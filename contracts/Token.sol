pragma solidity 0.8.13;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC721, Ownable, IERC721Receiver{


    struct AIA {
        uint256 attribute1; 
        uint256 attribute2;
        uint256 attribute3;
        uint256 attribute4;
    }
    struct Auction {
        // Current owner of NFT
        address seller;
        // Price (in wei) at beginning of auction
        uint128 price;
        // Duration
        uint64 duration;
        // Time when auction started
        uint64 startedAt;
    }



    ERC721 public nonFungibleContract = ERC721(address(this));
    uint256 nextId = 0;
    // Map from token ID to their corresponding auction.
    mapping (address => uint256) userToNumonAuction;
    mapping (uint256 => Auction) tokenIdToAuction;
    mapping ( uint256 => AIA) private _tokenDetails;



    constructor (string memory name, string memory symbol) ERC721(name, symbol)
    {

    }



   function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function createAuction(
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _duration
    )
        external
    {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_duration == uint256(uint64(_duration)));

        require(ownerOf(_tokenId) == msg.sender);
        safeTransferFrom(msg.sender, address(this), _tokenId);
        Auction memory auction = Auction(
            msg.sender,
            uint128(_startingPrice),

            uint64(_duration),
            uint64(block.timestamp)
        );
        _addAuction(_tokenId, auction);
        userToNumonAuction[msg.sender] ++;
    }


    function _addAuction(uint256 _tokenId, Auction memory _auction) internal {
        // Require that all auctions have a duration of
        // at least one minute. (Keeps our math from getting hairy!)
        require(_auction.duration >= 1 minutes);

        tokenIdToAuction[_tokenId] = _auction;
    }



    function bid(uint256 _tokenId)
        external
        payable
    {
        // _bid will throw if the bid or funds transfer fails
        _bid(_tokenId, msg.value);
        this.safeTransferFrom(address(this), msg.sender, _tokenId);
    }

    function _bid(uint256 _tokenId, uint256 paidAmout)
        internal

    {
        // Get a reference to the auction struct
        Auction storage auction = tokenIdToAuction[_tokenId];

        // Check that price is equal
        require(auction.price / 5 + auction.price == paidAmout);

        // Grab a reference to the seller before the auction struct
        // gets deleted.
        address payable seller = payable(auction.seller);


        // Transfer proceeds to seller (if there are any!)
        if (auction.price > 0) {
            // Calculate the auctioneer's cut.
            // (NOTE: _computeCut() is guaranteed to return a
            // value <= price, so this subtraction can't go negative.)

            // NOTE: Doing a transfer() in the middle of a complex
            // method like this is generally discouraged because of
            // reentrancy attacks and DoS attacks if the seller is
            // a contract with an invalid fallback function. We explicitly
            // guard against reentrancy attacks by removing the auction
            // before calling transfer(), and the only thing the seller
            // can DoS is the sale of their own asset! (And if it's an
            // accident, they can call cancelAuction(). )
            (bool sent, bytes memory data) = payable(seller).call{value:auction.price}("");
        }
    }



    function getBalance() public view returns (uint256){
        return address(this).balance;
    }

    function withdrawBalance() external payable{
        require(msg.sender == owner(), "");
        (bool sent, bytes memory data) = payable(address(owner())).call{value:address(this).balance}("");

    }

    function getTokenDetails (uint256 tokenId) public view returns (AIA memory){
        return _tokenDetails[tokenId];
    }

    function mint(uint256 attribute1, uint256 attribute2, uint256 attribute3, uint256 attribute4) external payable {
        require(msg.value >= 1 ether, "Not enough ETH sent; check price!");
        _tokenDetails[nextId] = AIA(attribute1, attribute2, attribute3, attribute4);
        _safeMint(msg.sender, nextId);
        nextId++;
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

        function getTokensonAuctionForUser(address user) public view returns (uint256[] memory){
        if(userToNumonAuction[user] ==0){
            return new uint256[](0);
        }
        else{
            uint256[] memory result = new uint256[](userToNumonAuction[user]);
            uint256 totalAIAs = nextId;
            uint256 resultIndex = 0;
            uint256 i;
            for(i=0; i < totalAIAs; i++)
            {
                Auction memory auction = tokenIdToAuction[i];
                if(auction.seller == user)
                {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            }
            return result;
        }
    }
}