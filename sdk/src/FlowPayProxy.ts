import { Request, Response } from 'express';
import { FlowPaySDK } from './FlowPaySDK';
import { ethers } from 'ethers';
import axios from 'axios';

export class FlowPayProxy {
    private sdk: FlowPaySDK;
    private marginPercent: number;

    constructor(sdk: FlowPaySDK, marginPercent: number = 10) {
        this.sdk = sdk;
        this.marginPercent = marginPercent;
    }

    /**
     * Calculates the price needed to cover downstream costs + margin.
     * Returns the rate string (e.g. "0.0001") for the Middleware to enforce.
     */
    public async calculateDynamicRate(req: any, downstreamUrl: string): Promise<string> {
        // 1. Probe Downstream to get their rate
        // We perform a HEAD request or simple GET hoping for a 402 with price headers
        try {
            await axios.head(downstreamUrl); // Expect 402
            return "0"; // Free?
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response && error.response.status === 402) {
                const downstreamRate = error.response.headers['x-flowpay-rate'];
                if (!downstreamRate) return "0.0001"; // Fallback

                const rateBn = ethers.parseEther(downstreamRate);
                const margin = rateBn * BigInt(this.marginPercent) / 100n;
                const myRate = rateBn + margin;

                return ethers.formatEther(myRate);
            }
            // Error probing
            console.warn("Could not probe downstream rate, defaulting.");
            return "0.0001";
        }
    }

    /**
     * Proxies the request if we are getting paid.
     * Note: In a real generic proxy, this would handle streams.
     * Ideally, the Middleware handles the "Check Incoming" part.
     * This helper is for the "Pay Downstream" part.
     */
    public async forwardRequest(downstreamUrl: string, method: string = 'POST', data: any = {}) {
        // We assume we are already paid (Middleware passed).
        // Now we use our SDK to pay the downstream.

        console.log(`[FlowPayProxy] Forwarding to ${downstreamUrl}...`);

        return await this.sdk.makeRequest(downstreamUrl, {
            method,
            data
        });
    }
}
