import { useEffect, useRef, type RefObject, type WheelEvent } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
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
      <span className={styles.memberMessage}>{message}</span>
      <h2>{name}</h2>
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
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const ceoYRaw = useTransform(scrollYProgress, [0.1, 0.4], [vh, 0]);
  const edYRaw = useTransform(scrollYProgress, [0.54, 0.9], ['100vh', '0vh']);
  const springConfig = { stiffness: 260, damping: 32, mass: 0.4 };
  const ceoY = useSpring(ceoYRaw, springConfig);
  const edY = useSpring(edYRaw, springConfig);

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
            {aboutContent.socialLinks.map((link) => (
              <a href={link.url} target="_blank" rel="noreferrer" key={`${link.label}-${link.url}`}>
                {link.label}
              </a>
            ))}
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
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.meta}>
          <span>{aboutContent.heroMetaLeft}</span>
          <span>{aboutContent.heroMetaRight}</span>
        </div>
        <h2 id="about-title">{aboutContent.heroTitle}</h2>
      </section>

      <ImageTeamStackSection containerRef={pageRef} aboutContent={aboutContent} />
      <StorySection aboutContent={aboutContent} />
      <GalleryStackSection containerRef={pageRef} aboutContent={aboutContent} />
      <FooterSection showWelcome={false} showProductRequest={true} />
    </main>
  );
}
