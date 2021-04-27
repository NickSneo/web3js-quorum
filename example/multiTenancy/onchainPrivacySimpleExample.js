const Web3 = require("web3");
const Web3Quorum = require("../../src");

const { orion, network } = require("../keys.js");
const { logMatchingGroup, createHttpProvider } = require("../helpers.js");

const node1 = new Web3Quorum(
  new Web3(createHttpProvider(orion.node1.jwt, network.node1.url))
);
const node2 = new Web3Quorum(
  new Web3(createHttpProvider(orion.node2.jwt, network.node2.url))
);

module.exports = async () => {
  const onChainPrivacyGroupCreationResult = await node1.privx.createPrivacyGroup(
    {
      participants: [orion.node1.publicKey, orion.node2.publicKey],
      enclaveKey: orion.node1.publicKey,
      privateFrom: orion.node1.publicKey,
      privateKey: network.node1.privateKey,
    }
  );
  console.log("Creation result");
  console.log(onChainPrivacyGroupCreationResult);

  await node1.priv.getTransactionReceipt(
    onChainPrivacyGroupCreationResult.commitmentHash,
    orion.node1.publicKey
  );

  const findResult1 = await node1.eth.flexiblePrivacyGroup.findOnChainPrivacyGroup(
    [orion.node1.publicKey, orion.node2.publicKey]
  );
  console.log("finding groups on node1");
  logMatchingGroup(
    findResult1,
    onChainPrivacyGroupCreationResult.privacyGroupId
  );

  const findResult2 = await node2.eth.flexiblePrivacyGroup.findOnChainPrivacyGroup(
    [orion.node1.publicKey, orion.node2.publicKey]
  );
  console.log("finding groups on node2");
  logMatchingGroup(
    findResult2,
    onChainPrivacyGroupCreationResult.privacyGroupId
  );
};

if (require.main === module) {
  module.exports().catch((error) => {
    console.log(error);
    console.log(
      "\nThis example requires ONCHAIN privacy (and JWT Auth) to be ENABLED. \nCheck Besu config."
    );
  });
}
