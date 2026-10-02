// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KeystoneEscrow
 * @notice Milestone-based escrow for grants and bounties, built for Circle's Arc.
 * @dev Funders lock USDC (or any ERC-20) up front. Builders submit proof per
 *      milestone; a reviewer releases each tranche on approval. Unreleased
 *      funds are always reclaimable by the funder after a milestone's deadline,
 *      or by cancelling the grant. 100% of escrowed funds go to the builder —
 *      the protocol takes no fee.
 *
 *      Designed for Arc: native-USDC gas and sub-second finality make even
 *      single-dollar milestone payouts economically sensible.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

abstract contract ReentrancyGuard {
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }
}

contract KeystoneEscrow is ReentrancyGuard {
    enum MilestoneStatus { Pending, Submitted, Paid, Cancelled }

    struct Milestone {
        string title;
        uint256 amount;
        uint64 deadline;
        MilestoneStatus status;
        string proofURI;
        uint64 submittedAt;
        uint64 paidAt;
    }

    struct Grant {
        address funder;
        address builder;
        address reviewer;
        address token;
        string title;
        string descriptionURI;
        uint64 createdAt;
        bool cancelled;
        uint256 totalAmount;
        uint256 releasedAmount;
    }

    uint256 public grantCount;

    mapping(uint256 => Grant) private _grants;
    mapping(uint256 => Milestone[]) private _milestones;

    event GrantCreated(
        uint256 indexed grantId,
        address indexed funder,
        address indexed builder,
        address reviewer,
        address token,
        uint256 totalAmount,
        uint256 milestoneCount
    );
    event MilestoneSubmitted(uint256 indexed grantId, uint256 indexed milestoneIndex, string proofURI);
    event MilestoneApproved(uint256 indexed grantId, uint256 indexed milestoneIndex, uint256 amount);
    event ChangesRequested(uint256 indexed grantId, uint256 indexed milestoneIndex, string note);
    event MilestoneReclaimed(uint256 indexed grantId, uint256 indexed milestoneIndex, uint256 amount);
    event GrantCancelled(uint256 indexed grantId, uint256 refunded);

    error ZeroAddress();
    error EmptyMilestones();
    error AmountMismatch();
    error ZeroAmount();
    error DeadlineInPast();
    error NotFunder();
    error NotBuilder();
    error NotReviewer();
    error AlreadyCancelled();
    error BadStatus();
    error TransferFailed();

    modifier onlyFunder(uint256 grantId) {
        if (msg.sender != _grants[grantId].funder) revert NotFunder();
        _;
    }

    modifier onlyBuilder(uint256 grantId) {
        if (msg.sender != _grants[grantId].builder) revert NotBuilder();
        _;
    }

    modifier onlyReviewer(uint256 grantId) {
        if (msg.sender != _grants[grantId].reviewer) revert NotReviewer();
        _;
    }

    modifier notCancelled(uint256 grantId) {
        if (_grants[grantId].cancelled) revert AlreadyCancelled();
        _;
    }

    struct MilestoneInput {
        string title;
        uint256 amount;
        uint64 deadline;
    }

    /**
     * @notice Create and fully fund a grant in a single call (after `approve`).
     * @param builder        Address receiving milestone payouts.
     * @param reviewer       Address allowed to approve milestones (may equal funder).
     * @param token          ERC-20 token escrowed (e.g. Arc's USDC).
     * @param title          Short grant title.
     * @param descriptionURI Off-chain metadata (IPFS / URL).
     * @param inputs         Per-milestone title, amount (token base units) and deadline.
     */
    function createGrant(
        address builder,
        address reviewer,
        address token,
        string calldata title,
        string calldata descriptionURI,
        MilestoneInput[] calldata inputs
    ) external nonReentrant returns (uint256 grantId) {
        if (builder == address(0) || reviewer == address(0) || token == address(0)) revert ZeroAddress();
        uint256 n = inputs.length;
        if (n == 0) revert EmptyMilestones();

        uint256 total;
        for (uint256 i = 0; i < n; i++) {
            if (inputs[i].amount == 0) revert ZeroAmount();
            if (inputs[i].deadline <= block.timestamp) revert DeadlineInPast();
            total += inputs[i].amount;
        }

        grantId = grantCount++;
        Grant storage g = _grants[grantId];
        g.funder = msg.sender;
        g.builder = builder;
        g.reviewer = reviewer;
        g.token = token;
        g.title = title;
        g.descriptionURI = descriptionURI;
        g.createdAt = uint64(block.timestamp);
        g.totalAmount = total;

        for (uint256 i = 0; i < n; i++) {
            _milestones[grantId].push(
                Milestone({
                    title: inputs[i].title,
                    amount: inputs[i].amount,
                    deadline: inputs[i].deadline,
                    status: MilestoneStatus.Pending,
                    proofURI: "",
                    submittedAt: 0,
                    paidAt: 0
                })
            );
        }

        if (!IERC20(token).transferFrom(msg.sender, address(this), total)) revert TransferFailed();

        emit GrantCreated(grantId, msg.sender, builder, reviewer, token, total, n);
    }

    /**
     * @notice Create and fund a grant with native USDC in ONE transaction — no ERC-20 approval.
     * @dev Amounts are denominated in native USDC base units (18 decimals). `token` is stored
     *      as address(0) to denote native USDC for all later payouts. This is the most Arc-native
     *      path: USDC is the gas token, so funding a grant is a single 1-click transfer.
     */
    function createGrantNative(
        address builder,
        address reviewer,
        string calldata title,
        string calldata descriptionURI,
        MilestoneInput[] calldata inputs
    ) external payable nonReentrant returns (uint256 grantId) {
        if (builder == address(0) || reviewer == address(0)) revert ZeroAddress();
        uint256 n = inputs.length;
        if (n == 0) revert EmptyMilestones();

        uint256 total;
        for (uint256 i = 0; i < n; i++) {
            if (inputs[i].amount == 0) revert ZeroAmount();
            if (inputs[i].deadline <= block.timestamp) revert DeadlineInPast();
            total += inputs[i].amount;
        }
        if (msg.value != total) revert AmountMismatch();

        grantId = grantCount++;
        Grant storage g = _grants[grantId];
        g.funder = msg.sender;
        g.builder = builder;
        g.reviewer = reviewer;
        g.token = address(0); // address(0) denotes native USDC
        g.title = title;
        g.descriptionURI = descriptionURI;
        g.createdAt = uint64(block.timestamp);
        g.totalAmount = total;

        for (uint256 i = 0; i < n; i++) {
            _milestones[grantId].push(
                Milestone({
                    title: inputs[i].title,
                    amount: inputs[i].amount,
                    deadline: inputs[i].deadline,
                    status: MilestoneStatus.Pending,
                    proofURI: "",
                    submittedAt: 0,
                    paidAt: 0
                })
            );
        }

        emit GrantCreated(grantId, msg.sender, builder, reviewer, address(0), total, n);
    }

    /// @notice Release escrowed funds — native USDC (token == address(0)) or ERC-20.
    function _payout(Grant storage g, address to, uint256 amount) internal {
        if (g.token == address(0)) {
            (bool ok, ) = to.call{value: amount}("");
            if (!ok) revert TransferFailed();
        } else {
            if (!IERC20(g.token).transfer(to, amount)) revert TransferFailed();
        }
    }

    /// @notice Builder submits proof of completion for a milestone.
    function submitMilestone(uint256 grantId, uint256 index, string calldata proofURI)
        external
        onlyBuilder(grantId)
        notCancelled(grantId)
    {
        Milestone storage m = _milestones[grantId][index];
        if (m.status != MilestoneStatus.Pending) revert BadStatus();
        m.status = MilestoneStatus.Submitted;
        m.proofURI = proofURI;
        m.submittedAt = uint64(block.timestamp);
        emit MilestoneSubmitted(grantId, index, proofURI);
    }

    /// @notice Reviewer approves a submitted milestone; funds stream to the builder instantly.
    function approveMilestone(uint256 grantId, uint256 index)
        external
        onlyReviewer(grantId)
        notCancelled(grantId)
        nonReentrant
    {
        Grant storage g = _grants[grantId];
        Milestone storage m = _milestones[grantId][index];
        if (m.status != MilestoneStatus.Submitted) revert BadStatus();

        m.status = MilestoneStatus.Paid;
        m.paidAt = uint64(block.timestamp);
        g.releasedAmount += m.amount;

        _payout(g, g.builder, m.amount);
        emit MilestoneApproved(grantId, index, m.amount);
    }

    /// @notice Reviewer sends a milestone back for revision with a note.
    function requestChanges(uint256 grantId, uint256 index, string calldata note)
        external
        onlyReviewer(grantId)
        notCancelled(grantId)
    {
        Milestone storage m = _milestones[grantId][index];
        if (m.status != MilestoneStatus.Submitted) revert BadStatus();
        m.status = MilestoneStatus.Pending;
        m.proofURI = "";
        emit ChangesRequested(grantId, index, note);
    }

    /// @notice Funder reclaims an unpaid milestone past its deadline.
    function reclaimExpired(uint256 grantId, uint256 index)
        external
        onlyFunder(grantId)
        notCancelled(grantId)
        nonReentrant
    {
        Grant storage g = _grants[grantId];
        Milestone storage m = _milestones[grantId][index];
        if (m.status != MilestoneStatus.Pending && m.status != MilestoneStatus.Submitted) revert BadStatus();
        if (block.timestamp <= m.deadline) revert DeadlineInPast();

        m.status = MilestoneStatus.Cancelled;
        _payout(g, g.funder, m.amount);
        emit MilestoneReclaimed(grantId, index, m.amount);
    }

    /// @notice Funder cancels the grant; all unpaid milestones refund immediately.
    function cancelGrant(uint256 grantId) external onlyFunder(grantId) nonReentrant returns (uint256 refunded) {
        Grant storage g = _grants[grantId];
        if (g.cancelled) revert AlreadyCancelled();
        g.cancelled = true;

        Milestone[] storage ms = _milestones[grantId];
        for (uint256 i = 0; i < ms.length; i++) {
            if (ms[i].status == MilestoneStatus.Pending || ms[i].status == MilestoneStatus.Submitted) {
                ms[i].status = MilestoneStatus.Cancelled;
                refunded += ms[i].amount;
            }
        }
        if (refunded > 0) _payout(g, g.funder, refunded);
        emit GrantCancelled(grantId, refunded);
    }

    // ---- Views ----

    function getGrant(uint256 grantId) external view returns (Grant memory) {
        return _grants[grantId];
    }

    function getMilestones(uint256 grantId) external view returns (Milestone[] memory) {
        return _milestones[grantId];
    }

    function milestoneCount(uint256 grantId) external view returns (uint256) {
        return _milestones[grantId].length;
    }

    /// @notice USDC still locked for unpaid, unexpired milestones.
    function lockedAmount(uint256 grantId) external view returns (uint256 locked) {
        Grant storage g = _grants[grantId];
        if (g.cancelled) return 0;
        Milestone[] storage ms = _milestones[grantId];
        for (uint256 i = 0; i < ms.length; i++) {
            if (ms[i].status == MilestoneStatus.Pending || ms[i].status == MilestoneStatus.Submitted) {
                locked += ms[i].amount;
            }
        }
    }
}
