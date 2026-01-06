const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MorphStream", function () {
    let MorphStream;
    let morphStream;
    let MockMNEE;
    let mockMNEE;
    let owner;
    let recipient;
    let otherAccount;

    beforeEach(async function () {
        [owner, recipient, otherAccount] = await ethers.getSigners();

        // Deploy MockMNEE
        MockMNEE = await ethers.getContractFactory("MockMNEE");
        mockMNEE = await MockMNEE.deploy();
        await mockMNEE.waitForDeployment();

        // Deploy MorphStream
        MorphStream = await ethers.getContractFactory("MorphStream");
        morphStream = await MorphStream.deploy(await mockMNEE.getAddress());
        await morphStream.waitForDeployment();

        // Mint tokens to owner
        await mockMNEE.mint(owner.address, ethers.parseEther("1000"));
    });

    describe("Deployment", function () {
        it("Should set the right MNEE token address", async function () {
            expect(await morphStream.mneeToken()).to.equal(await mockMNEE.getAddress());
        });
    });

    describe("Stream Creation", function () {
        it("Should create a stream successfully", async function () {
            const amount = ethers.parseEther("100");
            const duration = 100; // 100 seconds

            // Approve MorphStream to spend tokens
            await mockMNEE.approve(await morphStream.getAddress(), amount);

            const tx = await morphStream.createStream(recipient.address, duration, amount, "metadata");
            const receipt = await tx.wait();

            // Check event
            const event = receipt.logs.find(log => {
                try {
                    return morphStream.interface.parseLog(log).name === 'StreamCreated';
                } catch (e) {
                    return false;
                }
            });
            expect(event).to.not.be.undefined;

            const args = morphStream.interface.parseLog(event).args;
            expect(args.recipient).to.equal(recipient.address);
            expect(args.totalAmount).to.equal(amount);
            expect(args.metadata).to.equal("metadata");
        });

        it("Should fail if allowance is insufficient", async function () {
            const amount = ethers.parseEther("100");
            const duration = 100;

            await expect(
                morphStream.createStream(recipient.address, duration, amount, "metadata")
            ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        });
    });

    describe("Withdrawal", function () {
        it("Should allow withdrawal of accrued tokens", async function () {
            const amount = ethers.parseEther("100");
            const duration = 100;

            await mockMNEE.approve(await morphStream.getAddress(), amount);
            await morphStream.createStream(recipient.address, duration, amount, "metadata");

            // Increase time by 50 seconds
            await ethers.provider.send("evm_increaseTime", [50]);
            await ethers.provider.send("evm_mine");

            const streamId = 1;
            const claimable = await morphStream.getClaimableBalance(streamId);

            // Approx 50 tokens
            expect(claimable).to.be.closeTo(ethers.parseEther("50"), ethers.parseEther("1"));

            const recipientBalanceBefore = await mockMNEE.balanceOf(recipient.address);
            await morphStream.connect(recipient).withdrawFromStream(streamId);
            const recipientBalanceAfter = await mockMNEE.balanceOf(recipient.address);

            expect(recipientBalanceAfter - recipientBalanceBefore).to.be.closeTo(claimable, ethers.parseEther("2"));
        });
    });

    describe("Cancellation", function () {
        it("Should allow sender to cancel and refund remaining", async function () {
            const amount = ethers.parseEther("100");
            const duration = 100;

            await mockMNEE.approve(await morphStream.getAddress(), amount);
            await morphStream.createStream(recipient.address, duration, amount, "metadata");

            // Increase time by 50 seconds
            await ethers.provider.send("evm_increaseTime", [50]);
            await ethers.provider.send("evm_mine");

            const streamId = 1;

            const senderBalanceBefore = await mockMNEE.balanceOf(owner.address);
            await morphStream.cancelStream(streamId);
            const senderBalanceAfter = await mockMNEE.balanceOf(owner.address);

            // Should get back approx 50 tokens
            expect(senderBalanceAfter - senderBalanceBefore).to.be.closeTo(ethers.parseEther("50"), ethers.parseEther("1"));

            expect(await morphStream.isStreamActive(streamId)).to.be.false;
        });
    });

    describe("Active Check", function () {
        it("Should return true for active stream", async function () {
            const amount = ethers.parseEther("100");
            const duration = 100;
            await mockMNEE.approve(await morphStream.getAddress(), amount);
            await morphStream.createStream(recipient.address, duration, amount, "metadata");
            expect(await morphStream.isStreamActive(1)).to.be.true;
        });
    });
});
