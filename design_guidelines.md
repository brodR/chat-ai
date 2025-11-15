# Design Guidelines: AI Chat Application

## Design Approach
**Reference-Based:** Primary inspiration from ChatGPT, Discord, and Slack chat interfaces with focus on readability, efficiency, and modern messaging patterns.

**Core Principles:**
- Conversation-first design with minimal chrome
- Clear visual hierarchy between user and AI messages
- Efficient multimedia handling with inline previews
- Accessible, keyboard-friendly interface

---

## Layout System

**Application Structure:**
- Two-column layout: Sidebar (280px) + Main chat area (flex-1)
- Sidebar: Conversation list with search, new chat button, settings
- Main area: Chat header + Messages container + Input area (fixed bottom)
- Mobile: Single column with collapsible sidebar

**Spacing Units:** 
Use Tailwind spacing: **2, 3, 4, 6, 8** for consistency
- Message padding: p-4
- Section gaps: gap-6 or gap-8
- Input area: p-4
- Sidebar items: p-3

---

## Typography

**Font Family:**
- Primary: 'Inter' from Google Fonts (400, 500, 600 weights)
- Code blocks: 'JetBrains Mono' or system monospace

**Hierarchy:**
- Chat messages: text-base (16px), leading-relaxed
- Timestamps: text-xs (12px), opacity-60
- Usernames/labels: text-sm (14px), font-medium
- Input field: text-base
- Sidebar items: text-sm

---

## Component Library

### 1. Chat Messages
**User Messages:**
- Right-aligned with max-width-3xl
- Rounded corners (rounded-2xl)
- Padding: px-4 py-3
- Clear timestamp below message

**AI Messages:**
- Left-aligned with max-width-3xl
- Rounded corners (rounded-2xl)
- Padding: px-4 py-3
- AI avatar/icon (32x32) to the left
- Timestamp below message

**Message Container:**
- Scrollable area with smooth scroll behavior
- Auto-scroll to bottom on new messages
- Reverse-chronological order (oldest at top)

### 2. Input Area
**Composition:**
- Textarea with auto-resize (min-height: 56px, max-height: 200px)
- Rounded border (rounded-xl)
- Padding: p-4
- Bottom toolbar with attachment and send buttons
- Character/token counter (optional, subtle)

**Attachment Button:**
- Icon button with upload capabilities
- Triggers file picker for images, videos, audio, documents
- Shows file type icons (use Heroicons)

**Send Button:**
- Primary action button
- Icon: paper airplane or arrow
- Disabled state when empty
- Keyboard shortcut: Enter (Shift+Enter for new line)

### 3. File Attachments Display
**In Message Bubbles:**
- Images: Inline preview (max-width: 400px, rounded-lg)
- Videos: Thumbnail with play icon overlay
- Audio: Waveform player with controls
- Documents: Card with file icon, name, size

**Upload Preview (before sending):**
- Small preview cards in input area
- Close/remove button for each file
- Progress indicator during upload

### 4. Sidebar
**Structure:**
- Header with "New Chat" button (prominent, rounded-lg, p-3)
- Search/filter input (rounded-md, text-sm)
- Conversation list (scrollable)
- Settings/model selector at bottom

**Conversation Items:**
- Rounded items (rounded-lg) with hover states
- Title (truncated with ellipsis)
- Last message preview (text-xs, opacity-70)
- Timestamp (text-xs, opacity-50)
- Active state with visual indicator

### 5. Model Selector
**Interface:**
- Dropdown or modal with radio buttons
- Groups: "Cloud Models" and "Local Models"
- Each option shows: name, description, status indicator
- Save button to confirm selection

### 6. Empty State
**New Conversation:**
- Centered content with icon
- Welcome message
- Suggested prompts as clickable cards (grid-cols-2, gap-4)
- Brief instructions for file uploads

---

## Icons
**Library:** Heroicons (outline and solid variants via CDN)

**Key Icons:**
- Send: paper-airplane
- Attach: paperclip
- New chat: plus-circle
- Settings: cog-6-tooth
- User: user-circle
- AI: sparkles or cpu-chip
- Image: photo
- Video: film
- Audio: microphone
- Document: document-text

---

## Accessibility
- Proper ARIA labels for all interactive elements
- Keyboard navigation throughout (Tab, Enter, Escape)
- Focus indicators on all focusable elements
- Screen reader announcements for new messages
- Alt text for uploaded images
- Sufficient contrast ratios (WCAG AA minimum)

---

## Interactions & States

**Message States:**
- Sending: opacity-60 with loading indicator
- Sent: full opacity
- Error: red accent with retry option

**Hover States:**
- Sidebar items: subtle background change
- Message actions: show copy, edit, delete icons on hover
- Buttons: standard elevation/background changes

**Animations:**
- Message appearance: subtle fade-in (150ms)
- Sidebar toggle: slide transition (200ms)
- File upload: progress animation
- Typing indicator: animated dots for AI response

---

## Responsive Behavior
- **Desktop (lg+):** Full two-column layout
- **Tablet (md):** Collapsible sidebar with toggle button
- **Mobile (base):** Single column, sidebar as overlay drawer
- Input area remains fixed at bottom on all viewports
- Messages stack naturally with full width on mobile

---

This design creates a professional, efficient chat interface optimized for AI conversations with robust multimedia support while maintaining the familiar, comfortable patterns users expect from modern chat applications.