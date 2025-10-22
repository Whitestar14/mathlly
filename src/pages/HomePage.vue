<template>
  <BasePage
    :breadcrumbs="breadcrumbs"
    :show-footer="true"
    title="Home"
    main-class="transition-colors duration-300 mx-auto text-sm overflow-hidden"
  >
    <!-- Hero Section with Conic Gradient Background -->
    <section
      class="pattern-grid overflow-hidden bg-gradient-to-b from-muted/20 to-background dark:from-background dark:to-muted/80 relative"
    >
      <!-- Conic gradient background element -->
      <div
        class="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
        style="
          background: conic-gradient(
            from 0deg at 50% 50%,
            oklch(var(--color-primary)),
            transparent 60%,
            oklch(var(--color-accent)),
            transparent 80%,
            oklch(var(--color-primary))
          );
          filter: blur(60px);
        "
      />

      <div class="container mx-auto px-4 pt-20 pb-16 md:py-24 relative">
        <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div
            class="w-full md:w-2/3 flex justify-center flex-col text-center md:text-left space-y-6"
          >
            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
              class="self-center md:self-start mb-2"
            >
              <BaseBadge
                variant="accent"
                :text="version.versionInfo.full"
                :show-notch="true"
              ></BaseBadge>
            </div>

            <h1
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
              class="text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tight text-foreground"
            >
              Mathematical precision
              <span class="block text-primary mt-2">for modern development</span>
            </h1>

            <p
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
              class="text-base md:text-lg text-muted-foreground max-w-lg self-center md:self-start"
            >
              A comprehensive suite of mathematical tools designed to streamline
              your development workflow with Prism
            </p>

            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.5 } }"
              class="flex justify-center md:justify-start flex-wrap gap-4 mt-8"
            >
              <RouterLink to="/calculator">
                <BaseButton
                  variant="primary"
                  class="w-full sm:w-auto"
                >
                  <Sparkles class="h-4 w-4" />
                  Get Started
                </BaseButton>
              </RouterLink>

              <a
                href="https://github.com/Whitestar14/prism-app"
                target="_blank"
              >
                <BaseButton
                  variant="outline"
                  class="w-full sm:w-auto"
                >
                  <GithubIcon class="h-4 w-4" />
                  View GitHub
                </BaseButton>
              </a>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{
              opacity: 1,
              scale: 1,
              transition: { delay: 0.6, duration: 0.5 },
            }"
            class="w-full md:w-1/3 flex justify-center mt-8 md:mt-0"
          >
            <!-- Logo/Icon placeholder -->
            <BaseMedia
              type="svg"
              :svg-content="PrismSvg"
              size="lg"
              class="relative hidden md:block scale-150 md:scale-[2.5] lg:scale-[3.5]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-16 bg-card">
      <div class="container mx-auto px-6">
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
          class="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div
            v-for="stat in statistics"
            :key="stat.label"
            class="bg-muted dark:bg-background/50 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-border dark:border-border/50"
          >
            <h3
              class="text-3xl md:text-4xl font-bold text-primary dark:text-primary mb-2"
            >
              <CountUp
                :end-val="stat.value"
                :duration="2.5"
                :suffix="stat.suffix"
              />
            </h3>
            <p class="text-muted-foreground dark:text-muted-foreground">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Essential Tools Section -->
    <section class="py-16 bg-background">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-between mb-10">
          <h2 class="text-2xl md:text-3xl font-medium">
            Essential Tools
          </h2>
          <RouterLink to="/calculator">
            <BaseButton
              variant="link"
              class="group"
            >
              View all tools
              <ArrowRightIcon
                class="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              />
            </BaseButton>
          </RouterLink>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <RouterLink
            v-for="tool in quickTools"
            :key="tool.path"
            :to="tool.path"
            class="relative block h-full transition-transform duration-300 hover:-translate-y-1 focus-colors"
          >
            <FeatureCard
              :key="tool.name"
              :title="tool.name"
              :icon="tool.icon"
              :description="tool.description"
            />
            <BaseBadge
              v-if="tool.isNew"
              variant="new"
              text="New"
              class="absolute right-5 top-5"
            ></BaseBadge>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-16 bg-card">
      <div class="container mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-medium mb-10 text-center">
          Key Features
        </h2>
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            class="dark:!bg-background/50 dark:!border-border/50"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </div>
    </section>

    <!-- Why Choose Us & Mission Section -->
    <section class="py-16 bg-card">
      <div class="container mx-auto px-6">
        <div class="flex flex-col gap-12">
          <!-- Why Choose Us Section -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            class="w-full"
          >
            <h2 class="text-2xl md:text-3xl font-medium mb-6 text-foreground">
              Why Choose Prism?
            </h2>
            <div
              class="bg-background dark:bg-background rounded-lg p-6 shadow-sm border border-border dark:border-border"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="(reason, index) in reasons"
                  :key="index"
                  class="flex items-start"
                >
                  <div
                    class="bg-primary/10 dark:bg-primary/20 p-2 rounded-full mr-4 shrink-0 mt-0.5"
                  >
                    <CheckCircleIcon
                      class="h-4 w-4 text-primary dark:text-primary"
                    />
                  </div>
                  <span class="text-foreground/90">{{ reason }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mission Section -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            class="w-full"
          >
            <h2 class="text-2xl md:text-3xl font-medium mb-6 text-foreground">
              Our Mission
            </h2>
            <div
              class="bg-background dark:bg-background rounded-lg shadow-sm border border-border dark:border-border overflow-hidden"
            >
              <div class="flex flex-col md:flex-row">
                <div class="md:w-2/3 p-6">
                  <p class="text-foreground/90 leading-relaxed mb-6">
                    At Prism, we're committed to empowering developers with
                    powerful, intuitive, and efficient mathematical tools. Our
                    goal is to streamline complex calculations, making your
                    coding journey smoother and more productive.
                  </p>
                  <p class="text-muted-foreground leading-relaxed">
                    We believe that mathematical precision should be accessible
                    to all developers, regardless of their background or
                    experience level.
                  </p>
                </div>
                <div
                  class="md:w-1/3 bg-primary/5 dark:bg-muted p-6 flex items-center justify-center"
                >
                  <div class="text-center">
                    <AsteriskIcon
                      class="h-16 w-16 text-primary dark:text-primary mx-auto mb-4"
                    />
                    <p class="text-primary dark:text-primary font-medium">
                      Precision & Simplicity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section with Conic Gradient -->
    <section class="py-16 bg-card">
      <div class="container mx-auto px-6">
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="relative overflow-hidden rounded-lg shadow-lg"
        >
          <!-- Logo accent -->
          <div class="flex top-10 -left-5 absolute justify-center max-h-[60px]">
            <PrismLogo class="scale-150" />
          </div>
          <!-- Content -->
          <div class="relative z-5 p-8 md:p-12 text-center">
            <!-- Title with monospace accent -->
            <h2
              class="text-2xl md:text-3xl font-mono font-medium mb-4 text-background"
            >
              Ready to experience
              <kbd
                class="inline-block bg-background/10 dark:bg-background/30 px-2 py-1 rounded text-background dark:text-background border border-background/20"
              >
                prism</kbd>?
            </h2>

            <p
              class="text-background/90 dark:text-background/90 max-w-2xl mx-auto mb-8 text-lg"
            >
              Join hundreds of developers who are already using Prism to
              streamline their mathematical workflows.
            </p>

            <!-- Action buttons -->
            <div
              class="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <RouterLink to="/calculator">
                <BaseButton
                  variant="secondary"
                  class="bg-background dark:bg-muted text-primary dark:text-primary hover:bg-background/90 dark:hover:bg-muted/90 shadow-md hover:shadow-lg transition-colors duration-300 w-full sm:w-auto"
                >
                  <CalculatorIcon class="h-4 w-4" />
                  Try Prism Now
                </BaseButton>
              </RouterLink>

              <a
                href="https://github.com/Whitestar14/prism-app"
                target="_blank"
              >
                <BaseButton
                  variant="outline"
                  class="border-background/30 dark:border-background/40 !text-background hover:bg-background/10 dark:hover:bg-background/15 w-full sm:w-auto"
                >
                  <GithubIcon class="h-4 w-4" />
                  Star on GitHub
                </BaseButton>
              </a>
            </div>

            <!-- Version Badge -->
            <div class="mt-8 flex justify-center">
              <BaseBadge
                variant="custom"
                :text="version.versionInfo.full"
                :show-notch="false"
              />
            </div>
          </div>

          <!-- Conic Gradient overlay -->
          <div
            class="absolute inset-0"
            style="
              background: conic-gradient(
                from 45deg at 50% 50%,
                oklch(var(--color-primary)),
                oklch(var(--color-primary) / 0.8) 50%,
                oklch(var(--color-primary))
              );
            "
          />

          <!-- Background with grid pattern -->
          <div
            class="absolute inset-0 pattern-grid opacity-10 dark:opacity-50"
          />

          <!-- Decorative elements -->
          <div
            class="absolute top-0 right-0 w-64 h-64 -mt-12 -mr-12 opacity-20 dark:opacity-10"
          >
            <div
              class="w-full h-full rounded-full bg-background dark:bg-primary/40 blur-3xl"
            />
          </div>
          <div
            class="absolute bottom-0 left-0 w-48 h-48 -mb-8 -ml-8 opacity-20 dark:opacity-10"
          >
            <div
              class="w-full h-full rounded-full bg-background dark:bg-primary/40 blur-3xl"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Welcome Modal -->
    <welcome-modal v-model="showWelcomeModal" />
  </BasePage>
</template>

<script setup lang="ts">
import { ref, defineComponent, h, onMounted } from 'vue';
import {
  Sparkles,
  ArrowRightIcon,
  CheckCircleIcon,
  CalculatorIcon,
  GithubIcon,
  AsteriskIcon,
} from 'lucide-vue-next';
import { useTimeoutFn } from '@vueuse/core';
import { useVersionStore } from '@stores/version';
import { RouterLink } from 'vue-router';
import {
  PrismLogo,
  BaseMedia,
  BaseButton,
  BaseBadge,
  BasePage,
} from '@components/ui';
import PrismSvg from '@assets/icons/prism-hero.svg?raw';
import { FeatureCard, WelcomeModal } from '@components/layout';
import type { BreadcrumbItem } from '@components/ui/BasePage.vue';
import { appStorage } from '@services/storage';

// Simple CountUp component
const CountUp = defineComponent({
  name: 'CountUp',
  props: {
    endVal: { type: Number, required: true },
    duration: { type: Number, default: 2 },
    suffix: { type: String, default: '' },
  },
  setup(props) {
    const currentValue = ref(0);

    onMounted(() => {
      const startTime = Date.now();
      const endTime = startTime + props.duration * 1000;

      const updateValue = () => {
        const now = Date.now();
        if (now >= endTime) {
          currentValue.value = props.endVal;
          return;
        }

        const elapsed = now - startTime;
        const progress = elapsed / (props.duration * 1000);
        currentValue.value = Math.floor(progress * props.endVal);
        requestAnimationFrame(updateValue);
      };

      updateValue();
    });

    return () => h('span', {}, `${currentValue.value}${props.suffix}`);
  },
});

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', path: '/' },
];

