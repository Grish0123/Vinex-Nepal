import { useEffect, useRef, type RefObject, type WheelEvent } from 'react';
import { motion, useMotionTemplate, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { FiAward, FiHeadphones, FiTag, FiTruck } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { FooterSection } from '../../components/FooterSection';
import type { AboutContentSettings } from '../../lib/api';
import styles from './AboutPage.module.scss';

type TeamMemberPanelProps = {
  imageSide: 'left' | 'right';
  name: string;
  titles: string[];
  message: string;
  imageLabel: string;
  imageSrc: string;
  y: MotionValue<number> | MotionValue<string>;
};

const heroReasons: Array<{
  title: string;
  text: string;
  Icon: IconType;
}> = [
  {
    title: 'Carefully Selected',
    text: 'We handpick quality products you can rely on.',
    Icon: FiAward,
  },
  {
    title: 'Fair Prices',
    text: 'Great value without compromising on quality.',
    Icon: FiTag,
  },
  {
    title: 'Fast & Reliable',
    text: 'Quick delivery across Nepal, right to your door.',
    Icon: FiTruck,
  },
  {
    title: 'Local Support',
    text: 'We are here to help, before and after purchase.',
    Icon: FiHeadphones,
  },
];

function getSocialIcon(label: string): IconType {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('instagram')) {
    return FaInstagram;
  }

  if (normalizedLabel.includes('tiktok') || normalizedLabel.includes('tik tok')) {
    return FaTiktok;
  }

  return FaFacebookF;
}

function TeamMemberPanel({
  imageSide,
  name,
  titles,
  message,
  imageLabel,
  imageSrc,
  y,
}: TeamMemberPanelProps) {
  const imageSlot = (
    <div
      className={`${styles.memberImageSlot} ${name === 'Grish Katwal' ? styles.grishImageSlot : styles.himalayaImageSlot}`}
    >
      <img src={imageSrc} alt={imageLabel} />
    </div>
  );
  const copy = (
    <article className={styles.memberCopy}>
      <div className={styles.memberTitlePills} aria-label={`${name} titles`}>
        {titles.map((title) => (
          <span key={title}>{title}</span>
        ))}
      </div>
      <h2>{name}</h2>
      <span className={styles.memberMessage}>{message}</span>
    </article>
  );

  return (
    <motion.section
      className={styles.teamPanel}
      style={{ y }}
      aria-label={`${name}, ${titles.join(', ')}`}
    >
      {imageSide === 'left' ? imageSlot : copy}
      {imageSide === 'left' ? copy : imageSlot}
    </motion.section>
  );
}

function ImageStorySection({ images }: { images: string[] }) {
  return (
    <section className={styles.imageStory} aria-label="Vinex Nepal product story">
      <div className={styles.imageGrid}>
        <figure className={styles.tallImage}>
          <img
            src={images[0] ?? '/images/About Us Images/1st image.png'}
            alt="Vinex Nepal about story image one"
          />
        </figure>
        <figure className={styles.shortImage}>
          <img
            src={images[1] ?? '/images/About Us Images/2nd image.png'}
            alt="Vinex Nepal about story image two"
          />
        </figure>
        <figure className={styles.midImage}>
          <img
            src={images[2] ?? '/images/About Us Images/3rd image.png'}
            alt="Vinex Nepal about story image three"
          />
        </figure>
      </div>
    </section>
  );
}

