import { ethers } from "ethers";
import dotenv from "dotenv";
import { formatEther } from "ethers/lib/utils";
import { erc20Abi } from "viem";
import Moralis from "moralis";

dotenv.config();

// network provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://arb1.arbitrum.io/rpc	"
);

const privateKey: any = process.env.PRIVATE_KEY;

// signer
const signer = new ethers.Wallet(privateKey, provider);

// uniswapv2 contact address
const uniswapRouter = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";

// swap parameters
const amountIn = ethers.utils.parseUnits("1", 18);
const WETHAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDCAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

// Initialize moralis
async function InitializeMoralis() {
  await Moralis.start({
    apiKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjcyYmUwY2ZhLWIzNTgtNDRkMS04MDU3LTAwYWUxMzRiMmE5OCIsIm9yZ0lkIjoiMTQ2NDciLCJ1c2VySWQiOiIxMDk1MyIsInR5cGVJZCI6ImQ5YmJmMjg1LTM0MGUtNGYzYy04ZTUwLWU1NGRmZWY2MTc5NCIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzE4Mjg1MDQwLCJleHAiOjQ4NzQwNDUwNDB9.LiBt5qdtrChVjaNVLbkwxwrsFZ6ceJLm5QV1IrTeoDU",
  });
}

async function main() {}

// check token allowance
async function checkAllowance(token: string) {
  const tokenContract = new ethers.Contract(token, erc20Abi, signer);

  const allowance = await tokenContract.allowance(
    signer.address,
    uniswapRouter
  );

  return allowance;
}

// approve token to spent
async function approveToken(token: string, amount: string) {
  const tokenContract = new ethers.Contract(token, erc20Abi, signer);
  try {
    await tokenContract.approve(uniswapRouter, amount, { gasLimit: 21632 });
  } catch (err) {
    console.log("Approve Error", err);
  }
}

main();
