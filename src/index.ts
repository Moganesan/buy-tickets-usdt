import { Signer, ethers } from "ethers";
import dotenv from "dotenv";
import { formatEther } from "ethers/lib/utils";
import { erc20Abi } from "viem";
import Moralis from "moralis";
import uniswapAbi from "./uniswapAbi.json";

dotenv.config();

// network provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://arb1.arbitrum.io/rpc"
);

const WETHAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDCAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

const database = {
  platformAddress: "0x17206eE0F5F452cc9EA68374e2fe7BC62400c3A1",
  tokenPairs: [
    {
      name: "Wrapped ETH/USDC",
      address: WETHAddress,
    },
  ],
};
const privateKey: any = process.env.PRIVATE_KEY;

// signer
const signer = new ethers.Wallet(privateKey, provider);

// uniswapv2 contact address
const uniswapRouter = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";

const routerContract = new ethers.Contract(uniswapRouter, uniswapAbi, signer);

// Initialize moralis
async function InitializeMoralis() {
  await Moralis.start({
    apiKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjcyYmUwY2ZhLWIzNTgtNDRkMS04MDU3LTAwYWUxMzRiMmE5OCIsIm9yZ0lkIjoiMTQ2NDciLCJ1c2VySWQiOiIxMDk1MyIsInR5cGVJZCI6ImQ5YmJmMjg1LTM0MGUtNGYzYy04ZTUwLWU1NGRmZWY2MTc5NCIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzE4Mjg1MDQwLCJleHAiOjQ4NzQwNDUwNDB9.LiBt5qdtrChVjaNVLbkwxwrsFZ6ceJLm5QV1IrTeoDU",
  });
}

async function main() {
  await InitializeMoralis();
  const amountInUSDC = 1000;
  await convertERC20ToUSDCTAndTransferToPlatformAddress(amountInUSDC);
}

async function convertERC20ToUSDCTAndTransferToPlatformAddress(
  amountInUSDC: number
) {
  const tokenContract = new ethers.Contract(
    database.tokenPairs[0].address,
    erc20Abi,
    signer
  );

  const amountInWrappedEth = await USDTToERC20(
    database.tokenPairs[0].address,
    amountInUSDC
  );

  const CheckAllowance = await checkAllowance(database.tokenPairs[0].address);

  if (
    Number(CheckAllowance) <
    Number(ethers.utils.formatUnits(amountInWrappedEth, 18))
  ) {
    try {
      await tokenContract.approve(
        uniswapRouter,
        ethers.utils.parseUnits(amountInWrappedEth.toString(), 18)
      );
      console.log(
        "Now Allowance",
        await tokenContract.allowance(signer.address, uniswapRouter)
      );
    } catch (err) {
      console.log("Approve Failed", err);
    }
  }

  try {
    const path = [database.tokenPairs[0].address, USDCAddress];
    const amountOut = await getAmountsOutMin(amountInWrappedEth.toString());
    const slippageTolerance = 1; // 1%
    const slippage = 1 - slippageTolerance / 100;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    // calculating slippage
    const amountOutMin = ethers.utils.parseUnits(
      (
        Number(ethers.utils.formatUnits(amountOut[1].toString(), 6)) * slippage
      ).toString()
    );

    const res = await routerContract.swapExactTokensForTokens(
      ethers.utils.parseUnits(amountInWrappedEth.toString(), 18),
      amountOutMin,
      path,
      database.platformAddress,
      deadline,
      {
        gasLimit: 1000000,
      }
    );

    const receipt = await res.wait();
    console.log(receipt);
  } catch (err) {
    console.log("Swap Error", err);
  }
}

// deposit tokens to script
async function depositToken(signer: Signer, token: string, amount: number) {
  const tokenContract = new ethers.Contract(token, erc20Abi, signer);
  const decimals = await tokenContract.decimals();
  await tokenContract.transfer(database.platformAddress, Number(decimals));
}

// get swap token out min
async function getAmountsOutMin(amountIn: string) {
  const path = [database.tokenPairs[0].address, USDCAddress];
  return routerContract.getAmountsOut(
    ethers.utils.parseUnits(amountIn, 18),
    path
  );
}

async function USDTToERC20(token: string, amountInUSDC: number) {
  const tokenPrice = await Moralis.EvmApi.token
    .getTokenPrice({
      chain: "0x38",
      include: "percent_change",
      address: token,
    })
    .then((res) => res.raw);

  const tokenToUsdtAmount = amountInUSDC / tokenPrice.usdPrice;
  return tokenToUsdtAmount;
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