function ImageTeamStackSection({
  containerRef,
  aboutContent,
}: {
  containerRef: RefObject<HTMLElement>;
  aboutContent: AboutContentSettings;
}) {
  const stackRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: stackRef,
    offset: ['start start', 'end end'],
  });
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 24,
    mass: 0.38,
    restDelta: 0.0008,
  });
  const ceoYOffset = useTransform(smoothScrollYProgress, [0.08, 0.44, 0.56], [100, 0, 0]);
  const edYOffset = useTransform(smoothScrollYProgress, [0.64, 0.88, 1], [100, 0, 0]);
  const ceoY = useMotionTemplate`${ceoYOffset}vh`;
  const edY = useMotionTemplate`${edYOffset}vh`;

  return (
    <section
      ref={stackRef}
      className={styles.storyStack}
      aria-label="Vinex Nepal products and leadership"
    >
      <div className={styles.storySticky}>
        <ImageStorySection images={aboutContent.storyImages} />
        <TeamMemberPanel
          imageSide="left"
          name={aboutContent.teamMembers[0]?.name ?? 'Grish Katwal'}
          titles={aboutContent.teamMembers[0]?.titles ?? ['Founder', 'CEO', 'Managing Director']}
          message={aboutContent.teamMembers[0]?.message ?? ''}
          imageLabel={aboutContent.teamMembers[0]?.imageLabel ?? aboutContent.teamMembers[0]?.name ?? 'Grish Katwal'}
          imageSrc={aboutContent.teamMembers[0]?.imageSrc ?? '/images/Team Images/Grish Katwal.jpg'}
          y={ceoY}
        />
        <TeamMemberPanel
          imageSide="right"
          name={aboutContent.teamMembers[1]?.name ?? 'Himalaya Jung Katwal'}
          titles={aboutContent.teamMembers[1]?.titles ?? ['Cofounder', 'Executive Director']}
          message={aboutContent.teamMembers[1]?.message ?? ''}
          imageLabel={aboutContent.teamMembers[1]?.imageLabel ?? aboutContent.teamMembers[1]?.name ?? 'Himalaya Jung Katwal'}
          imageSrc={aboutContent.teamMembers[1]?.imageSrc ?? '/images/Team Images/Himalaya Katwal.jpg'}
          y={edY}
        />
      </div>
    </section>
  );
}

