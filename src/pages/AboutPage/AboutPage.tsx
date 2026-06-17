import { useEffect, useRef, type RefObject, type WheelEvent } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { FooterSection } from '../../components/FooterSection';
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

function ImageStorySection() {
  return (
    <section className={styles.imageStory} aria-label="Vinex Nepal product story">
      <div className={styles.imageGrid}>
        <figure className={styles.tallImage}>
          <img
            src="/images/About Us Images/1st image.png"
            alt="Vinex Nepal about story image one"
          />
        </figure>
        <figure className={styles.shortImage}>
          <img
            src="/images/About Us Images/2nd image.png"
            alt="Vinex Nepal about story image two"
          />
        </figure>
        <figure className={styles.midImage}>
          <img
            src="/images/About Us Images/3rd image.png"
            alt="Vinex Nepal about story image three"
          />
        </figure>
      </div>
    </section>
  );
}

function ImageTeamStackSection({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
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
        <ImageStorySection />
        <TeamMemberPanel
          imageSide="left"
          name="Grish Katwal"
          titles={['Founder', 'CEO', 'Managing Director']}
          message="Building Vinex Nepal as a cleaner way to discover practical products, with a focus on trust, speed, and everyday value for local customers."
          imageLabel="Grish Katwal"
          imageSrc="/images/Team Images/Grish Katwal.jpg"
          y={ceoY}
        />
        <TeamMemberPanel
          imageSide="right"
          name="Himalaya Jung Katwal"
          titles={['Cofounder', 'Executive Director']}
          message="Shaping the operations behind Vinex Nepal so each order feels simple, responsive, and supported from product selection to delivery."
          imageLabel="Himalaya Jung Katwal"
          imageSrc="/images/Team Images/Himalaya Katwal.jpg"
          y={edY}
        />
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className={styles.storySection} aria-labelledby="about-story-title">
      <div className={styles.storyLogo}>
        <img src="/images/brand/VinexLogo.png" alt="Vinex Nepal" />
      </div>
      <div className={styles.storyContent}>
        <h2 id="about-story-title">
          Vinex takes “Vin” from Vinayak, Lord Ganesh, and pairs it with “ex” for modern expression.
          Together, it reflects a clever fox: thoughtful, quick, and built for smarter shopping.
        </h2>
        <div className={styles.storyColumns}>
          <p>
            We started Vinex Nepal because finding useful, good-looking products should not feel
            scattered. Customers should be able to discover practical gadgets, accessories, and
            daily essentials without guessing where to buy, what to trust, or whether support will
            be available after checkout.
          </p>
          <p>
            Our store is shaped around clarity: focused collections, fair pricing, simple ordering,
            and local communication that feels human. Vinex is not trying to make shopping louder.
            We are building a cleaner place to choose products that fit real routines.
          </p>
          <p>
            Every product we highlight has to earn its space. It should be easy to understand,
            useful to own, and backed by a team that cares about the full experience from first look
            to final delivery.
          </p>
          <p>
            That is the long-term idea behind Vinex Nepal: a modern ecommerce brand rooted in local
            trust, built carefully enough that customers can come back with confidence.
          </p>
        </div>
      </div>
    </section>
  );
}

function GalleryStackSection({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
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
      src: '/images/Gallery Images/1st.png',
      alt: 'Vinex Nepal gallery image one',
      className: styles.galleryImageOne,
      y: springOne,
    },
    {
      src: '/images/Gallery Images/2nd.png',
      alt: 'Vinex Nepal gallery image two',
      className: styles.galleryImageTwo,
      y: springTwo,
    },
    {
      src: '/images/Gallery Images/3rd.png',
      alt: 'Vinex Nepal gallery image three',
      className: styles.galleryImageThree,
      y: springThree,
    },
    {
      src: '/images/Gallery Images/4th.png',
      alt: 'Vinex Nepal gallery image four',
      className: styles.galleryImageFour,
      y: springFour,
    },
  ];

  return (
    <section ref={galleryRef} className={styles.galleryStack} aria-label="Vinex Nepal gallery">
      <div className={styles.gallerySticky}>
        <div className={styles.galleryReveal}>
          <img src="/images/brand/VinexLogo.png" alt="Vinex Nepal" />
          <p>
            Join our community for new drops, behind-the-scenes updates, and product stories made
            for everyday Nepal.
          </p>
          <nav aria-label="Vinex Nepal social links">
            <a href="https://www.instagram.com/vinexnepal/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://www.tiktok.com/@vinexnepal" target="_blank" rel="noreferrer">
              TikTok
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
              Facebook
            </a>
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
  onFooterVisibilityChange?: (isVisible: boolean) => void;
};

export function AboutPage({ onFooterVisibilityChange }: AboutPageProps) {
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
          <span>Est. 2025</span>
          <span>#About</span>
        </div>
        <h2 id="about-title">
          Vinex Nepal brings carefully picked gadgets, accessories, and daily essentials into one
          simple store, built for easy discovery, fair prices, and reliable local support.
        </h2>
      </section>

      <ImageTeamStackSection containerRef={pageRef} />
      <StorySection />
      <GalleryStackSection containerRef={pageRef} />
      <FooterSection showWelcome={false} showProductRequest={true} />
    </main>
  );
}
