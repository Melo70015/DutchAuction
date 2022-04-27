import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import { utils } from 'ethers/lib/';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import DutchAuctionArtifact from '../artifacts/contracts/DutchAuction.sol/DutchAuction.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';

const StyledDutchAuctionDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledDeployContractButton = styled.button`
  appearance: button;
  background-color: #3cb5a4;
  border: solid transparent;
  border-radius: 16px;
  border-width: 0 0 4px;
  box-sizing: border-box;
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: din-round, sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.8px;
  line-height: 20px;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 13px 16px;
  text-align: center;
  text-transform: uppercase;
  touch-action: manipulation;
  transform: translateZ(0);
  transition: filter 0.2s;
  user-select: none;
  -webkit-user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  width: 100%;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

const StyledButton2 = styled.button`
  appearance: button;
  background-color: #3cb5a4;
  border: solid transparent;
  border-width: 0 0 4px;
  box-sizing: border-box;
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: din-round, sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.8px;
  line-height: 5px;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 13px 16px;
  text-align: center;
  text-transform: uppercase;
  touch-action: manipulation;
  transform: translateZ(0);
  transition: filter 0.2s;
  user-select: none;
  -webkit-user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  width: 150px;
  height: 2rem;
  border-color: green;
  height: 2rem;
  border-radius: 1rem;
  border-color: black;
`;

const StyledDutchAuctionCntDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 10px;
`;

