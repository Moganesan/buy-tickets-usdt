import { ethers } from "ethers";
import dotenv from "dotenv";
import { erc20Abi } from "viem";
import uniswapAbi from "./uniswapAbi.json";

dotenv.config();

// network provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://arb1.arbitrum.io/rpc"
);

const WETHAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDCAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

const privateKey: any = process.env.PRIVATE_KEY;

// signer
const signer = new ethers.Wallet(privateKey, provider);

// uniswapv2 contact address
const uniswapRouter = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";

// swap receiver address
const swapReceiverAddress = "0xCa1ffdC8d04F7B2f04AC1efCD0D5f3c35676Be1A";

const routerContract = new ethers.Contract(uniswapRouter, uniswapAbi, signer);

async function main() {
  const amountIn = 0.4;

  const CheckAllowance = await checkAllowance(WETHAddress);

  const tokenContract = new ethers.Contract(WETHAddress, erc20Abi, signer);

  if (Number(CheckAllowance) < Number(ethers.utils.formatUnits(amountIn, 18))) {
    try {
      await tokenContract.approve(
        uniswapRouter,
        ethers.utils.parseUnits(amountIn.toString(), 18)
      );
      console.log(
        "Now Allowance",
        await tokenContract.allowance(signer.address, uniswapRouter)
      );
    } catch (err) {
      console.log("Approve Failed", err);
    }
  }

  const path = [WETHAddress, USDCAddress];
  const amountOut = await getAmountsOutMin(amountIn.toString());
  const slippageTolerance = 1; // 1%
  const slippage = 1 - slippageTolerance / 100;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

  // calculating slippage
  const amountOutMin = ethers.utils.parseUnits(
    (
      Number(ethers.utils.formatUnits(amountOut[1].toString(), 6)) * slippage
    ).toString()
  );

  const receipt = await routerContract.swapExactTokensForTokens(
    ethers.utils.parseUnits(amountIn.toString(), 18),
    amountOutMin,
    path,
    swapReceiverAddress,
    deadline,
    {
      gasLimit: 1000000,
    }
  );

  console.log(receipt);
}

// get swap token out min
async function getAmountsOutMin(amountIn: string) {
  const path = [WETHAddress, USDCAddress];
  return routerContract.getAmountsOut(
    ethers.utils.parseUnits(amountIn, 18),
    path
  );
}

// check token allowance
async function checkAllowance(token: string) {
  const tokenContract = new ethers.Contract(token, erc20Abi, signer);

  const allowance = await tokenContract.allowance(
    signer.address,
    uniswapRouter
  );

  return allowance;
}

main();
