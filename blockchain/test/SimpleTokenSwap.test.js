const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleTokenSwap", function () {
  let SimpleTokenSwap;
  let simpleTokenSwap;
  let owner;
  let addr1;
  let addr2;
  let MockERC20;
  let usdc;
  let sevenToken;
  let eth;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    
    // Deploy USDC with 6 decimals
    usdc = await MockERC20.deploy("USDC", "USDC", 6);
    await usdc.deployed();

    // Deploy 7ONE with 18 decimals
    sevenToken = await MockERC20.deploy("7ONE", "7ONE", 18);
    await sevenToken.deployed();

    // Deploy ETH with 18 decimals
    eth = await MockERC20.deploy("ETH", "ETH", 18);
    await eth.deployed();

    // Deploy SimpleTokenSwap
    SimpleTokenSwap = await ethers.getContractFactory("SimpleTokenSwap");
    simpleTokenSwap = await SimpleTokenSwap.deploy();
    await simpleTokenSwap.deployed();

    // Mint tokens to owner and addr1
    await usdc.mint(owner.address, ethers.utils.parseUnits("10000", 6));
    await sevenToken.mint(owner.address, ethers.utils.parseEther("10000"));
    await eth.mint(owner.address, ethers.utils.parseEther("10"));

    await usdc.mint(addr1.address, ethers.utils.parseUnits("1000", 6));
    await sevenToken.mint(addr1.address, ethers.utils.parseEther("1000"));
    await eth.mint(addr1.address, ethers.utils.parseEther("1"));

    // Add liquidity to the contract
    await usdc.approve(simpleTokenSwap.address, ethers.utils.parseUnits("5000", 6));
    await sevenToken.approve(simpleTokenSwap.address, ethers.utils.parseEther("5000"));
    await eth.approve(simpleTokenSwap.address, ethers.utils.parseEther("5"));

    await simpleTokenSwap.addLiquidity(usdc.address, ethers.utils.parseUnits("5000", 6));
    await simpleTokenSwap.addLiquidity(sevenToken.address, ethers.utils.parseEther("5000"));
    await simpleTokenSwap.addLiquidity(eth.address, ethers.utils.parseEther("5"));
  });

  describe("Swaps", function () {
    it("Should swap 7ONE for USDC correctly", async function () {
      const amountIn = ethers.utils.parseEther("100"); // 100 7ONE
      const expectedAmountOut = ethers.utils.parseUnits("100", 6); // 100 USDC (1:1 ratio)

      // Approve tokens
      await sevenToken.connect(addr1).approve(simpleTokenSwap.address, amountIn);

      // Get initial balances
      const initialSevenBalance = await sevenToken.balanceOf(addr1.address);
      const initialUsdcBalance = await usdc.balanceOf(addr1.address);

      // Perform swap
      await simpleTokenSwap.connect(addr1).swapTokens(
        sevenToken.address,
        usdc.address,
        amountIn,
        expectedAmountOut
      );

      // Check final balances
      const finalSevenBalance = await sevenToken.balanceOf(addr1.address);
      const finalUsdcBalance = await usdc.balanceOf(addr1.address);

      expect(initialSevenBalance.sub(finalSevenBalance)).to.equal(amountIn);
      expect(finalUsdcBalance.sub(initialUsdcBalance)).to.equal(expectedAmountOut);
    });

    it("Should swap USDC for ETH correctly", async function () {
      const amountIn = ethers.utils.parseUnits("2000", 6); // 2000 USDC
      const expectedAmountOut = ethers.utils.parseEther("1"); // 1 ETH (2000:1 ratio)

      // Approve tokens
      await usdc.connect(addr1).approve(simpleTokenSwap.address, amountIn);

      // Get initial balances
      const initialUsdcBalance = await usdc.balanceOf(addr1.address);
      const initialEthBalance = await eth.balanceOf(addr1.address);

      // Perform swap
      await simpleTokenSwap.connect(addr1).swapTokens(
        usdc.address,
        eth.address,
        amountIn,
        expectedAmountOut
      );

      // Check final balances
      const finalUsdcBalance = await usdc.balanceOf(addr1.address);
      const finalEthBalance = await eth.balanceOf(addr1.address);

      expect(initialUsdcBalance.sub(finalUsdcBalance)).to.equal(amountIn);
      expect(finalEthBalance.sub(initialEthBalance)).to.equal(expectedAmountOut);
    });

    it("Should fail when trying to swap tokens with insufficient balance", async function () {
      const amountIn = ethers.utils.parseEther("2000"); // More than addr1 has

      await sevenToken.connect(addr1).approve(simpleTokenSwap.address, amountIn);

      await expect(
        simpleTokenSwap.connect(addr1).swapTokens(
          sevenToken.address,
          usdc.address,
          amountIn,
          0
        )
      ).to.be.revertedWith("Transfer in failed");
    });
  });

  describe("Liquidity Management", function () {
    it("Should allow owner to add liquidity", async function () {
      const amount = ethers.utils.parseUnits("1000", 6);
      await usdc.approve(simpleTokenSwap.address, amount);
      await simpleTokenSwap.addLiquidity(usdc.address, amount);

      const balance = await simpleTokenSwap.getContractBalance(usdc.address);
      expect(balance).to.be.gt(amount);
    });

    it("Should allow owner to withdraw tokens", async function () {
      const amount = ethers.utils.parseUnits("100", 6);
      await simpleTokenSwap.withdrawTokens(usdc.address, amount);

      const balance = await usdc.balanceOf(owner.address);
      expect(balance).to.be.gt(0);
    });

    it("Should not allow non-owners to add liquidity", async function () {
      const amount = ethers.utils.parseUnits("1000", 6);
      await usdc.connect(addr1).approve(simpleTokenSwap.address, amount);

      await expect(
        simpleTokenSwap.connect(addr1).addLiquidity(usdc.address, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 