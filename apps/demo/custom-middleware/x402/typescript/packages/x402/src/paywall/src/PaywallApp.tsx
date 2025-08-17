"use client";

import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useCallback, useEffect, useMemo, useState, useId } from "react";
import { createPublicClient, formatUnits, http, publicActions } from "viem";
import { base, baseSepolia } from "viem/chains";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";

import { selectPaymentRequirements } from "../../client";
import { exact } from "../../schemes";
import { getUSDCBalance } from "../../shared/evm";

import { Spinner } from "./Spinner";
import { useOnrampSessionToken } from "./useOnrampSessionToken";
import { ensureValidAmount } from "./utils";

/**
 * Main Paywall App Component
 *
 * @returns The PaywallApp component
 */
export function PaywallApp() {
  const { address, isConnected, chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { data: wagmiWalletClient } = useWalletClient();
  const { sessionToken } = useOnrampSessionToken(address);

  const [status, setStatus] = useState<string>("");
  const [isCorrectChain, setIsCorrectChain] = useState<boolean | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [formattedUsdcBalance, setFormattedUsdcBalance] = useState<string>("");
  const [hideBalance, setHideBalance] = useState(true);

  const [showPaymentForm, setShowPaymentForm] = useState(false); //captcha failed not failed

  const x402 = window.x402;
  const amount = x402.amount || 0;
  const testnet = x402.testnet ?? true;
  const paymentChain = testnet ? baseSepolia : base;
  const chainName = testnet ? "Base Sepolia" : "Base";
  const network = testnet ? "base-sepolia" : "base";
  const showOnramp = Boolean(!testnet && isConnected && x402.sessionTokenEndpoint);

  // moved below after function declarations to satisfy linter

  const publicClient = createPublicClient({
    chain: paymentChain,
    transport: http(),
  }).extend(publicActions);

  const paymentRequirements = x402
    ? selectPaymentRequirements([x402.paymentRequirements].flat(), network, "exact")
    : null;

  useEffect(() => {
    if (isConnected && paymentChain.id === connectedChainId) {
      setIsCorrectChain(true);
      setStatus("");
    } else if (isConnected && paymentChain.id !== connectedChainId) {
      setIsCorrectChain(false);
      setStatus(`On the wrong network. Please switch to ${chainName}.`);
    } else {
      setIsCorrectChain(null);
      setStatus("");
    }
  }, [paymentChain.id, connectedChainId, isConnected, chainName]);

  const handleCaptchaSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const answer = formData.get("answer") as string;
    const website = formData.get("website") as string; // honeypot

    // Check honeypot (bot detection) and answer
    const botTouchedTrap = website.trim().length > 0;
    const val = Number(answer.trim());

    if (!botTouchedTrap && val === 2) {
      // Captcha successful - redirect to success page
      window.location.href = "?captcha=success";
    } else {
      // Captcha failed - show payment form instead
      setShowPaymentForm(true);
    }
  }, []);

  const answerInputId = useId();
  const websiteInputId = useId();

  const checkUSDCBalance = useCallback(async () => {
    if (!address) {
      return;
    }
    const balance = await getUSDCBalance(publicClient, address);
    const formattedBalance = formatUnits(balance, 6);
    setFormattedUsdcBalance(formattedBalance);
  }, [address, publicClient]);

  const onrampBuyUrl = useMemo(() => {
    if (!sessionToken) {
      return;
    }
    return getOnrampBuyUrl({
      presetFiatAmount: 2,
      fiatCurrency: "USD",
      sessionToken,
    });
  }, [sessionToken]);

  const handleSuccessfulResponse = useCallback(async (response: Response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      document.documentElement.innerHTML = await response.text();
    } else {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.location.href = url;
    }
  }, []);

  const handleSwitchChain = useCallback(async () => {
    if (isCorrectChain) {
      return;
    }

    try {
      setStatus("");
      await switchChainAsync({ chainId: paymentChain.id });
      // Small delay to let wallet settle
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to switch network");
    }
  }, [switchChainAsync, paymentChain, isCorrectChain]);

  const addPayment = useCallback(async (address: string, pathname: string, expirationDate: string) => {
    try {
      const response = await fetch("/api/add-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          pathname,
          expiration_date: expirationDate, // ISO string e.g., "2025-08-16T12:00:00Z"
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Payment added:", data);
        return data;
      } else {
        console.error("Error adding payment:", data);
        return null;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  }, []);


  const handlePayment = useCallback(async () => {
    if (!address || !x402 || !paymentRequirements) {
      return;
    }

    await handleSwitchChain();

    // Use wagmi's wallet client which has the correct provider for the connected wallet
    // This avoids MetaMask conflicts when multiple wallets are installed
    if (!wagmiWalletClient) {
      setStatus("Wallet client not available. Please reconnect your wallet.");
      return;
    }
    const walletClient = wagmiWalletClient.extend(publicActions);

    setIsPaying(true);

    try {
      setStatus("Checking USDC balance...");
      const balance = await getUSDCBalance(publicClient, address);

      if (balance === 0n) {
        throw new Error(`Insufficient balance. Make sure you have USDC on ${chainName}`);
      }

      setStatus("Creating payment signature...");
      const validPaymentRequirements = ensureValidAmount(paymentRequirements);
      const initialPayment = await exact.evm.createPayment(
        walletClient,
        1,
        validPaymentRequirements,
      );

      const paymentHeader: string = exact.evm.encodePayment(initialPayment);

      setStatus("Requesting content with payment...");
      const response = await fetch(x402.currentUrl, {
        headers: {
          "X-PAYMENT": paymentHeader,
          "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
        },
      });
      if (response.ok) {
        const deltaTime = 3600; // 1 hour default expiration
        addPayment(
          address,
          window.location.pathname,
          new Date(Date.now() + deltaTime).toISOString(),
        );
        await handleSuccessfulResponse(response);
      } else if (response.status === 402) {
        // Try to parse error data, fallback to empty object if parsing fails
        const errorData = await response.json().catch(() => ({}));
        if (errorData && typeof errorData.x402Version === "number") {
          // Retry with server's x402Version
          const retryPayment = await exact.evm.createPayment(
            walletClient,
            errorData.x402Version,
            validPaymentRequirements,
          );

          retryPayment.x402Version = errorData.x402Version;
          const retryHeader = exact.evm.encodePayment(retryPayment);
          const retryResponse = await fetch(x402.currentUrl, {
            headers: {
              "X-PAYMENT": retryHeader,
              "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
            },
          });
          if (retryResponse.ok) {
            await handleSuccessfulResponse(retryResponse);
            return;
          } else {
            throw new Error(`Payment retry failed: ${retryResponse.statusText}`);
          }
        } else {
          throw new Error(`Payment failed: ${response.statusText}`);
        }
      } else {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  }, [
    address,
    x402,
    paymentRequirements,
    publicClient,
    handleSwitchChain,
    chainName,
    wagmiWalletClient,
    addPayment,
    handleSuccessfulResponse,
  ]);

  const checkPayment = useCallback(async (pathname: string, address: string) => {
    try {
      const response = await fetch("/api/check-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pathname, address }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to same page with query param
        window.location.href = "?captcha=success";
      } else {
        console.log("Payment not valid:", data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if(address){
      checkPayment(window.location.pathname, address);
    }
  }, [address, checkPayment]);

  // After hooks are declared to avoid use-before-define
  useEffect(() => {
    if (address) {
      handleSwitchChain();
      checkUSDCBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, handleSwitchChain, checkUSDCBalance]);

  if (!x402 || !paymentRequirements) {
    return (
      <div className="container">
        <div className="header">
          <h1 className="title">Payment Required</h1>
          <p className="subtitle">Loading payment details...</p>
        </div>
      </div>
    );
  }
//////////////////////
  // Show captcha first if payment form isn't shown yet
  if (!showPaymentForm) {
    return (
      <div className="container">
        <div className="header">
          <h1 className="title">Quick check</h1>
          <p className="subtitle">Prove you're human by answering a basic math question.</p>
        </div>
        
        <div className="content w-full">
          <form onSubmit={handleCaptchaSubmit} autoComplete="off">
            <label htmlFor={answerInputId} style={{ display: "block", margin: "10px 0 6px" }}>
              What is <strong>1 + 1</strong>?
            </label>
            <input 
  id={answerInputId}
  name="answer" 
  type="number" 
  inputMode="numeric" 
  required 
  placeholder="Type the answer"
  style={{
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #1f2937",
    borderRadius: "10px",
    background: "#ffffff",          // was "#0b1020"
    color: "#111827",               // was "var(--text-color)" which is fine; explicit dark text
    marginBottom: "12px",
  }}
/>
            {/* Honeypot for bot detection */}
            <input 
              type="text" 
              id={websiteInputId}
              name="website" 
              style={{ display: "none" }} 
              tabIndex={-1} 
              autoComplete="off" 
            />
            <button 
              type="submit" 
              className="button button-primary"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show payment form if captcha failed
  return (
    <div className="container gap-8">
      <div className="header">
        <h1 className="title">Payment Required</h1>
        <p>
          {paymentRequirements.description && `${paymentRequirements.description}.`} To access this
          content, please pay ${amount} {chainName} USDC.
        </p>
        {testnet && (
          <p className="instructions">
            Need Base Sepolia USDC?{" "}
            <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer">
              Get some <u>here</u>.
            </a>
          </p>
        )}
      </div>

      <div className="content w-full">
        <Wallet className="w-full">
          <ConnectWallet className="w-full py-3" disconnectedLabel="Connect wallet">
            <Avatar className="h-5 w-5 opacity-80" />
            <Name className="opacity-80 text-sm" />
          </ConnectWallet>
          <WalletDropdown>
            <WalletDropdownDisconnect className="opacity-80" />
          </WalletDropdown>
        </Wallet>
        {isConnected && (
          <div>
            {/* ... existing payment section code ... */}
            <div className="payment-details">
              <div className="payment-row">
                <span className="payment-label">Wallet:</span>
                <span className="payment-value">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Loading..."}
                </span>
              </div>
              <div className="payment-row">
                <span className="payment-label">Available balance:</span>
                <span className="payment-value">
                  {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
                  <button className="balance-button" onClick={() => setHideBalance(prev => !prev)}>
                    {formattedUsdcBalance && !hideBalance
                      ? `$${formattedUsdcBalance} USDC`
                      : "••••• USDC"}
                  </button>
                </span>
              </div>
              <div className="payment-row">
                <span className="payment-label">Amount:</span>
                <span className="payment-value">${amount} USDC</span>
              </div>
              <div className="payment-row">
                <span className="payment-label">Network:</span>
                <span className="payment-value">{chainName}</span>
              </div>
            </div>

            {isCorrectChain ? (
              <div className="cta-container">
                {showOnramp && (
                  <FundButton
                    fundingUrl={onrampBuyUrl}
                    text="Get more USDC"
                    hideIcon
                    className="button button-positive"
                  />
                )}
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handlePayment}
                  disabled={isPaying}
                >
                  {isPaying ? <Spinner /> : "Pay now"}
                </button>
              </div>
            ) : (
              <button type="button" className="button button-primary" onClick={handleSwitchChain}>
                Switch to {chainName}
              </button>
            )}
          </div>
        )}
        {status && <div className="status">{status}</div>}
      </div>
    </div>
  );
}
