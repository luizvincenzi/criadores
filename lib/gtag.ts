// Google Analytics tracking utilities

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Eventos específicos para o crIAdores
export const trackBlogView = (postTitle: string, postSlug: string) => {
  event({
    action: 'view_blog_post',
    category: 'Blog',
    label: `${postTitle} (${postSlug})`,
  });
};

export const trackCampaignView = (businessName: string, campaignMonth: string) => {
  event({
    action: 'view_campaign',
    category: 'Campaign',
    label: `${businessName} - ${campaignMonth}`,
  });
};

export const trackCreatorView = (creatorName: string, creatorSlug: string) => {
  event({
    action: 'view_creator',
    category: 'Creator',
    label: `${creatorName} (${creatorSlug})`,
  });
};

export const trackCTAClick = (ctaType: string, location: string) => {
  event({
    action: 'click_cta',
    category: 'CTA',
    label: `${ctaType} - ${location}`,
  });
};

export const trackNewsletterSignup = (location: string) => {
  event({
    action: 'newsletter_signup',
    category: 'Newsletter',
    label: location,
  });
};

export const trackSocialShare = (platform: string, contentType: string, contentTitle: string) => {
  event({
    action: 'share',
    category: 'Social',
    label: `${platform} - ${contentType}: ${contentTitle}`,
  });
};

export const trackWhatsAppClick = (context: string) => {
  event({
    action: 'whatsapp_click',
    category: 'Contact',
    label: context,
  });
};

export const trackFormSubmission = (formType: string, success: boolean) => {
  event({
    action: success ? 'form_submit_success' : 'form_submit_error',
    category: 'Form',
    label: formType,
  });
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: any
    ) => void;
  }
}
