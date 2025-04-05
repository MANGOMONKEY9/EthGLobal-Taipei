// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleTokenSwap is ReentrancyGuard, Ownable {
    // Token addresses
    address public constant USDC_ADDRESS = 0x1234567890123456789012345678901234567890; // Replace with actual USDC address
    address public constant SEVEN_TOKEN_ADDRESS = 0x38975a20aabbfc4D0e9b404bFD69094C69DA237c;
    address public constant ETH_ADDRESS = 0x0000000000000000000000000000000000000000;

    // Token decimals
    uint8 public constant USDC_DECIMALS = 6;
    uint8 public constant SEVEN_DECIMALS = 18;
    uint8 public constant ETH_DECIMALS = 18;

    // Fixed prices in USD (with 18 decimals)
    uint256 public constant USDC_PRICE = 1e18;    // $1
    uint256 public constant SEVEN_PRICE = 1e18;   // $1
    uint256 public constant ETH_PRICE = 2000e18;  // $2000
    uint256 public constant CUSTOM_TOKEN_PRICE = 0.1e18; // $0.1

    // Struct to store pool information
    struct Pool {
        address token;
        string symbol;
        uint8 decimals;
        bool exists;
    }

    // Mapping to store custom pools (token address => Pool)
    mapping(address => Pool) public customPools;
    // Array to store all custom pool addresses
    address[] public customPoolAddresses;

    event TokensSwapped(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    event PoolCreated(
        address indexed creator,
        address indexed token,
        string symbol,
        uint8 decimals
    );

    constructor() Ownable(msg.sender) {}

    function getTokenDecimals(address token) public view returns (uint8) {
        if (token == USDC_ADDRESS) return USDC_DECIMALS;
        if (token == SEVEN_TOKEN_ADDRESS) return SEVEN_DECIMALS;
        if (token == ETH_ADDRESS) return ETH_DECIMALS;
        if (customPools[token].exists) return customPools[token].decimals;
        revert("Unsupported token");
    }

    function getTokenPrice(address token) public view returns (uint256) {
        if (token == USDC_ADDRESS) return USDC_PRICE;
        if (token == SEVEN_TOKEN_ADDRESS) return SEVEN_PRICE;
        if (token == ETH_ADDRESS) return ETH_PRICE;
        if (customPools[token].exists) return CUSTOM_TOKEN_PRICE;
        revert("Unsupported token");
    }

    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256) {
        require(amountIn > 0, "Amount must be greater than 0");

        uint256 priceIn = getTokenPrice(tokenIn);
        uint256 priceOut = getTokenPrice(tokenOut);
        uint8 decimalsIn = getTokenDecimals(tokenIn);
        uint8 decimalsOut = getTokenDecimals(tokenOut);

        // Convert amount to 18 decimals for calculation
        uint256 normalizedAmountIn = amountIn * 10**(18 - decimalsIn);
        
        // Calculate the USD value and convert to output token
        uint256 usdValue = (normalizedAmountIn * priceIn) / 1e18;
        uint256 rawAmountOut = (usdValue * 1e18) / priceOut;
        
        // Convert to output token decimals
        uint256 amountOut = rawAmountOut / 10**(18 - decimalsOut);
        
        return amountOut;
    }

    function createPool(
        address token,
        string memory symbol
    ) external {
        require(token != USDC_ADDRESS, "Cannot create pool with USDC");
        require(token != SEVEN_TOKEN_ADDRESS, "Cannot create pool with 7ONE");
        require(token != ETH_ADDRESS, "Cannot create pool with ETH");
        require(!customPools[token].exists, "Pool already exists");

        // Get token decimals
        IERC20Metadata tokenContract = IERC20Metadata(token);
        uint8 decimals;
        try tokenContract.decimals() returns (uint8 dec) {
            decimals = dec;
        } catch {
            decimals = 18; // Default to 18 decimals if not specified
        }

        // Create new pool
        customPools[token] = Pool({
            token: token,
            symbol: symbol,
            decimals: decimals,
            exists: true
        });
        customPoolAddresses.push(token);

        emit PoolCreated(msg.sender, token, symbol, decimals);
    }

    function getCustomPools() external view returns (
        address[] memory tokens,
        string[] memory symbols,
        uint8[] memory decimals,
        uint256[] memory balances
    ) {
        uint256 length = customPoolAddresses.length;
        tokens = new address[](length);
        symbols = new string[](length);
        decimals = new uint8[](length);
        balances = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address token = customPoolAddresses[i];
            Pool memory pool = customPools[token];
            tokens[i] = token;
            symbols[i] = pool.symbol;
            decimals[i] = pool.decimals;
            balances[i] = IERC20(token).balanceOf(address(this));
        }
    }

    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external nonReentrant {
        require(tokenIn != tokenOut, "Cannot swap same token");
        require(amountIn > 0, "Amount must be greater than 0");
        require(
            (tokenIn == USDC_ADDRESS || tokenOut == USDC_ADDRESS) ||
            (tokenIn == SEVEN_TOKEN_ADDRESS || tokenOut == SEVEN_TOKEN_ADDRESS) ||
            (tokenIn == ETH_ADDRESS || tokenOut == ETH_ADDRESS) ||
            (customPools[tokenIn].exists || customPools[tokenOut].exists),
            "Invalid token pair"
        );

        // Calculate output amount
        uint256 amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        require(amountOut >= amountOutMin, "Insufficient output amount");

        // Check contract has enough output tokens
        require(
            IERC20(tokenOut).balanceOf(address(this)) >= amountOut,
            "Insufficient liquidity"
        );

        // Transfer input tokens from user to contract
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "Transfer in failed"
        );

        // Transfer output tokens to user
        require(
            IERC20(tokenOut).transfer(msg.sender, amountOut),
            "Transfer out failed"
        );

        emit TokensSwapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // Function to add liquidity to the contract (only owner)
    function addLiquidity(address token, uint256 amount) external onlyOwner {
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
    }

    // Function to withdraw tokens from the contract (only owner)
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(
            IERC20(token).transfer(msg.sender, amount),
            "Transfer failed"
        );
    }

    // View function to check contract's token balance
    function getContractBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
} 