function StorySection({ aboutContent }: { aboutContent: AboutContentSettings }) {
  return (
    <section className={styles.storySection} aria-labelledby="about-story-title">
      <div className={styles.storyLogo}>
        <img src="/images/brand/VinexLogo.png" alt="Vinex Nepal" />
      </div>
      <div className={styles.storyContent}>
        <h2 id="about-story-title">{aboutContent.storyHeadline}</h2>
        <div className={styles.storyColumns}>
          {aboutContent.storyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryStackSection({
  containerRef,
  aboutContent,
}: {
  containerRef: RefObject<HTMLElement>;
  aboutContent: AboutContentSettings;
}) {
  const galleryRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: galleryRef,
    offset: ['start start', 'end end'],
  });
  const firstY = useTransform(scrollYProgress, [0.08, 0.28], ['0vh', '-120vh']);
  const secondY = useTransform(scrollYProgress, [0.3, 0.5], ['0vh', '-120vh']);
  const thirdY = useTransform(scrollYProgress, [0.52, 0.72], ['0vh', '-120vh']);
  const fourthY = useTransform(scrollYProgress, [0.74, 0.94], ['0vh', '-120vh']);
  const springConfig = { stiffness: 140, damping: 30, mass: 0.6 };
  const springOne = useSpring(firstY, springConfig);
  const springTwo = useSpring(secondY, springConfig);
  const springThree = useSpring(thirdY, springConfig);
  const springFour = useSpring(fourthY, springConfig);

  const galleryImages = [
    {
      src: aboutContent.galleryImages[0] ?? '/images/Gallery Images/1st.png',
      alt: 'Vinex Nepal gallery image one',
      className: styles.galleryImageOne,
      y: springOne,
    },
    {
      src: aboutContent.galleryImages[1] ?? '/images/Gallery Images/2nd.png',
      alt: 'Vinex Nepal gallery image two',
      className: styles.galleryImageTwo,
      y: springTwo,
    },
    {
      src: aboutContent.galleryImages[2] ?? '/images/Gallery Images/3rd.png',
      alt: 'Vinex Nepal gallery image three',
      className: styles.galleryImageThree,
      y: springThree,
    },
    {
      src: aboutContent.galleryImages[3] ?? '/images/Gallery Images/4th.png',
      alt: 'Vinex Nepal gallery image four',
      className: styles.galleryImageFour,
      y: springFour,
    },
  ];

  return (
    <section ref={galleryRef} className={styles.galleryStack} aria-label="Vinex Nepal gallery">
      <div className={styles.gallerySticky}>
        <div className={styles.galleryReveal}>
          <img src={aboutContent.galleryLogo} alt="Vinex Nepal" />
          <p>{aboutContent.galleryText}</p>
          <nav aria-label="Vinex Nepal social links">
            {aboutContent.socialLinks.map((link) => {
              const SocialIcon = getSocialIcon(link.label);

              return (
                <a href={link.url} target="_blank" rel="noreferrer" aria-label={link.label} key={`${link.label}-${link.url}`}>
                  <SocialIcon aria-hidden="true" focusable="false" />
                </a>
              );
            })}
          </nav>
        </div>
        {galleryImages.map((image, index) => (
          <motion.figure
            className={`${styles.galleryImage} ${image.className}`}
            style={{ y: image.y, zIndex: galleryImages.length - index }}
            key={image.src}
          >
            <img src={image.src} alt={image.alt} />
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

type AboutPageProps = {
  aboutContent: AboutContentSettings;
  heroImages?: string[];
  onFooterVisibilityChange?: (isVisible: boolean) => void;
};

export function AboutPage({ aboutContent, onFooterVisibilityChange }: AboutPageProps) {
  const pageRef = useRef<HTMLElement | null>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !onFooterVisibilityChange) {
      return;
    }

    const updateFooterState = () => {
      const footer = page.querySelector<HTMLElement>('.site-footer-home');
      const footerTop = footer ? footer.offsetTop : Number.POSITIVE_INFINITY;
      const isScrollingDown = page.scrollTop > lastScrollTop.current;
      const footerIsReached = page.scrollTop >= footerTop - 90;

      onFooterVisibilityChange(footerIsReached && isScrollingDown);
      lastScrollTop.current = page.scrollTop;
    };

    updateFooterState();
    page.addEventListener('scroll', updateFooterState, { passive: true });
    window.addEventListener('resize', updateFooterState);

    return () => {
      page.removeEventListener('scroll', updateFooterState);
      window.removeEventListener('resize', updateFooterState);
      onFooterVisibilityChange(false);
    };
  }, [onFooterVisibilityChange]);

  const snapFromHero = (event: WheelEvent<HTMLElement>) => {
    const page = pageRef.current;
    if (!page || event.deltaY <= 0 || page.scrollTop > 8) {
      return;
    }

    event.preventDefault();
    page.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <main ref={pageRef} className={styles.page} onWheel={snapFromHero}>
      <motion.section
        className={styles.hero}
        aria-labelledby="about-title"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className={styles.heroReasons}
          aria-labelledby="about-reasons-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className={styles.heroIntro}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.64, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>Why choose us</span>
            <h1 id="about-reasons-title">
              Built on <em>trust.</em>
              <br />
              Chosen for <em>quality.</em>
            </h1>
          </motion.div>
          <div className={styles.reasonGrid}>
            {heroReasons.map(({ title, text, Icon }, index) => (
              <motion.article
                className={styles.reasonItem}
                key={title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.58, delay: 0.24 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon aria-hidden="true" focusable="false" />
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
        <motion.div
          className={styles.meta}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{aboutContent.heroMetaLeft}</span>
          <span>{aboutContent.heroMetaRight}</span>
        </motion.div>
        <motion.h2
          id="about-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
        >
          {aboutContent.heroTitle}
        </motion.h2>
      </motion.section>

      <ImageTeamStackSection containerRef={pageRef} aboutContent={aboutContent} />
      <StorySection aboutContent={aboutContent} />
      <GalleryStackSection containerRef={pageRef} aboutContent={aboutContent} />
      <FooterSection showWelcome={false} showProductRequest={true} />
    </main>
  );
}
