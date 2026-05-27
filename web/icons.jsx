/* Inline SVG icons in the spirit of Lucide — original drawings. 24x24, 1.6 stroke. */
const Ic = ({ children, size = 16, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

const IconPlus      = (p) => <Ic {...p}><path d="M12 5v14M5 12h14" /></Ic>;
const IconMinus     = (p) => <Ic {...p}><path d="M5 12h14" /></Ic>;
const IconX         = (p) => <Ic {...p}><path d="M6 6l12 12M18 6L6 18" /></Ic>;
const IconCheck     = (p) => <Ic {...p}><path d="M4 12.5l5 5L20 6.5" /></Ic>;
const IconChevR     = (p) => <Ic {...p}><path d="M9 6l6 6-6 6" /></Ic>;
const IconChevD     = (p) => <Ic {...p}><path d="M6 9l6 6 6-6" /></Ic>;
const IconArrowR    = (p) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Ic>;
const IconArrowL    = (p) => <Ic {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Ic>;
const IconSearch    = (p) => <Ic {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Ic>;
const IconFilter    = (p) => <Ic {...p}><path d="M4 5h16l-6 8v6l-4-2v-4z" /></Ic>;
const IconMapPin    = (p) => <Ic {...p}><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></Ic>;
const IconUser      = (p) => <Ic {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></Ic>;
const IconBriefcase = (p) => <Ic {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></Ic>;
const IconBook      = (p) => <Ic {...p}><path d="M4 4h11a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><path d="M4 4v12a4 4 0 0 0 4 4" /></Ic>;
const IconSparkles  = (p) => <Ic {...p}><path d="M12 3l1.6 4.2L18 9l-4.4 1.8L12 15l-1.6-4.2L6 9l4.4-1.8z" /><path d="M19 14l.8 2 2 .8-2 .8L19 20l-.8-2-2-.8 2-.8z" /></Ic>;
const IconLink      = (p) => <Ic {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7L12 6.3" /><path d="M14 10a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7L12 17.7" /></Ic>;
const IconMail      = (p) => <Ic {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Ic>;
const IconGlobe     = (p) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" /></Ic>;
const IconGithub    = (p) => <Ic {...p}><path d="M9 19c-4 1.2-4-2-6-2.5M15 21v-3.2c0-.8-.1-1.7-.7-2.3 2.7-.3 5.5-1.4 5.5-6.1 0-1.2-.5-2.4-1.3-3.3.2-.7.5-2-.2-3.3 0 0-1.1-.3-3.5 1.3a12 12 0 0 0-6.4 0C5.8 0 4.7.3 4.7.3c-.7 1.4-.4 2.6-.2 3.3A4.8 4.8 0 0 0 3.2 7c0 4.6 2.8 5.8 5.5 6.1-.4.4-.6.9-.7 1.4-.7.3-2.5.9-3.5-1A3 3 0 0 0 2 13" /></Ic>;
const IconLinkedin  = (p) => <Ic {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></Ic>;
const IconTwitter   = (p) => <Ic {...p}><path d="M4 4l7 9.2L4.5 20H7l5.5-5.8L17 20h3l-7.4-9.7L19.5 4H17l-5 5.4L8 4z" /></Ic>;
const IconBlog      = (p) => <Ic {...p}><path d="M5 5h11l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /><path d="M8 11h7M8 15h7M8 7h4" /></Ic>;
const IconEdit      = (p) => <Ic {...p}><path d="M14 4l6 6L9 21H3v-6z" /><path d="M13 5l6 6" /></Ic>;
const IconTrash     = (p) => <Ic {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6" /></Ic>;
const IconGripV     = (p) => <Ic {...p}><circle cx="9" cy="6"  r=".9" /><circle cx="9" cy="12" r=".9" /><circle cx="9" cy="18" r=".9" /><circle cx="15" cy="6"  r=".9" /><circle cx="15" cy="12" r=".9" /><circle cx="15" cy="18" r=".9" /></Ic>;
const IconPrinter   = (p) => <Ic {...p}><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5a1 1 0 0 1-1 1h-2" /><rect x="6" y="14" width="12" height="7" rx="1" /></Ic>;
const IconEye       = (p) => <Ic {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Ic>;
const IconSun       = (p) => <Ic {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></Ic>;
const IconMoon      = (p) => <Ic {...p}><path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a6.5 6.5 0 0 0 10.5 10.5z" /></Ic>;
const IconCalendar  = (p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Ic>;
const IconImage     = (p) => <Ic {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M3 17l5-5 4 4 3-3 6 6" /></Ic>;
const IconCheckCircle = (p) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></Ic>;
const IconAlert     = (p) => <Ic {...p}><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 18v.01" /></Ic>;
const IconSliders   = (p) => <Ic {...p}><path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="13" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></Ic>;
const IconSave      = (p) => <Ic {...p}><path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M7 3v5h8V3M7 15h10v6H7z" /></Ic>;
const IconStar      = (p) => <Ic {...p}><path d="M12 3l2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.8 6.4 20.3l1.1-6.3L2.9 9.6l6.3-.9z" /></Ic>;
const IconLogo      = (p) => <Ic {...p}><path d="M5 4h9l5 5v11H5z" /><path d="M8 12h8M8 16h5" /></Ic>;
const IconFileText  = (p) => <Ic {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></Ic>;

const CONTACT_TYPES = ['email', 'website', 'github', 'linkedin', 'twitter', 'blog'];
const CONTACT_ICONS = {
  email: IconMail,
  website: IconGlobe,
  github: IconGithub,
  linkedin: IconLinkedin,
  twitter: IconTwitter,
  blog: IconBlog,
};
const CONTACT_LABELS = {
  email: 'Email', website: 'Website', github: 'GitHub',
  linkedin: 'LinkedIn', twitter: 'Twitter', blog: 'Blog',
};
const CONTACT_PLACEHOLDER = {
  email: 'you@domain.com',
  website: 'https://yoursite.com',
  github: 'https://github.com/username',
  linkedin: 'https://linkedin.com/in/username',
  twitter: 'https://twitter.com/username',
  blog: 'https://blog.domain.com',
};

Object.assign(window, {
  Ic, IconPlus, IconMinus, IconX, IconCheck, IconChevR, IconChevD, IconArrowR, IconArrowL,
  IconSearch, IconFilter, IconMapPin, IconUser, IconBriefcase, IconBook, IconSparkles,
  IconLink, IconMail, IconGlobe, IconGithub, IconLinkedin, IconTwitter, IconBlog,
  IconEdit, IconTrash, IconGripV, IconPrinter, IconEye, IconSun, IconMoon, IconCalendar,
  IconImage, IconCheckCircle, IconAlert, IconSliders, IconSave, IconStar, IconLogo, IconFileText,
  CONTACT_TYPES, CONTACT_ICONS, CONTACT_LABELS, CONTACT_PLACEHOLDER,
});
