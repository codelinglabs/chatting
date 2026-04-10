# Guide Writing Standard

This file defines how public guides in Chatting should be structured and written.

The goal is simple:

- guides should read like product documentation
- guides should help someone finish setup or understand a feature quickly
- guides should not read like blog filler, internal engineering notes, or marketing copy

## What Good Guides Look Like

Good guides do four things well:

1. Tell the reader what they need before they start.
2. Show the exact steps in the right order.
3. Explain what the feature does in plain product language.
4. Tell the reader how to verify that setup worked.

Good guides do **not** spend time narrating the reader's motives.

Bad:

- "For teams who want..."
- "When you want..."
- "Without rebuilding X from scratch..."
- "A practical guide for teams who want better..."

Good:

- "Install the package."
- "Create the client."
- "Connect Slack."
- "Verify the webhook signature."
- "Check the installation."

## Default Structure

Most Chatting guides should follow this shape:

1. `Before you start`
2. `Install` or `Connect`
3. `Create` / `Configure`
4. `Add` / `Use` / `What appears`
5. `Check the installation` or `Test the setup`
6. `FAQ`

Not every guide needs every section, but this is the default pattern.

## Guide Types

### 1. Installation Guides

Use this for SDKs, packages, and product setup flows.

Required section order:

1. `Before you start`
2. `Install the package` or `Install the SDK`
3. `Create the client` or `Initialize`
4. `Add the support screen` or `Present the UI`
5. `Check the installation`
6. `FAQ`

Examples:

- `/Users/tina/Code/chatly/src/lib/chatting-ios-sdk-guide.ts`
- `/Users/tina/Code/chatly/src/lib/chatting-react-native-expo-guide.ts`

### 2. Integration Guides

Use this for Slack, Shopify, Zapier, and similar integrations.

Required section order:

1. `Before you start`
2. `Connect <integration>`
3. `What it supports` or `What appears`
4. `Check the installation`
5. `FAQ`

Examples:

- `/Users/tina/Code/chatly/src/lib/chatting-slack-integration-guide.ts`
- `/Users/tina/Code/chatly/src/lib/chatting-shopify-integration-guide.ts`
- `/Users/tina/Code/chatly/src/lib/chatting-zapier-integration-guide.ts`

### 3. Reference Guides

Use this for endpoint docs, payload docs, and structured references.

Required section order:

1. `Overview` or `Before you start`
2. `Authentication` or `Base URL`
3. `Endpoints` / `Actions` / `Events`
4. `Errors`
5. `Sample payloads`

Reference guides do not need a CTA if the page is already purely technical.

Example:

- `/Users/tina/Code/chatly/src/lib/chatting-zapier-api-reference-guide.ts`

### 4. Starter Workflow Guides

Use this for templates, starter Zaps, and "publish these first" content.

Required section order:

1. `Before you start`
2. individual workflow sections
3. `Publish these` or `Share these`

Example:

- `/Users/tina/Code/chatly/src/lib/chatting-zapier-starter-zaps-guide.ts`

### 5. Feature Reference Guides

Use this for shortcuts, command lists, and feature lookup pages.

Required section order:

1. `Before you start`
2. the main reference list
3. any grouped sub-reference sections
4. `Check` or `Open this in product`
5. `FAQ`

Example:

- `/Users/tina/Code/chatly/src/lib/chatting-inbox-shortcuts-guide.ts`

## Metadata Rules

Every guide uses the `GuideArticle` shape in:

- `/Users/tina/Code/chatly/src/lib/guide-article.ts`

Every guide must include:

- `slug`
- `title`
- `excerpt`
- `subtitle`
- `seoTitle`
- `publishedAt`
- `updatedAt`
- `readingTime`
- `image`
- `sections`

Metadata rules:

- `title` should describe the actual task, not just sound good.
- `excerpt` should say what the reader will do.
- `subtitle` should describe the exact scope of the guide.
- `updatedAt` must change when the guide meaningfully changes.
- image alt text should describe the visual clearly, not repeat the title.

## Writing Rules

### 1. Write for action

Prefer:

- "Open `Settings -> Integrations -> Slack` in Chatting"
- "Copy the API key"
- "Install `@usechatting/react-native`"

Avoid:

- "This unlocks powerful flexibility"
- "This is ideal for teams looking to..."

### 2. Name concrete product objects

Use exact nouns:

- `baseURL`
- `siteId`
- `Settings -> Integrations -> Zapier`
- `ChattingConversationScreen`
- `X-Chatting-Signature`