export function DutchAuction(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [dutchAuctionContract, setDutchAuctionContract] = useState<Contract>();
  const [dutchAuctionContractAddr, setDutchAuctionContractAddr] =
    useState<string>('');
  const [dutchAuctionReservePrice, setDutchAuctionReservePrice] =
    useState<string>('');
  const [dutchAuctionJudgeAddress, setDutchAuctionJudgeAddress] =
    useState<string>('');
  const [
    dutchAuctionNumBlocksAuctionOpen,
    setDutchAuctionNumBlocksAuctionOpen
  ] = useState<string>('');
  const [dutchAuctionOfferPriceDecrement, setDutchAuctionOfferPriceDecrement] =
    useState<string>('');
  const [bidValueInput, setBidValueInput] = useState<string>('');

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (dutchAuctionContract || !signer) {
      return;
    }

    async function deployDutchAuctionContract(signer: Signer): Promise<void> {
      const DutchAuction = new ethers.ContractFactory(
        DutchAuctionArtifact.abi,
        DutchAuctionArtifact.bytecode,
        signer
      );

      try {
        var ReservePrice = dutchAuctionReservePrice;
        var offerPriceDecrement = dutchAuctionOfferPriceDecrement;
        var nReservePrice = utils.parseEther(ReservePrice);
        var nofferPriceDecrement = utils.parseEther(offerPriceDecrement);
        var judgeAddress = dutchAuctionJudgeAddress;
        var numBlocksAuctionOpen = dutchAuctionNumBlocksAuctionOpen;
        const dutchAuctionContract = await DutchAuction.deploy(
          nReservePrice,
          judgeAddress,
          numBlocksAuctionOpen,
          nofferPriceDecrement
        );
        await dutchAuctionContract.deployed();

        setDutchAuctionContract(dutchAuctionContract);

        window.alert(
          `DutchAuction deployed to: ${dutchAuctionContract.address}`
        );

        setDutchAuctionContractAddr(dutchAuctionContract.address);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployDutchAuctionContract(signer);
  }

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!dutchAuctionContract) {
      return;
    }
  }, [dutchAuctionContract]);

  function handleDutchAuctionBid(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!dutchAuctionContract) {
      window.alert('Undefined dutchAuctionContract');
      return;
    }

    if (!bidValueInput) {
      window.alert('bidValueInput cannot be empty');
      return;
    }

    async function Bid(dutchAuctionContract: Contract): Promise<void> {
      try {
        let overrides = {
          // The amount to send with the transaction (i.e. msg.value)
          value: utils.parseEther(bidValueInput)
        };
        const setBidTxn = await dutchAuctionContract.bid(overrides);

        await setBidTxn.wait();
        window.alert(`Congratulation, Bid success!`);
      } catch (error: any) {
        window.alert(
          'Error bidvalue or bid is finished!' +
            (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    Bid(dutchAuctionContract);
  }

  function handleDutchAuctionFinalize(
    event: MouseEvent<HTMLButtonElement>
  ): void {
    event.preventDefault();

    if (!dutchAuctionContract) {
      window.alert('Undefined dutchAuctionContract');
      return;
    }

    async function Finaliz(dutchAuctionContract: Contract): Promise<void> {
      try {
        const setBidTxn = await dutchAuctionContract.finalize();

        await setBidTxn.wait();
        window.alert(`Congratulation, Finalize success!`);
      } catch (error: any) {
        window.alert(
          'Error or bid is not finish!' +
            (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    Finaliz(dutchAuctionContract);
  }

  function handleDutchAuctionRefund(
    event: MouseEvent<HTMLButtonElement>
  ): void {
    event.preventDefault();

    if (!dutchAuctionContract) {
      window.alert('Undefined dutchAuctionContract');
      return;
    }

    async function Refund(dutchAuctionContract: Contract): Promise<void> {
      try {
        let refundValue = {
          // The amount to send with the transaction (i.e. msg.value)
          value: utils.parseEther(bidValueInput)
        };
        const setRfTxn = await dutchAuctionContract.refund(refundValue);

        await setRfTxn.wait();
        window.alert(`Congratulation, Refund success!`);
      } catch (error: any) {
        window.alert(
          'Refund fail' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    Refund(dutchAuctionContract);
  }

  function handleOfferPriceDecrementChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    setDutchAuctionOfferPriceDecrement(event.target.value);
  }

  function handleJudgeAddressChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    setDutchAuctionJudgeAddress(event.target.value);
  }

  function handleNumBlocksAuctionOpenChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    setDutchAuctionNumBlocksAuctionOpen(event.target.value);
  }

  function handleBidValueInputChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    setBidValueInput(event.target.value);
  }

  function handleReservePriceChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    setDutchAuctionReservePrice(event.target.value);
  }

  return (
    <>
      <StyledLabel htmlFor="reservePrice">Reserve Price</StyledLabel>
      <StyledInput
        id="reservePrice"
        type="text"
        onChange={handleReservePriceChange}
        style={{ fontStyle: 'normal' }}
      />

      <StyledLabel htmlFor="judgeAddress">Judge Address</StyledLabel>
      <StyledInput
        id="judgeAddress"
        type="text"
        onChange={handleJudgeAddressChange}
        style={{ fontStyle: 'normal' }}
      />

      <StyledLabel htmlFor="numBlocksAuctionOpen">
        Num Blocks AuctionOpen
      </StyledLabel>
      <StyledInput
        id="numBlocksAuctionOpen"
        type="text"
        onChange={handleNumBlocksAuctionOpenChange}
        style={{ fontStyle: 'normal' }}
      />

      <StyledLabel htmlFor="offerPriceDecrement">
        Offer Price Decrement
      </StyledLabel>
      <StyledInput
        id="offerPriceDecrement"
        type="text"
        onChange={handleOfferPriceDecrementChange}
        style={{ fontStyle: 'normal' }}
      />

      <StyledDeployContractButton
        disabled={!active || dutchAuctionContract ? true : false}
        style={{
          cursor: !active || dutchAuctionContract ? 'not-allowed' : 'pointer',
          borderColor: !active || dutchAuctionContract ? 'unset' : '≈',
          width: '50%',
          transform: 'translateX(50%)'
        }}
        onClick={handleDeployContract}
      >
        Deploy DutchAuction
      </StyledDeployContractButton>

      <SectionDivider />

      <StyledDutchAuctionDiv>
        <div style={{ marginLeft: '80px' }}>
          <StyledLabel>Contract addr </StyledLabel>
          {dutchAuctionContractAddr ? (
            dutchAuctionContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>

        <div style={{ marginLeft: '80px' }}>
          <StyledLabel htmlFor="bidValueInput">Input Bidvalue </StyledLabel>
          <StyledInput
            id="bidValueInput"
            type="text"
            onChange={handleBidValueInputChange}
            style={{ fontStyle: 'normal' }}
          />
        </div>

        <StyledDutchAuctionCntDiv>
          <StyledButton2
            disabled={!active || !dutchAuctionContract ? true : false}
            style={{
              cursor:
                !active || !dutchAuctionContract ? 'not-allowed' : 'pointer',
              borderColor: !active || !dutchAuctionContract ? 'unset' : 'blue'
            }}
            onClick={handleDutchAuctionBid}
          >
            Bid
          </StyledButton2>

          <StyledButton2
            disabled={!active || !dutchAuctionContract ? true : false}
            style={{
              cursor:
                !active || !dutchAuctionContract ? 'not-allowed' : 'pointer',
              borderColor: !active || !dutchAuctionContract ? 'unset' : 'blue'
            }}
            onClick={handleDutchAuctionFinalize}
          >
            Finalize
          </StyledButton2>

          <StyledButton2
            disabled={!active || !dutchAuctionContract ? true : false}
            style={{
              cursor:
                !active || !dutchAuctionContract ? 'not-allowed' : 'pointer',
              borderColor: !active || !dutchAuctionContract ? 'unset' : 'blue'
            }}
            onClick={handleDutchAuctionRefund}
          >
            Refund
          </StyledButton2>
        </StyledDutchAuctionCntDiv>
      </StyledDutchAuctionDiv>
    </>
  );
}