const version = useVersionStore();

const quickTools = [
  {
    name: 'Calculator',
    path: '/calculator',
    icon: 'Calculator',
    description:
      'Advanced calculator with programming-specific features and real-time evaluation.',
    isNew: false,
  },
  {
    name: 'Base64',
    path: '/tools/base64',
    icon: 'Binary',
    description:
      'Efficiently encode and decode Base64 strings with instant preview and validation.',
    isNew: true,
  },
  {
    name: 'Functions',
    path: '/functions',
    icon: 'FunctionSquare',
    description:
      'Comprehensive mathematical functions with visualization capabilities.',
    isNew: false,
  },
];

const statistics = [
  { label: 'Calculations Performed', value: 50000, suffix: '+' },
  { label: 'Active Users', value: 300, suffix: '+' },
  { label: 'Tools Available', value: 15, suffix: '+' },
];

const features = [
  {
    icon: 'Calculator',
    title: 'Advanced Modes',
    description:
      "From basic arithmetic to complex programming calculations, we've got you covered.",
  },
  {
    icon: 'Eye',
    title: 'Real-time Preview',
    description:
      'See your results instantly as you type, enhancing your productivity.',
  },
  {
    icon: 'History',
    title: 'Calculation History',
    description:
      'Never lose track of your work with our comprehensive history feature.',
  },
  {
    icon: 'Palette',
    title: 'Customizable UI',
    description:
      'Tailor the interface to your preferences for a personalized experience.',
  },
  {
    icon: 'Code',
    title: 'Developer-Focused',
    description:
      'Built with the needs of developers in mind, including programmer-specific functions.',
  },
  {
    icon: 'Cloud',
    title: 'Cloud Sync',
    description:
      'Access your calculations and settings across all your devices.',
  },
];

const reasons = [
  'Designed specifically for developers and programmers',
  'Constantly updated with new features based on user feedback',
  'Open-source and community-driven development',
  'Seamless integration with popular IDEs and text editors',
  'Extensive documentation and support resources',
];

const showWelcomeModal = ref(false);

onMounted(() => {
  // Check if the welcome modal has been shown before
  const hasShownWelcome = appStorage.get('onboarding', 'welcomeShown', false);
  if (!hasShownWelcome) {
    // Add a delay before showing the modal
    useTimeoutFn(() => {
      showWelcomeModal.value = true;
    }, 1000);
  }
});
</script>