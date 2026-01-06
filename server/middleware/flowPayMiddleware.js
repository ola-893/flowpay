const { ethers } = require('ethers');

/**
 * FlowPay x402 Express Middleware
 * @param {Object} config Middleware configuration
 * @param {Object} config.routes Map of routes to pricing config
 * @param {string} config.mneeAddress MNEE Token Address
 * @param {string} config.flowPayContractAddress MorphStream Contract Address
 * @param {string} config.rpcUrl RPC URL for blockchain connection
 * @param {string} config.privateKey Optional private key for server-side signing if needed (not used for verification)
 */
const flowPayMiddleware = (config) => {
    // Initialize provider and contract OR use mock
    let flowPayContract;

    if (config.mockContract) {
        flowPayContract = config.mockContract;
    } else {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        flowPayContract = new ethers.Contract(
            config.flowPayContractAddress,
            [
                "function isStreamActive(uint256 streamId) external view returns (bool)",
                "function getClaimableBalance(uint256 streamId) external view returns (uint256)",
                "function streams(uint256 streamId) external view returns (address sender, address recipient, uint256 totalAmount, uint256 flowRate, uint256 startTime, uint256 stopTime, uint256 amountWithdrawn, bool isActive, string metadata)"
            ],
            provider
        );
    }

    return async (req, res, next) => {
        const path = req.path;

        // Find matching route config
        // Simple exact match or simple prefix match logic
        let routeConfig = config.routes[path];
        if (!routeConfig) {
            // Try finding a matching prefix if exact match fails
            const matchingKey = Object.keys(config.routes).find(key => path.startsWith(key));
            if (matchingKey) {
                routeConfig = config.routes[matchingKey];
            }
        }

        // If route is not configured for payment, proceed freely
        if (!routeConfig) {
            return next();
        }

        const streamIdHeader = req.headers['x-flowpay-stream-id'];

        // 1. Check for Stream ID Header
        if (!streamIdHeader) {
            return send402Response(res, routeConfig, config);
        }

        try {
            // 2. Verify Stream ID
            const streamId = BigInt(streamIdHeader);
            const isActive = await flowPayContract.isStreamActive(streamId);

            if (!isActive) {
                // Stream exists but is inactive
                return res.status(402).json({
                    error: "Stream is inactive",
                    detail: "The provided stream ID is not active. Please open a new stream or top up."
                });
            }

            // Optional: Verify recipient is this server (if we tracked our address)
            // Optional: Verify balance is sufficient (via getClaimableBalance or local tracking)

            // Track metrics (simple console log for MVP)
            console.log(`[FlowPay] Request accepted for ${path} using Stream #${streamId}`);

            // Attach stream info to request for downstream use
            req.flowPay = {
                streamId: streamId.toString()
            };

            next();
        } catch (error) {
            console.error("[FlowPay] Stream verification failed:", error);
            // Fallback to 402 if verification crashes (safe default)
            return send402Response(res, routeConfig, config);
        }
    };
};

function send402Response(res, routeConfig, config) {
    res.set('X-Payment-Required', 'true');
    res.set('X-FlowPay-Mode', routeConfig.mode || 'streaming');
    res.set('X-FlowPay-Rate', routeConfig.price || '0');
    res.set('X-MNEE-Address', config.mneeAddress || '');
    res.set('X-FlowPay-Contract', config.flowPayContractAddress || '');
    // Standard 402 body
    res.status(402).json({
        message: "Payment Required",
        requirements: {
            mode: routeConfig.mode || 'streaming',
            price: routeConfig.price,
            currency: "MNEE",
            contract: config.flowPayContractAddress,
            recipient: config.mneeAddress // Assuming server wallet is MNEE recipient
        }
    });
}

module.exports = flowPayMiddleware;
