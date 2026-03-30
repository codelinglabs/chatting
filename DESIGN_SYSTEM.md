# Chatting UI/UX Design System

## Design Philosophy

### Core Principles

1. Conversational, not corporate
Chatting should feel like talking to a person, not filing a support ticket.

2. Clarity over cleverness
Small teams should be able to understand the product instantly.

3. Speed is a feature
Real-time interactions should feel immediate, with snappy feedback and low-friction flows.

4. Context without clutter
Visitor context should support the conversation, never overpower it.

## Visual Identity

### Color Palette

Primary
- Chatting Blue: `#2563EB`
- Chatting Blue Dark: `#1D4ED8`
- Chatting Blue Light: `#DBEAFE`

Neutral
- Slate 900: `#0F172A`
- Slate 600: `#475569`
- Slate 400: `#94A3B8`
- Slate 200: `#E2E8F0`
- Slate 100: `#F1F5F9`
- White: `#FFFFFF`

Status
- Green: `#10B981`
- Amber: `#F59E0B`
- Red: `#EF4444`
- Gray: `#6B7280`

Chat surfaces
- Visitor Bubble: `#F1F5F9`
- Team Bubble: `#2563EB`
- System Message: `#FEF3C7`

### Typography

Font stack
- Primary: `"Sohne", system-ui, sans-serif`
- Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI"`
- Mono: `"Sohne Mono", "SF Mono", Consolas, monospace`

Scale
- Display: `32px / 40px / -0.02em`
- Title: `24px / 32px / -0.01em`
- Heading: `18px / 28px / -0.01em`
- Body: `15px / 24px`
- Small: `13px / 20px / 0.01em`
- Tiny: `11px / 16px / 0.02em`

Weights
- Regular: `400`
- Medium: `500`
- Semibold: `600`

### Spacing

Base unit: `4px`

- xs: `4px`
- sm: `8px`
- md: `12px`
- lg: `16px`
- xl: `24px`
- 2xl: `32px`
- 3xl: `48px`
- 4xl: `64px`

### Radius

- sm: `4px`
- md: `8px`
- lg: `12px`
- xl: `16px`
- full: `9999px`

### Shadows

- sm: `0 1px 2px rgba(0,0,0,0.05)`
- md: `0 4px 6px rgba(0,0,0,0.07)`
- lg: `0 10px 25px rgba(0,0,0,0.10)`
- xl: `0 20px 40px rgba(0,0,0,0.15)`
- widget: `0 8px 30px rgba(0,0,0,0.12)`

## Product Surfaces

### Visitor Widget

Collapsed launcher
- Circular floating button
- Bottom-right by default with `24px` margin
- Chatting Blue background
- Hover scale treatment

Expanded chat
- Desktop width target: `380px`
- Mobile width target: full width with side margins
- Header communicates team name and presence
- Conversation area is the primary surface
- Input area stays anchored and immediate

Offline and away behavior
- Presence copy should shift from live-chat language to email-follow-up language
- Email capture should feel optional unless the product explicitly requires it

Key interactions
- Sent messages feel instant
- Received messages animate in subtly
- Typing indicators appear quickly and disappear shortly after inactivity
- Attachments preview clearly before and after send

### Team Inbox

Layout
- Conversation list on the left
- Active conversation in the middle
- Visitor context on the right

Conversation list item
- Unread state should stand out immediately
- Open and resolved states should be visible at a glance
- Preview text, page, and lightweight context should remain scannable

Conversation view
- Messages should feel like a modern chat thread
- Reply composer should support real-time use, attachments, and quick resolution flow

Visitor context
- Current page
- Referrer
- Location when available
- First seen / last seen
- Conversation history
- Tags and notes

## Responsive Rules

Breakpoints
- Mobile: `0 - 639px`
- Tablet: `640 - 1023px`
- Desktop: `1024 - 1279px`
- Wide: `1280px+`

Inbox responsiveness
- Mobile should prioritize the conversation list and a full-screen thread view
- Tablet should preserve a two-column reading experience
- Desktop should retain the full three-panel layout when space allows

## Accessibility

Requirements
- WCAG 2.1 AA contrast
- Visible keyboard focus
- Screen-reader labels on interactive elements
- Keyboard-friendly navigation
- Reduced-motion support via `prefers-reduced-motion`

Focus ring

```css
:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}
```

## Motion

Timing
- Fast: `100ms ease-out`
- Base: `200ms ease-out`
- Slow: `300ms ease-out`

Preferred easing
- Standard: `ease-out`
- Expressive spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`

Key animations
- Widget open: fade + translate + scale
- Message appear: subtle vertical slide
- Typing dots: staggered pulse
- Unread badge pulse: reserved for new-message emphasis

## Error States

Examples
- Connection lost
- Message failed with retry affordance
- No conversations yet
- No search results
- No notifications

Guidelines
- Keep the language calm and direct
- Explain what happened
- Show the next best action

## Settings Areas

Navigation
- Profile
- Team
- Widget
- Notifications
- Email
- Billing

Widget settings should cover
- Brand color
- Launcher position
- Welcome message
- Presence behavior
- Offline email behavior
- Installation snippet

## State Model

Conversation states
- `open`
- `resolved`
- `archived`

Message states
- `sending`
- `sent`
- `delivered`
- `read`
- `failed`

## Performance Targets

- Widget bundle under `30KB` gzipped when feasible
- Time to interactive under `1s`
- Real-time delivery target under `100ms` in ideal conditions
- Lighthouse target above `90`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

## Component Checklist

Visitor widget
- Launcher button
- Chat container
- Visitor message bubble
- Team message bubble
- Typing indicator
- Message input
- File attachment preview
- Image viewer
- Offline form
- Email capture
- Connection status

Team inbox
- Navigation header
- Conversation list
- Conversation list item
- Conversation view
- Message thread
- Rich reply input
- Visitor sidebar
- Tag manager
- Search bar
- Filter controls
- Empty states
- Loading states
- Toast notifications

Settings
- Settings nav
- Profile form
- Team list
- Invite modal
- Widget preview
- Color picker
- Toggle switch
- Snippet block
- Plan comparison
- Billing info
