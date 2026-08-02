export type Post = {
  // Stable identity for owner edits stored in Blob (see `lib/post-store`).
  // Never changes — the slug can.
  id: string;
  // The post's URL: `/writing/<slug>` (writing.lindaxue.com/<slug>). Any
  // string works — keep it short (e.g. "beacon").
  slug: string;
  title: string;
  // Machine-readable date for sorting/metadata (YYYY-MM-DD).
  date: string;
  // Short one-liner for the index row and link previews.
  tagline: string;
  // Optional thumbnail, shown on the index row, the hover note, and link
  // previews. A path under /public (e.g. "/images/posts/beacon.png") or an
  // uploaded image ("/api/images/<name>").
  thumbnail?: string;
  // Vertical focal point for the banner's 3:1 crop, 0 (top) – 100 (bottom).
  // Omitted = 50 (center). Set by dragging the preview in the post editor.
  thumbnailY?: number;
  // Body copy. Blank lines separate paragraphs; a line that is just an image
  // URL renders as the image itself (same convention as marginalia notes),
  // and lines under the URL in the same paragraph are the image's caption.
  // A second image URL directly under the first is the dark-theme variant —
  // the pair renders as one figure that follows the site theme.
  // Block syntax: "# " section heading, "## " subheading, "- "/"* "/"1. "
  // list lines, "> " blockquote, ``` fenced code, "---" horizontal rule.
  // Inline: **bold**, *italic*, ***both*** (nesting works), ~~strike~~,
  // `code`, [text](url) links and bare URLs (⌘B/⌘I/⌘K in the editor).
  // The static value here is the default — the owner can rewrite it inline,
  // which stores an override in Blob (see `lib/post-store`).
  body: string;
  // Drafts are only visible to the signed-in owner — hidden from the index
  // and 404 on the post page for visitors.
  draft?: boolean;
};

export const posts: Post[] = [
  {
    id: "landlords",
    slug: "landlords",
    title: "Digital Landlords",
    date: "2026-08-02",
    tagline:
      "I don’t want to sublease attention from social media algorithms anymore",
    body: [
      "# My relationship with content",
      "I first came to understand the concept of content creation during the pandemic, when I found myself immersed in Minecraft SMP streaming communities. Perhaps this is when the entrepreneurial spirit of “I could probably do this myself” first struck me, and I decided I would become a streamer. In an effort to promote my channel, I would post clips on TikTok and edit voiceovers and sound effects together, copying formats from viral videos. The first video to reach over 1,000 likes was a BedWars clip, and the top comment was “I don’t understand how anyone could possibly be this bad at anything.” That comment alone had a few hundred likes, but hey, haters mean that you’re doing something right… right? Anyways, this is when the dopamine addiction started.",
      "Eventually, the combination of Minecraft, OBS Studio, and Discord fried my 2012 MacBook Air’s battery, and I had to find another dopamine plug for my digital validation addiction. The only other skill I had developed during COVID was singing and playing guitar, so I started another account, @greenteaslurper, in the summer of 2023. Turns out, Linda’s musical talent is more consistent than her Bed Wars ability, and I churned out multiple videos every week for a few months until an acoustic cover of James Arthur’s “Say You Won’t Let Go” went giga-viral.",
      "/images/posts/landlords/tiktok-covers.png\n“Say You Won’t Let Go” at 5.8M plays, and “Evergreen” at 1M.",
      "I hit 50k followers overnight, and suddenly my stats were in microinfluencer territory. Having a bit of TikTok clout is really good for opening doors; One of my favorite bands of all time, Rainbow Kitten Surprise, commented on a cover my friend and I did at one of the many local bar open mics we would sneak into. I also released my first few songs that I produced without a DAW - to this day, I still don’t think I’ve found a more organic-sounding production style than aligning all the waveforms by ear in Audacity.",
      "Sometimes I wonder if the two years where my personal identity was oriented around rolling out videos and making music are what really did me in. I’ve since stopped posting as much on the account, and engagement has dropped, but my dopamine addiction is still full-blown. I struggle with doomscrolling, and it’s hard for me to do things without thinking about documentation and social media presentability.",
      "I still don’t know how to feel about this dilemma: on the one hand, I love being able to send links to media to easily show proof of work, but it’s nearly impossible to separate metrics from my internal benchmark for how well I executed. I suppose it’s a product of how much I attribute my self-worth to my output… but what is art if not deeply personal? What is art if not just another avenue for connection?",
      "The utility of having eyes on what you make is undeniable, but when do you draw the line and just build in stealth for a while? Is it a matter of confidence? Maybe this is just a skill issue, and I simply don’t have the network I would like to have to look over my WIPs, but what if it isn’t a skill issue? What does the perfect platform for sharing work look like?",
      "# Distribution and Creative Agency",
      "The kind of platforms I’m interested in are those that mediate creative distribution - places where people publish things for other people to discover. As I see it, these platforms tend to organize themselves in one of two ways.",
      "The first is by domain. Books belong on Goodreads. Movies belong on Letterboxd. Restaurants belong on Beli. These are good for people who are already embedded in certain spaces and allow them to connect with people who already share that with them, and they have different formats through which people can engage - usually through text.",
      "The second is by format. Vertical videos belong on TikTok. Essays belong on Substack. Shorter reads on X. These platforms are much broader, include sub-communities where people with shared interests can interact, and offer a wider range of topics.",
      "This organization is incredibly useful. It makes discovery efficient, as I know exactly where to go to explore specific things. But it also fragments the creative process itself. Every platform develops its own preferences. TikTok rewards immediacy. LinkedIn rewards professional milestones. Substack rewards sustained argument. None of these are inherently bad, but over time I begin thinking in the language of whichever platform I’m creating for. Instead of asking *What do I want to make?* I find myself asking, *Where does this belong?* Or worse, *What should I make for this platform?*",
      "When the motivation for creation is for the platform rather than the work, the ownership of the work is silently surrendered to the algorithm. If I’m posting a video, I would like it to be received in the aspect ratio of my choosing; I don’t want to have to record it vertically so that the TikTok and Reels algorithms will favor it. I don’t want to have to do some stupid shit in the first three seconds so that people will break their doomscroll and sit and watch me share my message. I hate the panoptoniconic nature of social media - It’s not even a conscious thing at this point; I’m always performing for the algorithmic gaze. Whenever I scroll through videos, I inadvertently begin doing user research on myself: noting down videos that do a good job of hooking me in and reverse-engineering the attention hacks they use.",
      "# Personal Websites",
      "This is why I’m so bullish on being more personal, website-native. In my ideal world, we can overcome our dopamine addiction, and there will be some sort of feed for us to keep up with all of our friends’ online while simultaneously being able to come across new ideas and content serendipitously.",
      "This said, I am attempting to practice what I preach in the latest iteration of my website. I can edit everything directly on the web, and if I want to add new functionality to support a new project, I can just commit some code.",
      "/images/posts/landlords/editing-dark.png\n/images/posts/landlords/editing-light.png\nEditing the homepage inline — this screenshot follows the site theme.",
      "Very fun :)",
    ].join("\n\n"),
  },
  {
    id: "rl-mon",
    slug: "rl-mon",
    title: "Building Little Monsters to Learn Reinforcement Learning",
    date: "2026-07-24",
    tagline: "RLing myself to RL",
    thumbnail: "/images/posts/rl-mon/lemke-creature.png",
    body: [
      "The other day I stumbled across this BEAUTIFUL demo by Aaron Lemke, where he posted a video of a fuzzy little 5-legged “RL creature” with a voice determined by a five-layer neural network overlaid in the top-left corner of his demo. He also had a dialkit-like right panel with a bunch of sliders modulating the voice’s relationship to the environment.",
      "I’d been pretty averse to actually getting into the nitty-gritty of AI research simply because I was afraid of not being smart enough: the math is hard, I don’t really know if I can derive backpropagation from scratch, jargon is confusing, and plus what’s the use if I can just keep making tool-use agents and pretty UIs with nice microinteractions? Ok, enough with the cope - I was just scared.",
      "That afternoon, I set out on a quest to understand RL well enough to fully create a creature of my own!",
      "# What is an RL Mon made of?",
      "I started off by reverse-engineering the demo I had seen by shoving it into ChatGPT. So, in the RL creature example:",
      "**Environment:** The “world” that the creature exists in is a physics simulator by Google DeepMind called MuJoCo. The body is defined as an MJCF file - it tells legs, joints, mass, etc. I find it very interesting that the body is just a “home” for the policy. I’ve been looking into Iain McGilchrist’s work, where he defines the body as something to be experienced - that our flesh is just a home for our soul and something to be understood analogous to the outside world - that we experience the outside world through our flesh, but we are also experiencing our flesh in the same way! This is similar to when I had the question of “What happens when you take the policy trained for a 2-legged creature and apply it to a 4-legged one?” If you create a generalized policy that has been trained with leggedness as a free degree!",
      "**Policy:** This is the brain - it’s a neural network that takes the environment as input and the next move as output. (joint positions, velocities, body orientation → torques for each joint).",
      "**Learning:** The monster uses Proximal Policy Optimization (PPO), a standard RL algorithm in robotics. PPO trains an actor-critic architecture consisting of two neural networks: the actor selects the next action (how to move each joint), and the critic estimates the expected future reward of the current state. The actor learns by trial and error, while the critic learns to estimate whether things are improving or worsening. Together they slowly shift policy weights until the creature consistently achieves the objective.",
      "# Hopper",
      "To start off, I was tasked by Chat to begin with Hopper. This guy has his stem fixed vertically and has a joint in his foot - the objective is simply to move forward for as far as possible. I started off using MuJoCo, SB3 Zoo, and my PPO algorithm. I ran it 1M timesteps with a constant lr of 0.0003, and it started bouncing!",
      "/images/posts/rl-mon/hopper.png\nHopper.",
      "I also received some graphs back from TensorBoard - here are some of the more useful definitions:",
      [
        "- **Reward** - is the creature getting better? Should go up.",
        "- **Episode Length** - is it surviving longer? Should go up.",
        "- **Value Loss** - is the critic getting less wrong? Should go down.",
        "- **Entropy** - is the policy becoming less random? Slowly goes down.",
        "- **KL** - how much did the policy change this update? Should stay small.",
        "- **Explained Variance** - how good is the critic? Approaches 1.",
      ].join("\n"),
      "/images/posts/rl-mon/hopper-ep-rew.png\nMean episode reward still climbing at 1M steps.",
      "/images/posts/rl-mon/hopper-ep-len.png\nEpisode length maxing out around 400k steps.",
      "# Walker",
      "Doubling the number of legs now! Walker has lateral movement locked but can now fall forward and backward. I ran 3M timesteps with constant LR, but the figure kept galloping and struggled to push past 3k timesteps before falling. I was confused wtf, so I started looking into seed randomization, and since I was raw-dogging a start, I ran a few with randomized seeds, but it still sucked",
      "/images/posts/rl-mon/walker.png\nWalker.",
      [
        "```",
        "run   ep_rew_mean   ep_len   approx_kl   clip_fraction",
        "s1    2450          825      0.25        0.69",
        "s2    1990          894      0.57        0.74",
        "s3    ~2500         —        0.18        0.63",
        "```",
      ].join("\n"),
      "Turns out Walker needs ~50M steps + a stable LR, and my SB3 run only ran 3M steps at a constant 3e-4 (my KL exploding). I decided to switch to BRAX because it runs GPU-parallel, whereas SB3 runs on my Mac’s CPU. BRAX also has better adaptive KL (Kullback-Leibler difference measures how much your policy changed in one update), where the LR is adjusted up/down to hold a KL target, whereas SB3’s target_kl just aborts the update once KL is exceeded.",
      [
        "```",
        "            OLD          NEW",
        "Framework   PyTorch      JAX",
        "Physics     MuJoCo       MJX",
        "RL          SB3/RL-Zoo   BRAX PPO",
        "```",
      ].join("\n"),
      "After wiring up brax, ran for 56m timesteps. Stopped galloping around 15m timesteps",
      "/images/posts/rl-mon/walker-sb3-vs-brax.png\nThe SB3 wall vs the Brax run - the breakthrough lands around 17M steps.",
      "I also decided it might be fun to make a web viewer so I could have a more intuitive interface, so I had cursor compile MuJoCo to WebAssembly (mujoco-js) for the physics, export each policy to ONNX, and ran it in-browser with onnxruntime-web, and rendered the whole thing with three.js (WebGPU, falling back to WebGL) so everything runs serverless. Then I wrapped it in a quick UI with shadcn + Tailwind, where I could toggle between runs, view the policy visualization and feel smart, compare training curves, and customize the colors in the environment! Had a great time showing people once this was finished :)",
      "/images/posts/rl-mon/web-viewer-walker.png\nThe web viewer - live policy activations in the corner, dials on the right.",
      "# Ant",
      "Let’s double the legs! Ant survives (stays upright) from the start, but the actual forward gait doesn’t show up until ~16M steps and only looks good around 33–40M (reward 3400 → 4455). Tops out at ~5900 by 90M. High reward variance throughout.",
      "/images/posts/rl-mon/ant.png\nAnt.",
      "/images/posts/rl-mon/ant-reward.png\nThe gait emerges between 16M and 40M steps.",
      "I then added randomly spawning “food orbs” to make the behavior more entertaining to watch, like in Lemke’s demo!",
      "/images/posts/rl-mon/antfood.png\nForaging is slow to emerge - still climbing at the end of the 106M budget.",
      "Not cute enough, what about making food only edible with 2 hands?",
      "/images/posts/rl-mon/antfood-2leg.png\nWarm-started from the trained forager, then refines the two-foot plant.",
      "Here’s a tree for more context",
      "/images/posts/rl-mon/ant-capability-tree.png\nThe Ant capability tree: base locomotion → forage → forage with 2 feet.",
      "## Aw shit, it keeps flipping over",
      "Ant’s health check is height-only, so it stays “healthy” even when it’s on its back, so it’d just flail. Fixed it so that the torso must now be upright to be considered healthy, and trained specifically for flip-over behavior. Self-righting emerges sharply at ~16M steps and plateaus - not super robust, but it’s kind of like a bottle flip where the ant just kicks its feet and prays - I added a “knock over” button on the web viewer; it’s quite fun to play with.",
      "/images/posts/rl-mon/antgetup.png\nThe variance collapse - reliable self-righting emerges at ~16M steps.",
      "/images/posts/rl-mon/web-viewer-antgetup.png\nThe “Knock over” button in the web viewer.",
      "# Future Directions",
      "**RL POKEMON:** Since the actual policies themselves aren’t super large, I think it would be SO FUN to have dedicated “RL-MON” folders where you can train your own monsters under certain constraints (<100m timesteps, no more than 10 limbs, etc.) and carry them around - either locally or maybe on a personal USB drive (shoutout USB.club). Then you could have designated gym machines where you plug your monsters into, and they have to compete to complete tasks, and the best policy wins - and maybe there are categories for certain types of tasks (speed, strength, problem solving, etc.). I actually think this is probably a genius idea and would be a hit in San Francisco - someone help me make this happen.",
      "On a more serious note tho:",
      [
        "- **Generalist policies:** how can I efficiently train the ability to flip back over, navigate weird terrain, jump, etc.?",
        "- **More Monsters:** I want to mess around with bendy limbs, different senses, different environmental properties (e.g. more/less gravity), social dynamics, behavior sharing, etc.",
        "- **Expressive features:** responsive hair and noises",
      ].join("\n"),
      "That sums it up! If you want to tinker: https://github.com/linder0/rl-mon",
    ].join("\n\n"),
  },
  {
    id: "vroom",
    slug: "vroom",
    title: "VROOM Postmortem: What We Got Wrong About Events",
    date: "2026-07-05",
    tagline: "On trust, coordination, and four months in the events industry",
    body: [
      "# Intro and Whitepaper Recap",
      "At the start of this year, I was obsessed with one question: why do tech companies pour so much money into catering, venues, and staffing when the ROI looks trivial?",
      "After talking to various event planners and organizers in New York City, we concluded that repeat organizers had built a network of venues and vendors, along with a custom workflow for hosting repeat events in various formats. That led to the thesis that the private “operating system” experienced planners carry in their heads could be externalized as a data layer (the VRM, or Venue/Vendor Relationship Manager) and sold as infrastructure. The goal was to start with event coordination and then expand into venue sourcing and ticketing, eventually eating the entire ecosystem, which we had calculated to be a $90B+ TAM.",
      "The whole thing rested on two assumed problems:",
      "1. Venues and vendors maintain information asymmetry around availability, pricing, and terms to preserve pricing power and control demand.",
      "2. Coordination between providers is bottlenecked by single-channel communication.",
      "And so, the next 4 months began with that thesis in hand.",
      "# How Shit Actually Works",
      "We decided to begin with startup events (dinners, mixers, launch parties), as that market was most immediately accessible. It was here that both of our founding problems fell apart almost immediately.",
      "**Information Asymmetry**",
      "Pricing isn’t hidden or meticulously planned to extract as much as possible; it’s just constrained, as every provider in the ecosystem must maintain comparable pricing to offer services of similar quality. It was also apparent that vendors are seldom the bottleneck in bringing an event together, as most services are commoditized. If logistics don’t work for one vendor, another is almost always available with enough lead time. The information asymmetry problem is also about repeatability and optics: venues and vendors want to work with you if you will be a returning customer and leverage their branding. TLDR of the events industry: every player just wants to look good and make money.",
      "“Information asymmetry” was really just our attempt to compartmentalize the nuances of a trust relationship between the provider (venue or vendor) and the host.",
      "**Coordination Bottleneck**",
      "Coordination between providers isn’t bottlenecked by single-channel comms. It’s just not hard. Once you know which vendors and have a bit of lead time, stitching providers together is simple.",
      "As it turned out, startups that wanted to work with us often didn’t have the budget for well-done events, and the startups and companies that did have a budget for events didn’t see value in us doing it more cheaply. That left us with the same issue: the market wasn’t responding to coordination, but to trust. We concluded that the easiest way to build that trust was to run our own events.",
      "# Trying to Manufacture Trust",
      "In an attempt to build trust, we decided that we would just have to throw our own events (see them at vroomevents.com). We threw a lot of small startup events and kept trying to climb into bigger corporate budgets. It was brutally hard to close, and we learned why: corporate events are bimodal. Either you have them, or you don’t. If you do, you have serious money to spend, which means you spend it on people you already trust. Nowadays and Boompop are deeply embedded in that scene. Without the proper corporate connections or age on our side, we were trying to speedrun the kind of credibility that accrues over years.",
      "# A Quick Detour to Ticketing",
      "So we pivoted to ticketing as another potential revenue stream. This is where we actually started to understand the real shape of the industry. Ticketing is usually the reward for supplying some other value to the host, and we assumed we might be able to provide that value via coordination. By looking at the complexity at each tier and the major players in each one, we saw why coordination wasn’t valuable on any tier.",
      "**Four Scales of Events**",
      "**1. Small, intimate gatherings** (e.g. dinners, card nights): One or two hosts, high participation, no profit goal. There’s nothing to coordinate that the host doesn’t already enjoy doing, and nothing to sell. The “work” is picking a date and time, so adding software would just complicate things, and people will be able to vibe code anything they need very easily in the future.",
      "**2. Indie producer events** (e.g. club nights, parties): These confirm the whitepaper’s core observation: producers build a tight, repeated circle of venues and vendors. The private OS is real. But the graph is the producer’s edge, so the people who own the valuable network guard it with their lives.",
      "**3. Corporate events** (Boom Pop, Nowadays): Corporate demand is bimodal. Companies either treat events as core to the business and hire in-house to run them, or don’t run them at all. There’s no middle population of firms that want to outsource event coordination to software. Thus, Boom Pop and Nowadays serve the repeatable, objective-oriented slice.",
      "**4. Large live events & festivals** (Live Nation): Too variable for repeatable software, and viability requires a full suite of offerings such as wristbands, distribution, ticketing, etc., not just coordination. Outside a handful of independently organized events, the category is consolidated under Live Nation. There’s no wedge here that isn’t a decade-long infrastructure build.",
      "This was unfortunately realized after we built out Vroom ticketing. To compete there, we’d have had to build a pile of software and services to take on incumbents who already bundle distribution and advertising.",
      "# The Deeper Errors",
      "**There was no wedge.** We originally identified a target of “Mid-sized events” with a budget of 3k to 200k as our wedge; it’s more like a ball, maybe. Honestly, this was probably fixable by just sitting with real events longer before writing a thesis about them. (lol.)",
      "**There was no network effect.** The expansion plan assumed the VRM data layer would compound: more events, more data, a stronger moat, fancy gestures to enrich the data graph, blah blah blah. But events data is short-lived; last quarter’s availability, pricing, and contacts decay almost immediately, so the “asset” you’re accumulating is mostly stale by the time you’d use it. And trust, the very thing that doesn’t decay, isn’t codifiable. You can’t store it in a database or harness it by noting that a dynamic exists; it just lives in a person’s reputation and relationships. So the data we could capture had no moat, and the moat we wanted couldn’t be captured as data.",
      "**The expansion plan assumed a lot.** Eat coordination, then sourcing, then ticketing… we had built the rungs of that ladder, assuming the previous one had built durable, transferable trust. None of it did.",
      "# What I Believe Now",
      "The real problem was never being deeply enough embedded in events. Everything else was downstream of that.",
      "**Trust cannot be outsourced.** It was the scarce resource the entire time, the one thing the planner’s OS actually runs on, and it’s the thing we kept trying to route around.",
      "**And, coordination is trivial.** If the host is particularly tech-savvy, they would probably know to connect Notion MCP to Claude, have it break down all the operational details, and then send texts or emails to everyone involved. I believe the gaps are mostly due to a lack of education.",
      "# What Now?",
      "As software becomes more and more accessible, it’s no longer worthwhile to build wrapper software. Once the tool is everywhere, what matters is knowing what to do with it.",
      "The cultural problem underlying all of this remains real and worth solving: people genuinely want better ways to gather. As more of the economy gets automated and abundant post-AGI, the scarce things are human connection, physical presence, and trust between actual people.",
      "**Trust is everything.** We just spent four months trying to turn it into a database first.",
    ].join("\n\n"),
  },
  {
    id: "beacon",
    slug: "beacon",
    title: "Building my Beacon",
    date: "2026-07-01",
    tagline: "On Minecraft, emergence, and finding the plot",
    body: [
      "The beacon has been my latest metaphorical fascination.",
      "To build a beacon in Minecraft, all you need is to kill a wither, obtain its star, put some glass and obsidian around it, and you get a nice little block that does nothing. To activate it, you must build a pyramid of precious ore blocks (iron, gold, diamond, emerald, or netherite) beneath it, with the side length increasing by two for each additional layer, up to a maximum of four layers. It doesn’t matter what ores are in each layer, just that they are solid. Each layer gives you increasing buffs - pretty awesome.",
      "I think this is a beautiful analogy to early adulthood (in my case, the ripe age of 19). When life comes knocking at your doorstep with the inevitable question of “what is the plot?” it’s hard to find an answer worth defending. I think about my plot quite frequently, and having founded two failed companies in less than 12 months and finding myself extremely lost after feeling extremely convinced makes me think a lot about how I choose to activate my beacons - or what I even understand a beacon to be.",
      "I first coined the term while tripping balls at the Golden Gate Vista Overlook, staring very closely at the minerals embedded in the bunkers' concrete. I couldn’t stop thinking about how everything was the same thing, over and over again. At the time, I just kept repeating that “EVERYTHING IS RECURSIVE!” but upon further deliberation with friends who are more frequent trippers, I realize that I was just first-principling emergence. Over the course of two hours, my mind inevitably wandered to the fact that I was founding, and I started thinking about how our body is composed of atoms that assemble into molecules, which assemble into proteins, into organelles, into cells, into tissues, into organs, into systems, into humans, into teams, into… companies.",
      "Holy fucking shit, everything is a company.",
      "I see now, writing this all down, that the logic that ensued is a bit unfounded, but the point is that I realized that organization is emergent and that attention really is everything. So now we come to the concept of the beacon. I realized that all systems are organized around certain beacons, and the members of those systems answer to the beacons' pings and, in return, are buffed by them, whether through energy, capital, purpose, status, etc. So I concluded that to build a great company, I would have to build a wonderful beacon that would ping as many people as possible.",
      "Today, I had a conversation with someone from FR8 about the goal of education. We both agreed that in an ideal world, education allows people to find their beacon: to defeat the wither and gather enough understanding to start building out the base. And that, in order to allow young people to bend reality in their image, we must enable as many beacons as possible. He told me that he was looking for young people with crazy ideas, “the crazier the better,” he says. It seemed ridiculous to me that anyone really young would be able to know for sure what they wanted, and I guess I was just a bit jaded from my misguided conviction, but after a bit of back and forth, I believe his hypothesis is worth a shot.",
      "The beacon itself is nothing without a base. I suppose that’s the whole point. It doesn’t really matter what your first layer is made of; it could be netherite, but functionally it will provide the same utility as nine blocks of iron. But if you stick with it and build a four-layer beacon from iron, you can gradually rebuild it with better ore - OR you can add more beacons with less ore!",
      "The way I understand it, in the past I’ve hastily built one-layer beacons and found security in knowing I had the beacon in place. It turns out that one-layer beacons, no matter what the material, are still very easily accessible by creepers, and the beacon block itself is not durable at all.",
      "The realization here is that I would like to spend some time really building out my beacon; I would like to max it out and be truly great at something I commit to. Maybe then, my beacon can also buff other players who choose to join me on my quest. I think that would be quite cool!",
    ].join("\n\n"),
  },
];

/* ---------------------------------------------------------------------------
   Body parsing — a post body is plain text: blank lines split paragraphs, a
   paragraph that starts with an image URL renders as the image (any lines
   under the URL in the same paragraph are its caption), and chunks with a
   leading marker become structured blocks: "# "/"## " headings, "- "/"* "/
   "1. " lists, "> " blockquotes, ``` fenced code, "---" rules. Parsed here
   so the server page and the inline editor agree on the format.
   ------------------------------------------------------------------------- */

export type PostBlock =
  | { kind: "text"; text: string }
  // "# " is the section heading (level 2 — the page title is the only h1);
  // "## " and deeper collapse to a level-3 subheading (the site has two
  // in-body heading styles).
  | { kind: "heading"; level: 2 | 3; text: string }
  // Width in px (owner-resized; omitted = natural size, capped to the column).
  // `darkSrc`: the dark-theme variant (a second image URL line under the
  // first). Caption: any lines under the URL(s) within the same paragraph.
  | {
      kind: "image";
      src: string;
      darkSrc?: string;
      width?: number;
      caption?: string;
    }
  // A line that is just a video URL — renders as a silent looping clip (a GIF
  // stand-in). Caption works the same as images.
  | { kind: "video"; src: string; caption?: string }
  // Consecutive "- "/"* " (unordered) or "1. " (ordered) lines. A numbered
  // item in its own paragraph keeps its number via `start`, so the "1." /
  // "2." style with blank lines between items renders correctly.
  | { kind: "list"; ordered: boolean; start: number; items: string[] }
  | { kind: "quote"; text: string }
  // A ``` fenced chunk, verbatim (blank lines inside don't split it).
  | { kind: "code"; code: string }
  // "---" on its own paragraph.
  | { kind: "rule" };

// An image URL: absolute, root-relative (a file under /public), or an
// owner-uploaded image served from /api/images/[name] (see `lib/post-store`).
// Shared with the marginalia note renderer, which uses the same convention.
export const IMAGE_URL =
  /^((https?:\/\/|\/)\S+\.(png|jpe?g|gif|webp|avif|svg)(\?\S*)?|\/api\/images\/[\w.-]+)$/i;

// A video URL: same conventions as IMAGE_URL, for formats <video> can play.
export const VIDEO_URL = /^(https?:\/\/|\/)\S+\.(mp4|webm|mov)(\?\S*)?$/i;

// A body's paragraphs (text chunks and image lines), split on blank lines —
// except inside ``` fences, where blank lines belong to the code. The inline
// editors round-trip bodies through this same split.
export function splitChunks(body: string): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  const flush = () => {
    const chunk = current.join("\n").trim();
    if (chunk) chunks.push(chunk);
    current = [];
  };
  for (const line of body.split("\n")) {
    const fence = line.trim().startsWith("```");
    if (inFence) {
      current.push(line);
      if (fence) {
        inFence = false;
        flush();
      }
      continue;
    }
    if (fence) {
      flush();
      current.push(line);
      inFence = true;
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    current.push(line);
  }
  flush();
  return chunks;
}

// An image paragraph: the URL on its own line, optionally followed by a pixel
// width ("<url> 420") written by the inline resize handles. A second image
// URL line right under the first is the dark-theme variant. Lines under the
// URL(s) within the same paragraph are the image's caption.
export function parseImageChunk(
  chunk: string,
): { src: string; darkSrc?: string; width?: number; caption?: string } | null {
  const [first, ...rest] = chunk.trim().split("\n");
  const match = first.trim().match(/^(\S+)(?:\s+(\d+))?$/);
  if (!match || !IMAGE_URL.test(match[1])) return null;
  const darkSrc =
    rest.length && IMAGE_URL.test(rest[0].trim())
      ? rest.shift()!.trim()
      : undefined;
  const caption = rest.join(" ").replace(/\s+/g, " ").trim();
  return {
    src: match[1],
    ...(darkSrc && { darkSrc }),
    width: match[2] ? Number(match[2]) : undefined,
    ...(caption && { caption }),
  };
}

// A video paragraph: the URL on its own line; lines under it are the caption.
export function parseVideoChunk(
  chunk: string,
): { src: string; caption?: string } | null {
  const [first, ...rest] = chunk.trim().split("\n");
  if (!VIDEO_URL.test(first.trim())) return null;
  const caption = rest.join(" ").replace(/\s+/g, " ").trim();
  return { src: first.trim(), ...(caption && { caption }) };
}

// A heading paragraph: one or more #s, a space, then the heading text.
const HEADING_CHUNK = /^(#+)\s+(.*)$/;

// A list line: "- ", "* ", or "1. " (the number is kept for ordered starts).
const LIST_LINE = /^([-*]|\d+\.)\s+(.*)$/;

// A fenced code chunk: the opening ``` (with an optional, ignored language
// tag) on the first line, verbatim lines after, an optional closing fence
// (an unclosed fence runs to the end of the chunk).
function parseCodeChunk(chunk: string): { code: string } | null {
  if (!chunk.startsWith("```")) return null;
  const lines = chunk.split("\n");
  let rest = lines.slice(1);
  if (rest.length && rest[rest.length - 1].trim() === "```") {
    rest = rest.slice(0, -1);
  }
  return { code: rest.join("\n") };
}

// A list chunk: the first line is a list item; further item lines start new
// items, and any non-item line continues the previous item (soft wrap).
function parseListChunk(
  chunk: string,
): { ordered: boolean; start: number; items: string[] } | null {
  const lines = chunk.split("\n").map((line) => line.trim());
  const first = lines[0].match(LIST_LINE);
  if (!first) return null;
  const ordered = first[1] !== "-" && first[1] !== "*";
  const items: string[] = [];
  for (const line of lines) {
    const item = line.match(LIST_LINE);
    if (item) items.push(item[2]);
    else if (items.length) items[items.length - 1] += ` ${line}`;
  }
  return { ordered, start: ordered ? parseInt(first[1], 10) : 1, items };
}

export function postBlocks(body: string): PostBlock[] {
  return splitChunks(body).map((chunk): PostBlock => {
    const code = parseCodeChunk(chunk);
    if (code) return { kind: "code", ...code };
    const image = parseImageChunk(chunk);
    if (image) return { kind: "image", ...image };
    const video = parseVideoChunk(chunk);
    if (video) return { kind: "video", ...video };
    if (/^-{3,}$/.test(chunk)) return { kind: "rule" };
    const list = parseListChunk(chunk);
    if (list) return { kind: "list", ...list };
    if (chunk.startsWith(">")) {
      // Each "> " line is its own line in the quote — join with newlines (and
      // collapse only within-line whitespace) so multi-line quotes keep their
      // breaks. The blockquote renders with whitespace-pre-line.
      const text = chunk
        .split("\n")
        .map((line) => line.trim().replace(/^>\s?/, "").replace(/\s+/g, " "))
        .join("\n")
        .trim();
      return { kind: "quote", text };
    }
    const text = chunk.replace(/\s*\n\s*/g, " ");
    const heading = text.match(HEADING_CHUNK);
    if (heading) {
      return {
        kind: "heading",
        level: heading[1].length === 1 ? 2 : 3,
        text: heading[2],
      };
    }
    return { kind: "text", text };
  });
}

/* ---------------------------------------------------------------------------
   Inline formatting — a small tokenizer over a paragraph's text: **bold**,
   *italic*, ***both*** (nesting works), ~~strike~~, `code`, [text](url)
   links, and bare URLs. Markers are stripped for visitors; an unmatched
   marker is left as literal text. Output is a flat list of styled segments
   whose `text` is exactly what renders, so highlight annotations (which
   match against rendered text) keep working per segment.
   ------------------------------------------------------------------------- */

export type TextSegment = {
  // The visible text (for a link, the label).
  text: string;
  bold: boolean;
  italic: boolean;
  strike: boolean;
  code: boolean;
  // Link destination, when the segment is (part of) a link's label.
  href?: string;
};

type InlineStyle = {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  href?: string;
};

// Sticky (position-anchored) matchers for links and bare URLs.
const LINK_AT = /\[([^\]]+)\]\((\S+?)\)/y;
const BARE_URL_AT = /https?:\/\/[^\s]+/y;
// Punctuation that's likely sentence-ending rather than part of a bare URL
// (mirrors the marginalia note convention in `lib/notes`).
const URL_TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

// The closing star run for an opener of length `n`: the first run of exactly
// n stars; failing that, the LAST n stars of the final (longer) run, so a
// merged closer like the "***" in "**bold *it***" closes both markers — the
// leftover leading stars stay in the content as the inner closer. Returns
// where the emphasized content ends and where scanning resumes, or null when
// the opener has no closer (the opener then stays literal).
function findCloser(
  text: string,
  n: number,
  from: number,
): { end: number; resume: number } | null {
  const runs: [start: number, length: number][] = [];
  let i = from;
  while (i < text.length) {
    if (text[i] === "*") {
      let j = i;
      while (text[j] === "*") j++;
      runs.push([i, j - i]);
      i = j;
    } else {
      i++;
    }
  }
  const exact = runs.find(([, length]) => length === n);
  if (exact) return { end: exact[0], resume: exact[0] + n };
  const last = runs[runs.length - 1];
  if (last && last[1] > n) {
    const [start, length] = last;
    return { end: start + length - n, resume: start + length };
  }
  return null;
}

function parseInline(
  text: string,
  style: InlineStyle,
  out: TextSegment[],
): void {
  const push = (t: string, code = false) => {
    if (!t) return;
    out.push({
      text: t,
      bold: style.bold,
      italic: style.italic,
      strike: style.strike,
      code,
      ...(style.href && { href: style.href }),
    });
  };

  let cursor = 0;
  let plain = 0; // start of the pending unstyled run
  while (cursor < text.length) {
    const ch = text[cursor];

    // `code` — verbatim content, no nesting inside.
    if (ch === "`") {
      const close = text.indexOf("`", cursor + 1);
      if (close > cursor + 1) {
        push(text.slice(plain, cursor));
        push(text.slice(cursor + 1, close), true);
        cursor = plain = close + 1;
        continue;
      }
    }

    // * / ** / *** emphasis — matching closer required, nesting allowed.
    if (ch === "*") {
      let run = 1;
      while (text[cursor + run] === "*") run++;
      const n = Math.min(run, 3);
      const closer = findCloser(text, n, cursor + run);
      if (closer && closer.end > cursor + run) {
        push(text.slice(plain, cursor));
        parseInline(
          text.slice(cursor + n, closer.end),
          {
            ...style,
            bold: style.bold || n >= 2,
            italic: style.italic || n % 2 === 1,
          },
          out,
        );
        cursor = plain = closer.resume;
        continue;
      }
      cursor += run; // unmatched run stays literal
      continue;
    }

    // ~~strike~~
    if (ch === "~" && text[cursor + 1] === "~") {
      const close = text.indexOf("~~", cursor + 2);
      if (close > cursor + 2) {
        push(text.slice(plain, cursor));
        parseInline(text.slice(cursor + 2, close), { ...style, strike: true }, out);
        cursor = plain = close + 2;
        continue;
      }
      cursor += 2;
      continue;
    }

    // [label](url) — the label is parsed for nested styling.
    if (ch === "[") {
      LINK_AT.lastIndex = cursor;
      const match = LINK_AT.exec(text);
      if (match) {
        push(text.slice(plain, cursor));
        parseInline(match[1], { ...style, href: match[2] }, out);
        cursor = plain = cursor + match[0].length;
        continue;
      }
    }

    // Bare URL at a word boundary — displayed without the protocol noise.
    if (
      ch === "h" &&
      (cursor === 0 || /[\s(]/.test(text[cursor - 1])) &&
      (text.startsWith("http://", cursor) || text.startsWith("https://", cursor))
    ) {
      BARE_URL_AT.lastIndex = cursor;
      const match = BARE_URL_AT.exec(text)!;
      const href = match[0].replace(URL_TRAILING_PUNCTUATION, "");
      push(text.slice(plain, cursor));
      out.push({
        text: href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
        bold: style.bold,
        italic: style.italic,
        strike: style.strike,
        code: false,
        href,
      });
      cursor = plain = cursor + href.length;
      continue;
    }

    cursor++;
  }
  push(text.slice(plain));
}

export function textSegments(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  parseInline(text, { bold: false, italic: false, strike: false }, out);
  return out;
}

// The text as visitors see it — formatting markers removed.
export function stripMarkers(text: string): string {
  return textSegments(text)
    .map((s) => s.text)
    .join("");
}

// The first text paragraph, for previews (formatting markers stripped).
export function postExcerpt(body: string): string | undefined {
  const block = postBlocks(body).find((b) => b.kind === "text");
  return block?.kind === "text" ? stripMarkers(block.text) : undefined;
}

// "2026-07-01" -> "July 1, 2026".
export function formatPostDate(post: Post): string {
  const [year, month, day] = post.date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
