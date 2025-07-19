<template>
  <BasePage
    title="About"
    :show-footer="true"
  >
    <!-- Team & Vision Section -->
    <section class="mb-16 pattern-grid overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div class="container mx-auto px-4 pt-20 pb-16 md:py-24 relative">
        <h2 class="text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tight text-foreground">
          Built with passion,
          <span class="block mb-4 text-primary">
            driven by community
          </span>
        </h2>

        <p class="text-base md:text-lg text-muted-foreground max-w-lg self-center md:self-start">
          Started as a developer's side project, Mathlly has grown into a community-driven platform 
          that pushes the boundaries of development tools.
        </p>
      </div>
    </section>

    <!-- Core Values -->
    <section class="space-y-8 mb-16">
      <h3 class="text-2xl font-medium tracking-tight text-foreground">
        Core Values
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          v-for="coreValue in coreValues"
          :key="coreValue.title"
          :icon="coreValue.icon"
          :title="coreValue.title"
          :description="coreValue.description"
        />
      </div>
    </section>

    <!-- Development Process -->
    <section class="space-y-6 mb-16">
      <h3 class="text-2xl font-medium tracking-tight text-foreground">
        Development Process
      </h3>
      <div class="bg-background rounded-lg border border-border p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(phase, index) in devProcess"
            :key="index"
            class="space-y-3"
          >
            <div class="flex items-center gap-2">
              <component
                :is="phase.icon"
                class="h-5 w-5 text-primary"
              />
              <h4 class="font-medium text-foreground">
                {{ phase.title }}
              </h4>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ phase.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contributing Section -->
    <section class="space-y-6">
      <h3 class="text-2xl font-medium tracking-tight text-foreground">
        Contributing
      </h3>
      <div class="bg-background rounded-lg border border-border p-6">
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground leading-relaxed">
            Mathlly is open source and welcomes contributions from developers worldwide. Whether you're fixing bugs, 
            adding features, or improving documentation, your help makes Mathlly better for everyone.
          </p>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="primary"
              @click="goToGithub"
            >
              <GithubIcon class="h-4 w-4" />
              View on GitHub
            </Button>
            <Button
              variant="outline"
              @click="goToContributing"
            >
              <BookOpenIcon class="h-4 w-4" />
              Contributing Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  </BasePage>
</template>

<script setup lang="ts">
import { 
  GithubIcon, 
  BookOpenIcon, 
  UsersIcon, 
  RocketIcon, 
  TestTubeIcon,
  type LucideIcon
} from "lucide-vue-next";
import BasePage from "@/components/base/BasePage.vue";
import FeatureCard from "@/components/cards/FeatureCard.vue";
import Button from "@/components/base/BaseButton.vue";

interface CoreValue {
  title: string;
  icon: string;
  description: string;
}

interface DevPhase {
  title: string;
  icon: LucideIcon;
  description: string;
}

const coreValues: CoreValue[] = [
  {
    title: 'Community Driven',
    icon: 'Heart',
    description: 'Built by developers, for developers. Every feature and improvement is inspired by real user needs.'
  },
  {
    title: 'Open Source',
    icon: 'ShieldCheck',
    description: 'Transparent development process with a focus on security, reliability, and continuous improvement.'
  },
  {
    title: 'Innovation',
    icon: 'Sparkles',
    description: 'Pushing boundaries with cutting-edge features while maintaining simplicity and usability.'
  }
];

const devProcess: DevPhase[] = [
  {
    title: 'Community First',
    icon: UsersIcon,
    description: 'Features and improvements driven by real developer needs and feedback.'
  },
  {
    title: 'Test Driven',
    icon: TestTubeIcon,
    description: 'Rigorous testing ensures reliability and stability.'
  },
  {
    title: 'Continuous Delivery',
    icon: RocketIcon,
    description: 'Regular updates and improvements keep Mathlly cutting edge.'
  }
];

const goToGithub = (): void => {
  window.open('https://github.com/Whitestar14/mathlly', '_blank');
};

const goToContributing = (): void => {
  window.open('https://github.com/Whitestar14/mathlly/blob/main/CONTRIBUTING.md', '_blank');
};
</script>