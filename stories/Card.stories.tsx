import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Sparkles } from 'lucide-react'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Glass Editorial Card component with various variants and glass effects.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'glass', 'elevated', 'outline']
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl']
    }
  }
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>A simple card with default styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted">
            This is the content area of the card. It can contain any React components.
          </p>
        </CardContent>
      </>
    )
  }
}

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-accent-gold" />
            Glass Card
          </CardTitle>
          <CardDescription>A card with glass morphism effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted">
            Glass cards use backdrop blur and transparency for a modern look.
          </p>
        </CardContent>
      </>
    )
  }
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-gold" />
            Elevated Card
          </CardTitle>
          <CardDescription>A card with elevated glass styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted">
            Elevated cards have stronger glass effects for important content.
          </p>
        </CardContent>
      </>
    )
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <CardHeader>
          <CardTitle>Outline Card</CardTitle>
          <CardDescription>A card with transparent background and border</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted">
            Outline cards are minimal with just a border for definition.
          </p>
        </CardContent>
      </>
    )
  }
}

export const Interactive: Story = {
  args: {
    variant: 'glass',
    hover: true,
    children: (
      <>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>Click me for hover effects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted mb-4">
            This card has hover animations and responds to user interaction.
          </p>
          <Button variant="primary" className="w-full">
            Take Action
          </Button>
        </CardContent>
      </>
    )
  }
}

export const ProjectCard: Story = {
  render: () => (
    <Card variant="glass" hover className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-accent-gold" />
          Upload Photos
        </CardTitle>
        <CardDescription>
          Start your portrait generation project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Project Name</label>
          <input
            className="w-full h-10 px-3 rounded-xl bg-surface-glass border border-border-glass text-foreground placeholder:text-foreground-subtle"
            placeholder="My Portrait Session"
          />
        </div>
        <Button variant="primary" className="w-full">
          <Camera className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </CardContent>
    </Card>
  )
}

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
      <Card variant="default" padding="md">
        <CardHeader>
          <CardTitle>Default</CardTitle>
          <CardDescription>Standard card styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted text-sm">Default card content</p>
        </CardContent>
      </Card>

      <Card variant="glass" padding="md">
        <CardHeader>
          <CardTitle>Glass</CardTitle>
          <CardDescription>Glass morphism effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted text-sm">Glass card content</p>
        </CardContent>
      </Card>

      <Card variant="elevated" padding="md">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
          <CardDescription>Elevated glass styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted text-sm">Elevated card content</p>
        </CardContent>
      </Card>

      <Card variant="outline" padding="md">
        <CardHeader>
          <CardTitle>Outline</CardTitle>
          <CardDescription>Outline only styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-muted text-sm">Outline card content</p>
        </CardContent>
      </Card>
    </div>
  )
}