Do not replace these with vague phrases like:

- "your app details"
- "the right endpoint"
- "the proper setup values"

### 3. Explain what the user sees

For integrations and product guides, include the visible result:

- what appears in the inbox
- where alerts show up
- what the user should see after setup

### 4. Include a verification section

Every setup guide should tell the reader how to confirm it worked.

Examples:

- "Send a test message from the device"
- "Confirm the alert appears in Slack"
- "Run a test delivery"
- "Confirm the reply appears in the app"

### 5. Keep FAQ short and practical

FAQ items should answer the next real implementation question.

Good:

- "What should I use for baseURL?"
- "Can we change the Slack channel later?"
- "Do we need the full Shopify URL?"

Bad:

- "Why is this powerful?"
- "Who is this for?"

### 6. Prefer direct language over motive language

Bad:

- "Use Chatting when you want..."
- "This is best for teams who want..."

Good:

- "Chatting adds a support screen to your app."
- "Slack sends new conversation alerts into a channel."
- "Shopify shows order context in the inbox."

### 7. Code examples must be copyable

Every code sample should be:

- syntactically coherent
- internally consistent
- using the published package name or real product path
- free of placeholder drift like old domains or old package names

If a snippet depends on an earlier snippet, say so clearly.

## Section Writing Templates

### Installation Guide Template

~~~~md
## Before you start
- prerequisite
- prerequisite

## Install the package
```bash
install command
```

## Create the client
```ts
client setup
```

## Add the support screen
```tsx
ui setup
```

## Check the installation
1. do the first check
2. do the second check

## FAQ
~~~~

### Integration Guide Template

~~~~md
## Before you start
- account or permission requirement
- one setup decision

## Connect <integration>
1. open the settings page
2. authorize the integration
3. save the connection

## What it supports
- visible result
- visible result

## Check the installation
1. trigger a real test
2. confirm the result in Chatting

## FAQ
~~~~

### Reference Guide Template

~~~~md
## Overview
- base URL
- auth
- success shape

## Authentication
## Endpoints
## Errors
## Sample payloads
~~~~

## What To Avoid

Do not write guides like:

- a blog post with a setup snippet dropped in
- a marketing page with a few commands
- an internal engineering design note
- a feature pitch

Avoid these patterns:

- rhetorical filler
- motive narration
- implementation bragging
- unexplained jargon
- huge context dumps before the first useful step

## Internal Reference Guides

Use these as the current standard for structure and tone:

- `/Users/tina/Code/chatly/src/lib/chatting-ios-sdk-guide.ts`
- `/Users/tina/Code/chatly/src/lib/chatting-ios-sdk-guide-sections.ts`
- `/Users/tina/Code/chatly/src/lib/chatting-react-native-expo-guide.ts`
- `/Users/tina/Code/chatly/src/lib/chatting-react-native-expo-guide-sections.ts`

## External Documentation References

These are good reference points for structure and tone:

- Clerk Expo Quickstart: [https://clerk.com/docs/expo/getting-started/quickstart](https://clerk.com/docs/expo/getting-started/quickstart)
- Expo Notifications: [https://docs.expo.dev/versions/latest/sdk/notifications/](https://docs.expo.dev/versions/latest/sdk/notifications/)
- Intercom iOS Installation: [https://developers.intercom.com/installing-intercom/ios/installation](https://developers.intercom.com/installing-intercom/ios/installation)
- Stripe React Native SDK: [https://docs.stripe.com/sdks/react-native](https://docs.stripe.com/sdks/react-native)
- Slack Quickstart: [https://docs.slack.dev/quickstart/](https://docs.slack.dev/quickstart/)
- GitHub Webhooks docs: [https://docs.github.com/get-started/customizing-your-github-workflow/exploring-integrations/about-webhooks](https://docs.github.com/get-started/customizing-your-github-workflow/exploring-integrations/about-webhooks)
- Zapier app setup examples: [https://help.zapier.com/hc/en-us/articles/8495936547085-How-to-get-started-with-Zendesk-on-Zapier](https://help.zapier.com/hc/en-us/articles/8495936547085-How-to-get-started-with-Zendesk-on-Zapier)

## Rule Of Thumb

If a guide cannot answer these questions in under a minute, it is probably too fluffy:

- What do I need first?
- What do I install or connect?
- What exact values do I use?
- What should I see when it works?
- How do I test that it worked?
