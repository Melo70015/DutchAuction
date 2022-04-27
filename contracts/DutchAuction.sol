// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract DutchAuction {
    address ownerAddress;
    uint256 reservePrice;
    address judgeAddress;
    uint256 numBlocksActionOpen;
    uint256 offerPriceDecrement;
    uint startBlockNumber;
    address winnerAddress;
    uint winningBid;
    bool endAuction;
    bool finalized;
    bool judgeCallTime;
    bool winnerCallTime;
    bool judgeExistence;

    constructor(uint256 _reservePrice, address _judgeAddress, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement){
        reservePrice = _reservePrice;
        judgeAddress = _judgeAddress;
        numBlocksActionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        ownerAddress = msg.sender;
        startBlockNumber = block.number;
    }

    function bid() public payable {
        require(!endAuction);
        require(block.number < (startBlockNumber + numBlocksActionOpen));
        require(msg.value >= (reservePrice + (offerPriceDecrement * (startBlockNumber + numBlocksActionOpen - block.number))));

        endAuction = true;

        if(judgeAddress == 0x0000000000000000000000000000000000000000){
            payable(ownerAddress).transfer(msg.value);

        }else{
            winnerAddress = msg.sender;
            winningBid = msg.value;
            judgeExistence = true;
        }
    }

    function finalize() public {
        require(endAuction && !finalized && judgeExistence);
        require(!judgeCallTime && !winnerCallTime);
        require(msg.sender == judgeAddress || msg.sender == winnerAddress);
        if(msg.sender==judgeAddress)
            judgeCallTime = true;
        if(msg.sender==winnerAddress)
            winnerCallTime = true;
        finalized = true;
        payable(ownerAddress).transfer(winningBid);
    }

    function refund(uint256 refundAmount) public {
        require(endAuction && !finalized && !judgeCallTime);
        require(msg.sender == judgeAddress);
        judgeCallTime = true;
        finalized = true;
        payable(winnerAddress).transfer(refundAmount);
    }

	function getBasicInfo() public view returns(bool,uint256, uint256,address,address,bool){
        uint256 initialPrice= reservePrice + numBlocksActionOpen*offerPriceDecrement;

        uint initialBlockNum = startBlockNumber;

		uint256 currentPrice = initialPrice - offerPriceDecrement*(block.number-initialBlockNum);

		bool auctionAvailable = false;

		if(finalized){

			auctionAvailable = true;

		}
	return(auctionAvailable,currentPrice, reservePrice,judgeAddress,ownerAddress,finalized);

}

    //for testing framework
    function nop() public pure returns(bool) {
        return true;
    }
}
