# Chatting Distribution Playbook

**Finding Your First 1,000 Users**

Live chat for teams who care. $29/mo. 5-minute setup.

---

## Table of Contents

1. [Channel Overview](#channel-overview)
2. [Channel 1: Shopify App Store](#channel-1-shopify-app-store)
3. [Channel 2: Product Hunt](#channel-2-product-hunt)
4. [Channel 3: Facebook Groups](#channel-3-facebook-groups)
5. [Channel 4: LinkedIn Outreach](#channel-4-linkedin-outreach)
6. [Channel 5: G2/Capterra Review Sites](#channel-5-g2capterra-review-sites)

---

## Channel Overview

| Channel | Audience | Effort | Timeline | Expected Users |
|---------|----------|--------|----------|----------------|
| Shopify App Store | E-commerce founders | High (dev work) | 4-7 weeks | 200-500/month |
| Product Hunt | SaaS founders, early adopters | Medium | 1-2 weeks prep | 500-2,000 on launch |
| Facebook Groups | DTC/Shopify owners, agencies | Low | Ongoing | 50-100/month |
| LinkedIn | Founders, CS leads | Medium | Ongoing | 30-50/month |
| G2/Capterra | Tool evaluators, "refugees" | Medium | Ongoing | 50-100/month |

---

## Channel 1: Shopify App Store

**Why it works:** E-commerce founders actively search for live chat tools. They're already in buying mode. Shopify App Store is where they go first.

### Technical Requirements

| Requirement | What Chatting Needs |
|-------------|-------------------|
| **GraphQL Admin API** | All new public apps must use GraphQL only (as of April 2025) |
| **Shopify App Bridge** | Required for embedded admin apps |
| **Polaris Design System** | Settings panel must follow Shopify's design system |
| **Theme App Extension** | Widget must install via theme extension (no code injection) |
| **GDPR Webhooks** | Must handle Customer Data Request, Customer Redact, Shop Redact |
| **Shopify Billing API** | Required for paid apps — no Stripe/PayPal allowed |
| **Performance** | Cannot reduce Lighthouse score by more than 10 points |
| **Response Time** | P95 < 500ms with < 0.1% failure rate |

### Build Checklist

- [ ] Create Shopify Partner account
- [ ] Build GraphQL Admin API integration
- [ ] Implement OAuth flow with Shopify
- [ ] Build embedded admin app with Polaris components
- [ ] Create Theme App Extension for widget
- [ ] Implement Shopify Billing API ($29/mo subscription)
- [ ] Add GDPR webhook endpoints
- [ ] Test performance impact on store
- [ ] Record Loom walkthrough for reviewers

### App Listing Assets

| Element | Requirements |
|---------|--------------|
| **App Name** | "Chatting - Live Chat" (brand first, max 40 chars) |
| **Tagline** | "Talk to visitors before they leave" (max 60 chars) |
| **Icon** | Bold colors, simple design, no text |
| **Screenshots** | 4-8 showing widget, inbox, visitor tracking |
| **Video** | 30-60 second demo (clean, simple, animated) |
| **Description** | Clear, benefit-focused, 260 char summary |

### App Store Listing Copy

**Tagline:**
> Talk to visitors before they bounce

**Short Description (260 chars):**
> Live chat built for small Shopify teams. See who's on your site, answer questions in real-time, and convert more visitors. $29/mo flat — no per-seat pricing. Installs in 5 minutes.

**Key Benefits:**
1. See visitors browsing your store in real-time
2. Answer questions before they abandon cart
3. Works on all devices, all themes
4. One price, unlimited conversations

### Getting to "Built for Shopify" Badge

After launch, work toward the premium badge:

| Requirement | Threshold |
|-------------|-----------|
| Net installs | 50+ from paid shops |
| Reviews | Minimum 5 reviews |
| Rating | Meet minimum threshold |
| Performance | <10 point Lighthouse drop |

### Timeline

| Phase | Duration |
|-------|----------|
| Build integration | 2-4 weeks |
| Prepare listing assets | 1 week |
| Submit for review | 1-2 weeks |
| **Total** | **4-7 weeks** |

---

## Channel 2: Product Hunt / Indie Hackers

**Why it works:** Product Hunt users are early adopters who love discovering new tools. Indie Hackers is a community of builders who need exactly what Chatting offers.

### Product Hunt Strategy

#### Pre-Launch (2-4 weeks before)

**Build your audience first:**
- Product Hunt is an amplifier, not a traffic machine
- Need minimum 400 supporters before launching
- Engage in PH community: comment, upvote, build relationships

**Create a Ship page:**
- Collect email subscribers pre-launch
- Offer early-bird perk: "Free onboarding call with founder"
- Target: 500+ subscribers before launch day

**Prepare assets:**

| Asset | Specs |
|-------|-------|
| Tagline | Under 60 chars, benefit-driven |
| Description | Under 260 chars, clear value prop |
| Logo | Animated GIF logos increase CTR |
| Screenshots/GIFs | 3-5 showing key features |
| Demo Video | 30 seconds, problem → solution |
| Maker Story | Personal, authentic, founder-led |

#### Launch Day Execution

**Timing:**
- Schedule for 12:01 AM Pacific Time
- Launch Tuesday-Thursday (lower competition)
- Avoid major tech news days

**First Comment (Maker Intro):**
```
Hey PH 👋

I built Chatting because I was tired of watching potential customers leave my site with unanswered questions.

70% of carts get abandoned. Most of the time, it's a simple question that went unanswered.

Chatting puts a chat widget on your site that connects visitors to your team instantly:
- See who's browsing in real-time
- < 100ms message latency
- $29/mo flat (no per-seat pricing)
- 5-minute setup

We're live today with a special offer for the PH community: [your offer]

Would love your feedback — what features would make this useful for you?
```

**Day-of Checklist:**
- [ ] Schedule launch for 12:01 AM PT
- [ ] First comment ready to post immediately
- [ ] Response SLA: < 10 minutes for all comments
- [ ] DM pre-committed supporters to comment
- [ ] Social posts scheduled (Twitter, LinkedIn)
- [ ] Landing page optimized for email capture
- [ ] Special PH offer ready

**Critical Success Factors:**
- Respond to EVERY comment within 10 minutes
- Share transparent metrics ("50 signups in 2 hours!")
- Thank supporters publicly
- Don't ask strangers for upvotes (against rules)
- Comments carry more weight than upvotes

#### Post-Launch

- Thank everyone who supported
- Follow up with signups within 24 hours
- Email all new leads to book demos
- Share results on social media
- Add PH badge to website

### Expected Results

| Metric | Target |
|--------|--------|
| PH visitors | 2,000-10,000 |
| Email signups | 500-1,000 |
| Trial signups | 100-300 |
| Conversions | 15-50 |

---

## Channel 3: Facebook Groups

**Why it works:** DTC founders and agency owners hang out in Facebook groups. They ask for recommendations constantly. Being present when someone asks "What live chat tool should I use?" is gold.

### Target Groups

**Shopify & E-commerce (Primary)**

| Group | Members | Focus |
|-------|---------|-------|
| Shopify Entrepreneurs | 100K+ | General Shopify tips, advice, motivation |
| Ecommerce Elites Mastermind | 106K+ | Shopify, Facebook ads, digital marketing |
| Ecommerce Entrepreneurs | 50K+ | SEO, social strategy, ecommerce best practices |
| Ecom Queens Community | 50K+ | Female ecommerce entrepreneurs, Etsy, Shopify |
| The Social Sales Girls | 13K+ | Shopify store owners scaling their business |
| Shopify Newbies | 100K+ | Beginners getting started on Shopify |

**Agency & Web Design**

| Group | Members | Focus |
|-------|---------|-------|
| Digital Agency Owners (DAO) | 5K+ | WordPress agencies, pricing, growth |
| Digital Mavericks | 6.5K+ | Agency growth, WordPress, scaling |
| Grow Your Web Design Business | 5.5K+ | Processes, tools, getting clients |
| The Admin Bar | 5.8K+ | WordPress industry professionals |
| Supercharge Your Web Agency | 3K+ | Web design, SEO, digital marketing |
| Marketing Agency Owners | 10K+ | Digital marketing agencies |

**Marketing & Growth**

| Group | Members | Focus |
|-------|---------|-------|
| The Daily Carnage | 20K+ | Marketing news, tools, tips |
| Marketing Solved | 15K+ | Digital marketing, coaching |
| Facebook Ad Buyers | 100K+ | Facebook advertising |
| Digital Marketing Questions & Answers | 50K+ | SEO, analytics, conversion |

### Engagement Strategy

**Phase 1: Build credibility (Week 1-4)**
- Join 5-10 relevant groups
- Comment helpfully on 3-5 posts per day
- Share expertise without selling
- Answer questions about customer support, live chat, conversion

**Phase 2: Soft mentions (Week 5-8)**
- When someone asks for recommendations, mention Chatting naturally
- Share case studies and results (not product pitches)
- Respond to "What tool do you use for X?" threads

**Phase 3: Value posts (Week 9+)**
- Share insights: "How we reduced cart abandonment by 40%"
- Ask questions: "What's your biggest customer support challenge?"
- Post free resources: templates, guides, checklists

### Response Templates

**When someone asks for live chat recommendations:**
```
I'd look at a few options depending on your budget:

- If you're a small team and price-conscious, check out Chatting ($29/mo flat, no per-seat pricing)
- If you need AI bots and email marketing, Intercom (but $300+/mo)
- If you want free, Crisp has a decent free tier

What's your main use case — support or sales?
```

**When someone complains about Intercom pricing:**
```
Yeah, Intercom's pricing has gotten crazy. We switched to Chatting last month — $29/mo for 5 team members, unlimited conversations.

It doesn't have all the bells and whistles (no email marketing, no product tours) but if you just need solid live chat, it does the job.

Happy to share more if helpful.
```

### Rules to Follow

- ❌ Never post promotional links without context
- ❌ Never DM people unsolicited
- ❌ Never copy-paste the same comment
- ✅ Be genuinely helpful first
- ✅ Mention Chatting only when relevant
- ✅ Share real results and experiences

### Expected Results

| Metric | Target |
|--------|--------|
| Weekly engagements | 15-20 comments |
| Recommendation threads | 3-5 per week |
| Profile clicks | 50-100/month |
| Website visits | 30-50/month |
| Signups | 10-20/month |

---

## Channel 4: G2/Capterra Review Sites

**Why it works:** These are high-intent buyers actively comparing tools. People leaving negative reviews on Intercom/Zendesk are your perfect audience.

### Platform Strategy

| Platform | Audience | Strategy |
|----------|----------|----------|
| **Capterra** | SMBs globally, highest traffic | List in "Live Chat Software" category, run ads |
| **G2** | Startups, US-focused, higher perceived quality | Focus on reviews and badges |
| **TrustRadius** | More technical audience | Secondary priority |

### Getting Listed

**Capterra:**
1. Create vendor account at vendors.capterra.com
2. Complete full profile with all features
3. Upload screenshots, videos
4. Set up lead capture

**G2:**
1. Claim your profile at sell.g2.com
2. Complete profile with positioning
3. Request reviews from customers

### Profile Optimization

**Key elements:**
- Clear category selection: "Live Chat Software"
- Complete feature list (match Capterra's filter options)
- High-quality screenshots
- Demo video
- Pricing transparency

**Positioning:**
```
Chatting is live chat built specifically for small teams. Unlike enterprise tools that charge per seat and require weeks of setup, Chatting installs in 5 minutes and costs $29/mo flat — no matter how many team members you have.

Best for: Small businesses, e-commerce stores, SaaS startups with 2-20 employees who want real-time customer conversations without enterprise complexity.
```

### Mining Competitor Reviews

**Process:**

1. **Find negative Intercom/Zendesk reviews** (1-3 stars)
2. **Extract common complaints:**
   - "Too expensive" / "Pricing keeps increasing"
   - "Using 10% of features"
   - "Per-seat pricing is punishing"
   - "Too complex to set up"

3. **Create comparison content:**
   - Blog: "7 Intercom Alternatives That Won't Break Your Budget"
   - Landing page: usechatting.com/vs/intercom
   - Ads targeting "[competitor] alternative" keywords

4. **Build battlecards for sales:**
   - Weakness in customer's words (direct quotes from reviews)
   - Chatting's strength in that area
   - Discovery question to surface the pain

### Advertising on Capterra

**Budget:** Start with $500/month test

**Targeting:**
- Category: Live Chat Software
- Adjacent categories: Help Desk, Customer Support
- Comparison pages: "Intercom alternatives"

**Bidding strategy:**
- Bid higher on comparison pages
- Bid lower on broad category pages
- Track cost per lead closely

### Getting Reviews

**When to ask:**
- After positive CSAT feedback
- After successful onboarding (day 30)
- After feature request is shipped
- After renewal

**How to ask:**
```
Hey {first_name},

Thanks for your kind words about Chatting! Would you mind taking 2 minutes to share your experience on G2/Capterra?

It really helps other small teams discover us when they're looking for an alternative to the expensive enterprise tools.

Here's the direct link: [link]

No pressure at all — just grateful for your support either way.
```

**Incentive:** G2 and Capterra allow $10-40 gift cards for reviews (disclose this)

### Expected Results

| Metric | Target |
|--------|--------|
| Reviews (first 6 months) | 25-50 |
| Average rating | 4.5+ stars |
| Monthly profile views | 500-1,000 |
| Lead captures | 20-50/month |
| Conversions | 10-20/month |

---

*Chatting — Live chat for teams who care.*
