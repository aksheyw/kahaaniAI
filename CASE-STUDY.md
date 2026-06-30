# Kahaani AI — a case study

**The bet:** the bottleneck in Indian audio content is not ideas or distribution, it is the days and the cost of getting a publishable script written, so I built a proof of concept that turns a topic choice and a language into three publication-ready audio scripts in about ninety seconds, for roughly two rupees instead of the two thousand a freelancer would charge. I built it in four days, and it is a working product you can open and run, not a slide.

## The problem
A content team in India that wants to test a new show or format pays a freelancer somewhere around two thousand rupees per script and waits two to three days, which means every experiment is slow and expensive enough that most never get tried. If the script itself could be near-free and near-instant, the constraint moves from "can we afford to try this" to "what should we try", and that is a much better problem to have.

## The decisions that mattered most
The first was splitting the work across two agents rather than one, because a single prompt that picks topics and writes scripts in one pass produces shallow output, so I separated a Research agent that chooses the three highest-potential topics out of about thirty trending items from a Writer agent that turns each into an eight-hundred to twelve-hundred word script and scores its own confidence, and the quality difference was immediate.

The second was a trust decision rather than a quality one, because the cost comparison is the headline of the whole thing and it would have been easy to print a clean impressive number, but the estimate carries a real plus-or-minus fifteen percent variance, so I show the savings alongside an honest confidence badge and a footnote that explains the window, since a number a buyer can trust is worth more than one that merely looks good.

The third was making sure the demo never dead-ends, so when the live feeds return too little the pipeline falls through to fifteen curated topics, because the worst possible moment for a blank screen is when someone is evaluating you.

## What I deliberately left out
It is a four-day proof of concept and I kept it to exactly that, a sharp demonstration of the cost-and-speed argument rather than a half-built platform, so there is no audio rendering, no accounts, and no library, all of which would be the obvious next layer but none of which were needed to prove the point.

## What I'd do next
The natural progression is turning the script into finished audio with a text-to-speech pass, adding a workspace so a team can keep and reuse what they generate, and instrumenting which generated scripts actually get used so topic selection learns from real outcomes rather than trending signals alone.

---

*Built by [Akshey Walia](https://www.linkedin.com/in/aksheywalia/). The product: [kahaaniAI](https://github.com/aksheyw/kahaaniAI) · [live demo](https://kahaani-ai-livid.vercel.app).*
