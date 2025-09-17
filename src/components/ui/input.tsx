"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: "default" | "glass" | "clean"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      leftIcon,
      rightIcon,
      variant = "default",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    const baseStyles = [
      "flex h-10 w-full rounded-xl px-3 py-2 text-sm",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-foreground-subtle",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200"
    ]

    const variants = {
      default: [
        "bg-surface border border-border",
        "text-foreground",
        "hover:border-border-glass",
        "focus:border-accent-gold"
      ],
      glass: [
        "bg-surface-glass text-foreground border-none",
        "hover:bg-surface-elevated",
        "focus:bg-surface-elevated"
      ],
      clean: [
        "bg-surface text-foreground border-none",
        "hover:bg-surface-elevated",
        "focus:bg-surface-elevated"
      ]
    }

    const errorStyles = error ? [
      "border-error",
      "focus:border-error",
      "focus-visible:ring-error"
    ] : []

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground block"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={cn(
              baseStyles,
              variants[variant],
              errorStyles,
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-error"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }