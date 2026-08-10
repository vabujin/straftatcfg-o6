import { Hero } from "@/components/hero"
import { CfgHub } from "@/components/cfg-hub"
import { SiteFooter } from "@/components/site-footer"
import { AudioPlayer } from "@/components/audio-player"
import { getCommunityConfigs } from "@/app/actions/community-configs"

export default async function Page() {
  const communityConfigs = await getCommunityConfigs()

  return (
    <main className="relative min-h-screen">
      {/* Full-screen atmospheric background (fixed, behind the content layer) */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/concrete-towers.png"
          alt=""
          aria-hidden="true"
          className="size-full object-cover"
        />
        {/* Gradient overlay: light at the top so the towers show through the hero,
            fading to solid near the hub so the cards stay legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/75 to-background" />
      </div>

      {/* Content layer sits above the fixed background */}
      <div className="relative z-10">
        <Hero />

        <div id="hub" className="scroll-mt-8">
          <CfgHub initialCommunityConfigs={communityConfigs} />
        </div>

        <SiteFooter />
      </div>

      <AudioPlayer />
    </main>
  )
}
