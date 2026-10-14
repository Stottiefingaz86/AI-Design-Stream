"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";

interface PaymentMethodSelectorProps {
  onProceed: (method: string, data: any) => void;
  availableBalance?: string;
  symbol?: string;
}

export function PaymentMethodSelector({ 
  onProceed, 
  availableBalance = "100,000.00",
  symbol = "$"
}: PaymentMethodSelectorProps) {
  const [depositAmount, setDepositAmount] = useState(25); // Default to $25
  const [customAmount, setCustomAmount] = useState("");

  const presetAmounts = [25, 50, 100, 500];

  const handlePresetAmount = (amount: number) => {
    setDepositAmount(amount);
    setCustomAmount("");
  };

  const handleIncrement = () => {
    const current = depositAmount || 0;
    const newAmount = Math.min(500, current + 25);
    setDepositAmount(newAmount);
    setCustomAmount("");
  };

  const handleDecrement = () => {
    const current = depositAmount || 0;
    const newAmount = Math.max(25, current - 25);
    setDepositAmount(newAmount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value) || 0;
    setDepositAmount(numValue);
  };

  const handleProceed = () => {
    if (depositAmount >= 25 && depositAmount <= 500) {
      onProceed("deposit", {
        amount: depositAmount,
        customAmount: customAmount || depositAmount.toString(),
      });
    }
  };

  const fee = depositAmount * 0.0975; // 9.75% fee
  const totalAmount = depositAmount + fee;

  return (
    <div className="w-full space-y-6">
      {/* Deposit Amount Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Deposit Amount</h3>
        
        {/* Preset Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {presetAmounts.map((amount) => {
            const isSelected = depositAmount === amount && !customAmount;
            return (
              <Button
                key={amount}
                variant="outline"
                onClick={() => handlePresetAmount(amount)}
                className={`h-auto py-2.5 text-sm rounded-md transition-all ${
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                    : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                {symbol}{amount}
              </Button>
            );
          })}
        </div>

        {/* Amount Display with Increment/Decrement */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            className="h-10 w-10 border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={depositAmount <= 25}
          >
            <IconChevronDown className="h-4 w-4 text-gray-700" />
          </Button>
          
          <div className="flex-1 flex flex-col items-center">
            <div className="text-center text-4xl font-bold text-gray-900 mb-2">
              {symbol}{depositAmount.toFixed(2)}
            </div>
            <Input
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="text-center border-gray-300 rounded-md"
              min="25"
              max="500"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            className="h-10 w-10 border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={depositAmount >= 500}
          >
            <IconChevronUp className="h-4 w-4 text-gray-700" />
          </Button>
        </div>

        {/* Limits */}
        <p className="text-xs text-gray-500 text-center mb-4">
          Min. {symbol}25 / Max. {symbol}500
        </p>
      </div>

      {/* Fee and Total */}
      {depositAmount > 0 && (
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Deposit Amount:</span>
            <span className="text-gray-900 font-medium">{symbol}{depositAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fee (9.75%):</span>
            <span className="text-gray-900 font-medium">{symbol}{fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-200">
            <span className="text-gray-900 font-semibold">Total Amount:</span>
            <span className="text-gray-900 font-bold">{symbol}{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Proceed Button */}
      <Button
        onClick={handleProceed}
        disabled={depositAmount < 25 || depositAmount > 500}
        className="w-full h-12 bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 rounded-md font-semibold"
      >
        DEPOSIT {symbol}{depositAmount > 0 ? depositAmount.toFixed(2) : "0.00"}
      </Button>
    </div>
  );
}
