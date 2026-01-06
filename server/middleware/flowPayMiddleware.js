const { ethers } = require('ethers');

/**
 * FlowPay x402 Express Middleware
 * @param {Object} config Middleware configuration
 * @param {Object} config.routes Map of routes to pricing config
 * @param {string} config.mneeAddress MNEE Token Address
 * @param {string} config.flowPayContractAddress MorphStream Contract Address
 * @param {string} config.rpcUrl RPC URL for blockchain connection
 * @param {string} config.apiKey Optional API Key for authentication
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

        // 0. API Key Authentication (Requirement 3.4)
        if (config.apiKey) {
            const clientKey = req.headers['x-api-key'];
            if (!clientKey || clientKey !== config.apiKey) {
                return res.status(401).json({ error: "Unauthorized: Invalid or missing API Key" });
            }
        }

        const streamIdHeader = req.headers['x-flowpay-stream-id'];
        const txHashHeader = req.headers['x-flowpay-tx-hash'];

        // 1. Check for Direct Payment (Tx Hash) (Requirement: Hybrid Mode)
        if (txHashHeader) {
            try {
                // In a real implementation, we would:
                // 1. Fetch tx receipt from provider
                // 2. Verify receiver == config.mneeAddress (or recipient)
                // 3. Verify amount >= routeConfig.price
                // 4. Verify status == 1 (success)
                // 5. Verify tx hash hasn't been used before (replay protection)

                // For Hackathon/Mock: We assume if the hash matches a pattern/mock or just exists, it's valid if using mockContract
                // Or if we have a provider, we could attempt to look it up. 
                // Let's implement a basic mock verification if config.mockContract exists.

                let isValidPayment = false;
                if (config.mockContract) {
                    // Mock validation
                    isValidPayment = true;
                    console.log(`[FlowPay] Validated Direct Payment Tx: ${txHashHeader}`);
                } else {
                    // Real provider validation (TODO: Implement full verification)
                    // For now, optimistic acceptance for valid-looking hashes
                    if (txHashHeader.startsWith('0x') && txHashHeader.length === 66) {
                        isValidPayment = true;
                    }
                }

                if (isValidPayment) {
                    console.log(`[FlowPay] Request accepted for ${path} using Direct Payment Tx: ${txHashHeader}`);
                    req.flowPay = { txHash: txHashHeader, mode: 'direct' };
                    return next();
                }
            } catch (e) {
                console.error("Direct payment verification failed:", e);
            }
        }

        // 2. Check for Stream ID Header
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
