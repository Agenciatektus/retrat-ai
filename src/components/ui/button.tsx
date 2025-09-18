"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg" | "xl"
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      "inline-flex items-center justify-center",
      "font-medium transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "relative overflow-hidden"
    ]

    const variants = {
      default: [
        "bg-surface-elevated",
        "text-foreground",
        "hover:bg-surface-glass"
      ],
      primary: [
        "bg-accent-gold text-background",
        "hover:bg-accent-gold-hover"
      ],
      secondary: [
        "bg-surface text-foreground",
        "hover:bg-surface-elevated",
        "border border-border"
      ],
      ghost: [
        "text-foreground-muted",
        "hover:text-foreground",
        "hover:bg-surface-glass"
      ],
      outline: [
        "border border-border-glass",
        "text-foreground",
        "hover:bg-surface-glass"
      ]
    }

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-lg",
      md: "h-10 px-4 text-sm rounded-xl",
      lg: "h-12 px-6 text-base rounded-xl",
      xl: "h-14 px-8 text-lg rounded-2xl"
    }

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-5 h-5",
      xl: "w-6 h-6"
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {isLoading && (
          <motion.div
            className={cn("mr-2", iconSizes[size])}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        )}

        {leftIcon && !isLoading && (
          <span className={cn("mr-2", iconSizes[size])}>
            {leftIcon}
          </span>
        )}

        {children}

        {rightIcon && (
          <span className={cn("ml-2", iconSizes[size])}>
            {rightIcon}
          </span>
        )}
      </motion.button>
    )
  }
)

Button.displayName = "Button"

export { Button }
