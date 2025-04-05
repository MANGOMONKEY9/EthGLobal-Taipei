const hre = require("hardhat");

async function main() {
  // Deploy SimpleTokenSwap
  const SimpleTokenSwap = await hre.ethers.getContractFactory("SimpleTokenSwap");
  const simpleTokenSwap = await SimpleTokenSwap.deploy();
  await simpleTokenSwap.waitForDeployment();

  console.log("SimpleTokenSwap deployed to:", await simpleTokenSwap.getAddress());

  // Deploy SelfCustodyWorkshop
  const SelfCustodyWorkshop = await hre.ethers.getContractFactory("SelfCustodyWorkshop");
  const selfCustodyWorkshop = await SelfCustodyWorkshop.deploy();
  await selfCustodyWorkshop.waitForDeployment();

  console.log("SelfCustodyWorkshop deployed to:", await selfCustodyWorkshop.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 