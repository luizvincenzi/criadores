// Google Analytics and Google Tag Manager tracking utilities

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_location: url,
      });
    }
  } catch (error) {
    // Silently handle tracking errors
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Analytics pageview tracking failed:', error);
    }
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
  try {
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  } catch (error) {
    // Silently handle tracking errors
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Analytics event tracking failed:', error);
    }
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

// Google Tag Manager specific functions
export const gtmPush = (data: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(data);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('GTM dataLayer push failed:', error);
    }
  }
};

// Enhanced event tracking for GTM
export const gtmEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  gtmPush({
    event: eventName,
    ...parameters
  });
};

// ============================================================
// CHATBOT TRACKING (GA4 + GTM)
// ============================================================

export const trackChatbotStep = (source: string, stepId: string, stepNumber: number) => {
  event({
    action: 'chatbot_step_completed',
    category: 'Chatbot',
    label: `${source} - ${stepId} (step ${stepNumber})`,
    value: stepNumber,
  });
  gtmEvent('chatbot_step', {
    chatbot_source: source,
    step_id: stepId,
    step_number: stepNumber,
  });
};

export const trackChatbotConversion = (source: string, userType: string) => {
  event({
    action: 'chatbot_conversion',
    category: 'Chatbot',
    label: `${source} - ${userType}`,
  });
  gtmEvent('chatbot_conversion', {
    chatbot_source: source,
    user_type: userType,
  });
};

export const trackChatbotAbandonment = (source: string, lastStepId: string, stepNumber: number) => {
  event({
    action: 'chatbot_abandonment',
    category: 'Chatbot',
    label: `${source} - abandoned at ${lastStepId} (step ${stepNumber})`,
    value: stepNumber,
  });
  gtmEvent('chatbot_abandonment', {
    chatbot_source: source,
    last_step_id: lastStepId,
    step_number: stepNumber,
  });
};

// Declare gtag function and dataLayer for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}
