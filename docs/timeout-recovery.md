# Recovering a timed-out transaction

When a confirmation times out, the app does not tell you the transaction failed —
because it might not have. The transaction has already been submitted to the
network; the client simply stopped waiting for the ledger to confirm it. This
document explains what that state means and exactly how to recover from it.

- [1. What a confirmation timeout means](#1-what-a-confirmation-timeout-means)
- [2. The transaction may still settle](#2-the-transaction-may-still-settle)
- [3. The recovery action offered](#3-the-recovery-action-offered)
- [4. Where this appears](#4-where-this-appears)
- [5. A timeout is not the only failure](#5-a-timeout-is-not-the-only-failure)
- [Related documentation](#related-documentation)

---

## 1. What a confirmation timeout means

A Soroban write is not confirmed the moment it is sent. After the transaction is
submitted, the network still has to include it in a ledger. The client waits for
that by polling `getTransaction` once a second, up to 30 times (about 30
seconds), before it gives up (`confirm()` in `lib/contract.ts`).

If those 30 attempts pass without the transaction resolving, `confirm()` throws a
`TransactionTimeoutError` carrying the transaction's hash. The app treats that as
an **unknown outcome**, not a failure, and shows you this instead of an error:

> **Transaction confirmation timed out**
> The transaction was submitted on-chain. You can re-check its status without re-submitting.

A timeout, in other words, means: *I stopped listening, not that the transaction
was rejected.* A genuine rejection would have produced a different message —
see [section 5](#5-a-timeout-is-not-the-only-failure).

## 2. The transaction may still settle

This is the important part. Once a transaction has been accepted into the
network's pending pool, it can still be included in a later ledger, sometimes
well after the client stopped watching. A timeout says nothing about the
transaction's final fate:

- It may **succeed** — your stream is created, the withdrawal lands, the
  cancellation completes.
- It may **still be in flight** and land a moment later.
- It may ultimately **fail** on-chain (for example, the contract rejects it
  during execution).

All three are consistent with the timeout you saw. That is precisely why the app
offers a re-check instead of a retry: re-submitting a transaction that actually
succeeded would risk doing the action twice. Reading the real outcome — once —
is the safe path.

## 3. The recovery action offered

The timeout surfaces an amber alert (`components/timeout-recovery-alert.tsx`) that
carries the submitted transaction's hash and two actions:

| Action | What it does |
|---|---|
| **Re-check status** | Re-polls the network for that **same** hash. It never builds or sends a new transaction, so it cannot double the action. |
| **View on Stellar Expert** | Opens the transaction on the block explorer in a new tab, where you can see its real, independent status. |

**"Re-check status"** resumes the polling loop from the same hash
(`confirmTransaction()` in `lib/contract.ts`) and resolves one of two ways:

- The transaction has since confirmed → the app clears the timeout, records the
  hash as the completed action, and refreshes the stream.
- It still has not confirmed within another 30 seconds → the app says
  *"Confirmation timed out again. Check explorer or try again later."* and the
  alert **stays on screen** so the explorer link remains one click away. You can
  re-check as many times as you like; each attempt is read-only.

The re-check button is disabled while any other action is in progress, so you
cannot have a re-check and a withdrawal racing each other.

If you would rather not wait on the client at all, the **explorer link** is the
authoritative answer: it shows the transaction's status as the network sees it,
whether or not the browser app is still open.

## 4. Where this appears

The same recovery flow is wired into every write the app makes, so a timeout is
handled identically wherever you trigger it:

| Action | Hook that owns the recovery |
|---|---|
| Create a stream | `useCreateStreamForm` → `handleRecoverTimeout()` (`hooks/use-create-stream-form.ts`) |
| Withdraw | `useStreamActions` → `recoverTimeout()` (`hooks/use-stream-actions.ts`) |
| Cancel a stream | `useStreamActions` → `recoverTimeout()` (`hooks/use-stream-actions.ts`) |

In every case the timeout is reported as *"Confirmation timed out. The
transaction was submitted to the network."* and the recovery alert is shown
alongside it.

## 5. A timeout is not the only failure

It helps to tell a confirmation timeout apart from the other ways a transaction
can end, because only some of them leave a transaction on the network to
re-check:

| What you see | Meaning | Was it submitted? | What to do |
|---|---|---|---|
| Confirmation timed out (this document) | The client stopped waiting; outcome unknown | **Yes** | Re-check status, or open the explorer |
| A contract error, e.g. "Nothing to withdraw yet" | The ledger included the transaction and it **failed** on-chain | Yes, and it failed definitively | Fix the cause and start a fresh action |
| "The network rejected the transaction." | The RPC refused it outright (bad fee, malformed XDR, expired) | No | Correct the problem and try again |
| "Signing was rejected in the wallet." | You declined the signature (or the XDR expired while pending) | No | Nothing is on the network; retry if you still want to |
| "Wrong network: …" | The wallet is on a different network than the app | No | Switch networks in Freighter, then retry |

Only the first row — the timeout — is ambiguous and warrants the re-check flow.
Every other row has a definite outcome already.

---

## Related documentation

- [slow-network.md](slow-network.md#4-confirmation-timeout-recovery) — the
  polling constants and the code path behind this flow, alongside backend request
  timeouts and cancellation.
- [api-contract.md](api-contract.md#transaction-lifecycle) — the full write
  lifecycle (build, sign, submit, confirm) and the on-chain error-code mapping.
- [`lib/contract.ts`](../lib/contract.ts) — `TransactionTimeoutError` and
  `confirmTransaction()`.
- [README — FAQ 6](../README.md#6-how-does-the-frontend-prevent-duplicate-submissions-and-handle-timeout-errors) —
  the short answer on duplicate-submission prevention and timeout handling.
