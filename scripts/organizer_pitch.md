# Talk Proposal

## Title

**Evals for AI Agents: How to Stop Shipping on Vibes**

## Format

- **Duration:** 60 minutes preferred (workshop-style: ~55 min content + 5 min Q&A). Can compress to 45 min if needed.
- **Format:** Workshop-style technical talk — heavy on live examples, real traces, code snippets, and short pre-recorded demos. Roughly 60% narrative, 40% concrete code/demo time.
- **Track fit:** AI engineering / applied ML / developer tools

## Target audience

Working software engineers who are building or about to build LLM-powered features and AI agents. Familiarity with LLM APIs is helpful but not required. No ML background assumed.

## Abstract

AI agents fail in ways that traditional software doesn't — and the testing practices we've spent decades refining were never designed for systems that produce different outputs to the same input. This is a workshop-style talk: heavy on live examples, real traces, and code attendees can take home.

Using a **repo-aware coding agent** as the running example throughout, I'll walk the audience through the five pillars every team should measure (task success, trajectory, tool use, safety, cost/latency), how to instrument an agent so failures are debuggable, how to wire evals into CI, and — the killer use case — how to upgrade models and prompts confidently without breaking your product.

The talk includes six short demos: a real failure trace, a pillar-by-pillar grader walkthrough, a `pytest`-style eval suite running in CI, and a side-by-side model-upgrade comparison showing how evals turn "should we switch to the new model?" from a guess into a 10-minute decision.

Attendees leave with a Monday-morning checklist, the code patterns shown in the talk, and the demo videos to do this on their own agent the day they get back.

## What attendees will learn

1. Why standard testing breaks down for non-deterministic AI systems — and what to do about it.
2. The five pillars of agent evaluation and how to measure each in code.
3. How to instrument an agent with tracing so every failure is debuggable in seconds.
4. A practical playbook: error analysis → dataset → graders → CI → production loop.
5. How to design and calibrate LLM-as-judge graders that you can actually trust.
6. **How to upgrade models and prompts confidently using evals as your guardrail** — the highest-ROI use case for any team building on LLMs.

## Outline (60-min workshop format)

| # | Section | Time |
|---|---|---|
| 1 | Cold open + the "deleted assertion" demo | 4 min |
| 2 | Why evals matter — non-determinism, high-dimensional failure, vibes don't scale | 4 min |
| 3 | What an eval actually is + first live trace | 5 min |
| 4 | The five pillars + grader code demos | 10 min |
| 5 | Tracing & debugging — the foundation | 7 min |
| 6 | Build the eval suite — workshop walkthrough | 12 min |
| 7 | Model & prompt regression — the killer demo | 8 min |
| 8 | Pitfalls & hot takes | 3 min |
| 9 | Maturity model + Monday-morning checklist | 2 min |
| — | Q&A | 5 min |

*If a 45-minute slot is required, the workshop content compresses cleanly by trimming demos in Sections 4 and 6, and dropping one sub-pattern in Section 7.*

## Why this talk, why now

Every team I talk to is shipping LLM features faster than they're learning to measure them. The model frontier moves every 8 weeks, but most teams can't re-evaluate quickly enough to take advantage — they're stuck on the model they shipped with. Evals (and the tracing that makes them possible) are how that changes. This workshop gives engineers the mental model, the concrete code patterns, and the demos to build that capability the week they get home.

## About the speaker

*[Your name]*
*[One or two lines: role, company, a relevant credential — e.g., "Building a coding agent at X" or "Previously shipped LLM features at Y."]*
*[Twitter / LinkedIn / website / past talks if any]*

## Logistics

- **A/V needs:** HDMI/USB-C for laptop, lavalier mic preferred for stage movement
- **Recording:** Happy to be recorded and have the talk published
- **Slides + code:** Will be shared with attendees as a takeaway repo (grader snippets, sample eval runner, OTel instrumentation example) after the event
