// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract nftsStore {

    address payable contractOwner=payable(0xC2Aa1cEa55983c551609445b1221CAa56FDa2503);
    uint256 public listingPrice=0.025 ether;

    struct NFTS {
        string title;
        string description;
        string email;
        string category;
        uint  fundraised;
        address creator;
        string image;
        uint256 timestamp;
        uint256 id;
    }

    mapping (uint => NFTS)public mapNFTs;
    uint256 public imagesCount=0;

function uploadIPFS(address _creator , string memory _image , string memory _title , string memory _description , string memory _email , string memory _category) public payable returns(
    string memory,
    string memory,
    string memory,
    address,
    string memory
    ){
        imagesCount++;
        NFTS storage nft = mapNFTs[imagesCount];

        nft.title=_title;
        nft.creator=_creator;
        nft.description=_description;
        nft.email=_email;
        nft.category=_category;
        nft.image=_image;
        nft.timestamp=block.timestamp;
        nft.id=imagesCount;

        return(
            _title,
            _description,
            _category,
            _creator,
            _image
        );
    }

function getAllNFTS() public view returns(NFTS[] memory) {

   uint256 itemCount=imagesCount;
   uint256 currentIndex=0;

    NFTS[] memory items=new NFTS[](itemCount);

    for(uint256 i=0 ; i < itemCount; i++){
        uint256 currentId=i+1;
        NFTS storage currentItem=mapNFTs[currentId];
        items[currentIndex]=currentItem;
        currentIndex +=1;
    }
    return items;
}

function getNFT(uint256 id) external view returns(
    string memory,
    string memory,
    string memory,
    string memory ,
    uint256 ,
    address,
    string memory ,
    uint256,
    uint256
 ){

  NFTS memory nfts = mapNFTs[id];

  return(
    nfts.title,
    nfts.description,
    nfts.email,
    nfts.category,
    nfts.fundraised,
    nfts.creator,
    nfts.image,
    nfts.timestamp,
    nfts.id
  );

 }

function updateListingPrice(uint256 _listingPrice , address owner) public payable {

    require(contractOwner == owner, "Only contract Onwer can update listing Price");
    listingPrice = _listingPrice;

 }

function donateToNFT(uint256 _id)public payable {

    uint256 amount = msg.value;
    NFTS storage nft = mapNFTs[_id];
    (bool sent,) = payable (nft.creator).call{value:amount}("");

    if(sent){
        nft.fundraised=nft.fundraised + amount;
    }
}

function withdraw(address _owner) external {
    require(_owner==contractOwner, "Only contract Onwer can withdraw ");
    uint256 balance=address (this).balance;
    require(balance>0 , "No funds Available");
    contractOwner.transfer(balance);
 }

}