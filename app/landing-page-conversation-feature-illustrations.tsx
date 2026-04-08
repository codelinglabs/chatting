import { LandingWhatItDoesInboxPanel } from "./landing-page-what-it-does-inbox-panel";
import { LandingWhatItDoesWidgetPanel } from "./landing-page-what-it-does-widget-panel";

export function InboxFeatureIllustration() {
  return <LandingWhatItDoesInboxPanel />;
}

export function ProactiveMessagesFeatureIllustration() {
  return <LandingWhatItDoesWidgetPanel lifted={false} />;
}
