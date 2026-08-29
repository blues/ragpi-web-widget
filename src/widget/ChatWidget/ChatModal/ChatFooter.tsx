// reCAPTCHA attribution. The badge is hidden globally (see index.css), which
// Google permits only if the reCAPTCHA branding stays visible in the user flow:
// https://developers.google.com/recaptcha/docs/faq. Google's prescribed text is
// "This site is protected by reCAPTCHA." -- scoped to "chat" here because
// reCAPTCHA only loads when the panel opens and only guards the send action, so
// claiming site-wide protection would overstate it. The branding itself, which
// is what the FAQ actually requires, is unchanged. No links are required: the
// FAQ's snippet is plain text, and the Privacy/Terms links belong in the host
// site's privacy policy rather than here.
export const ChatFooter = () => {
  return (
    <p className="text-xs text-gray-400 text-center pb-1">
      This chat is protected by reCAPTCHA.
    </p>
  );
};

export default ChatFooter;
