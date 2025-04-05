const hre = require("hardhat");

async function main() {
  // Deploy SimpleTokenSwap
  const SimpleTokenSwap = await hre.ethers.getContractFactory("SimpleTokenSwap");
  const simpleTokenSwap = await SimpleTokenSwap.deploy();
  await simpleTokenSwap.deployed();

  console.log("SimpleTokenSwap deployed to:", simpleTokenSwap.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 