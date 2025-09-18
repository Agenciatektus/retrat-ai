"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outline" | "borderless" | "clean"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  hover?: boolean
}

type MotionCardProps = Omit<CardProps, 'onDrag' | 'onDragStart' | 'onDragEnd'>

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      "rounded-xl overflow-hidden",
      "transition-all duration-200"
    ]

    const variants = {
      default: [
        "border",
        "bg-surface border-border"
      ],
      glass: [
        "bg-surface border border-border"
      ],
      elevated: [
        "bg-surface border border-border"
      ],
      outline: [
        "border border-border-glass",
        "bg-transparent"
      ],
      borderless: [
        "bg-surface"
      ],
      clean: [
        "bg-surface"
      ]
    }

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8"
    }

    const hoverStyles = hover ? [
      "hover:scale-[1.005]",
      "cursor-pointer",
      "transition-all duration-300 ease-out"
    ] : []

    const commonClassName = cn(
      baseStyles,
      variants[variant],
      paddings[padding],
      hoverStyles,
      className
    )

    if (hover) {
      // Separate conflicting event handlers to avoid type conflicts
      const {
        onDrag,
        onDragStart,
        onDragEnd,
        onAnimationStart,
        onAnimationEnd,
        onAnimationIteration,
        onTransitionEnd,
        ...safeProps
      } = props
      
      return (
        <motion.div
          ref={ref}
          className={commonClassName}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          {...safeProps}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={commonClassName}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-heading text-2xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }