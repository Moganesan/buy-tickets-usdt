AvaialbleTokenPairs:
{
"pepe/usdt": "0xabxc"
}

https://bscscan.com/address/0x55d398326f99059ff775485246999027b3197955

how much pepe is 120 USDT = 1000 pepe = 120 USDT
swap and send to paltform wallet as usdt

- Store token addresses or pair addresses of token/USDT on BSC
- Store a "platform address"

- User selects to deposit 25 USDT to platform address
- - Logic to verify tx from user was sent to platform address and the correct amount
- - Return response

- User selects to deposit some other token (from token addresses storage).
- - Calculate the exact output price for example 25USDT
- - Swap and send that 25USDT to platform address (have minimal slippage)
- - Logic to verify tx from user was sent to platform address and the correct amount
- - Return response
