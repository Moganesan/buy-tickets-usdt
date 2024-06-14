import { app } from "./firebase";
import {
  getDatabase,
  ref,
  onValue,
  get,
  child,
  update,
} from "firebase/database";
import { ethers } from "ethers";
import InputDataDecoder from "ethereum-input-data-decoder";
import uniswapAbi from "./uniswapAbi.json";

const decoder = new InputDataDecoder(uniswapAbi);

// network provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://arb1.arbitrum.io/rpc"
);

const db = getDatabase(app);
const starCountRef = ref(db, "transactions/");
onValue(starCountRef, async (snapshot) => {
  const data = snapshot.val();
  const platformAddress = get(child(ref(db), "platformAddress")).then(
    (snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      }
    }
  );

  try {
    const txDetails = await provider.getTransaction(data.hash);

    if (!txDetails) {
      console.log("Transaction not found");
    }
    const decodeTx = decoder.decodeData(txDetails.data);
    const { inputs } = decodeTx;
    if (
      inputs[0] == ethers.utils.formatUnits(data.amount) &&
      inputs[3] == platformAddress
    ) {
      update(ref(db), ["/transactions/" + data.hash, { txVerified: true }]);
      return;
    }
  } catch (err) {}
});
